<?php
declare(strict_types=1);

final class UtilisateurAuth
{
    private const COOKIE = 'lm_user';
    private const DUREE = 2592000; // 30 jours

    private Store $store;
    public function __construct(Store $store) { $this->store = $store; }

    public function utilisateur(): ?array
    {
        $jeton = $_COOKIE[self::COOKIE] ?? '';
        if (!$jeton) return null;
        $data = $this->verifierJeton($jeton);
        if (!$data) return null;
        return $this->store->trouverUtilisateurParId($data['sub'] ?? '');
    }

    public function creerSession(array $user): string
    {
        $payload = base64_encode(json_encode(['sub'=>$user['id'],'email'=>$user['email'],'exp'=>time()+self::DUREE]));
        $sig = hash_hmac('sha256', $payload, $this->secret(), true);
        return $payload.'.'. rtrim(strtr(base64_encode($sig), '+/', '-_'), '=');
    }

    public function enteteConnexion(array $user): string
    {
        $jeton = $this->creerSession($user);
        return $this->enteteCookie($jeton, time()+self::DUREE);
    }
    public function enteteDeconnexion(): string { return $this->enteteCookie('', time()-3600); }

    private function verifierJeton(string $jeton): ?array
    {
        if (substr_count($jeton,'.')!==1) return null;
        [$corps,$sig] = explode('.',$jeton,2);
        $attendu = rtrim(strtr(base64_encode(hash_hmac('sha256',$corps,$this->secret(),true)),'+/','-_'), '=');
        if (!hash_equals($attendu,$sig)) return null;
        $data = json_decode(base64_decode($corps), true);
        if (!$data || ($data['exp']??0) < time()) return null;
        return $data;
    }
    private function enteteCookie(string $val, int $exp): string
    {
        $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS']!=='off') ? '; Secure' : '';
        return sprintf('%s=%s; Path=/; Expires=%s; HttpOnly; SameSite=Lax%s', self::COOKIE, $val, gmdate('D, d M Y H:i:s T',$exp), $secure);
    }
    private function secret(): string
    {
        // Réutilise le secret admin (fichier ou env)
        $f = lk_store()->dossierData() . '/.secret';
        if (is_file($f)) return trim(file_get_contents($f));
        $s = bin2hex(random_bytes(32)); @file_put_contents($f,$s); return $s;
    }
}
