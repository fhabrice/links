<?php
/**
 * LK-TECH — routeur de l'API (version PHP).
 *
 * Reprend exactement le même contrat que la version Node.js : les fichiers
 * du site (assets/js/site.js et admin/admin.js) sont identiques et fonctionnent
 * avec les deux backends.
 *
 * Aucune route ne réclame de coordonnées de base de données : la persistance
 * est entièrement prise en charge par Store.php.
 *
 * @package LK-TECH
 */

declare(strict_types=1);

final class Api
{
    private Store $store;
    private Auth $auth;
    private string $racine;

    public function __construct(Store $store, Auth $auth, string $racine)
    {
        $this->store = $store;
        $this->auth = $auth;
        $this->racine = rtrim($racine, '/');
    }

    /**
     * Traite une requête et renvoie la réponse à émettre.
     *
     * @return array{code:int, corps:mixed, entetes:array<string,string>}
     */
    public function traiter(string $methode, string $chemin, array $corps = []): array
    {
        $methode = strtoupper($methode);
        $chemin = '/' . trim($chemin, '/');

        /* ============================== PUBLIC ============================== */

        if ($chemin === '/api/health' && $methode === 'GET') {
            return $this->reponse(['statut' => 'ok', 'pilote' => $this->store->pilote(), 'horodatage' => date('c')]);
        }

        if ($chemin === '/api/site' && $methode === 'GET') {
            $contenu = $this->store->contenu();
            $reglages = $this->store->reglages();

            $contenu['produits'] = array_values(array_filter(
                $contenu['produits'] ?? [],
                static fn (array $produit): bool => ($produit['actif'] ?? true) !== false
            ));

            return $this->reponse([
                'contenu' => $contenu,
                'reglages' => [
                    'devise' => $reglages['devise'] ?? 'USD',
                    'portailClientActif' => ($reglages['portailClientActif'] ?? true) !== false,
                    'maintenance' => ($reglages['maintenance'] ?? false) === true,
                ],
            ], 200, ['Cache-Control' => 'no-store']);
        }

        if ($chemin === '/api/contact' && $methode === 'POST') {
            $message = [
                'nom' => nettoyer($corps['nom'] ?? '', 120),
                'email' => nettoyer($corps['email'] ?? '', 160),
                'telephone' => nettoyer($corps['telephone'] ?? '', 40),
                'sujet' => nettoyer($corps['sujet'] ?? '', 140) ?: 'Demande via le site',
                'message' => nettoyer($corps['message'] ?? '', 4000),
            ];

            if ($message['nom'] === '' || !email_valide($message['email']) || mb_strlen($message['message']) < 5) {
                return $this->reponse(['erreur' => 'Merci de renseigner votre nom, un e-mail valide et un message.'], 400);
            }

            $enregistre = $this->store->ajouterMessage($message);
            $this->store->journaliser('message-rec', ['id' => $enregistre['id'], 'email' => $message['email']]);

            return $this->reponse(['ok' => true, 'id' => $enregistre['id'], 'message' => 'Message enregistré.'], 201);
        }

        /* ========================= AUTHENTIFICATION ========================= */

        if ($chemin === '/api/admin/login' && $methode === 'POST') {
            $resultat = $this->auth->connecter(
                nettoyer($corps['identifiant'] ?? '', 80),
                (string) ($corps['motDePasse'] ?? '')
            );

            if (!$resultat['ok']) {
                return $this->reponse(['erreur' => $resultat['message'] ?? 'Connexion impossible.'], 401);
            }

            $utilisateur = $resultat['utilisateur'];

            return $this->reponse(
                [
                    'ok' => true,
                    'utilisateur' => [
                        'identifiant' => $utilisateur['identifiant'],
                        'role' => $utilisateur['role'] ?? 'proprietaire',
                    ],
                ],
                200,
                ['Set-Cookie' => $this->auth->enteteSession((string) $resultat['jeton'])]
            );
        }

        /* ---- À partir d'ici, une session valide est nécessaire ---- */
        $utilisateur = str_starts_with($chemin, '/api/admin/') ? $this->auth->utilisateur() : null;

        if ($chemin === '/api/admin/session' && $methode === 'GET') {
            return $this->reponse([
                'connecte' => $utilisateur !== null,
                'utilisateur' => $utilisateur ? [
                    'identifiant' => $utilisateur['identifiant'],
                    'role' => $utilisateur['role'] ?? 'proprietaire',
                ] : null,
            ]);
        }

        if ($chemin === '/api/admin/logout' && $methode === 'POST') {
            return $this->reponse(['ok' => true], 200, ['Set-Cookie' => $this->auth->enteteDeconnexion()]);
        }

        if (str_starts_with($chemin, '/api/admin/') && $utilisateur === null) {
            return $this->reponse(['erreur' => 'Session expirée. Reconnectez-vous.'], 401);
        }

        /* ========================= TABLEAU DE BORD ========================= */

        if ($chemin === '/api/admin/state' && $methode === 'GET') {
            $messages = $this->store->messages();

            return $this->reponse([
                'contenu' => $this->store->contenu(),
                'reglages' => $this->store->reglages(),
                'stats' => $this->store->statistiques(),
                'messages' => array_slice($messages, 0, 50),
                'pilote' => $this->store->pilote(),
            ]);
        }

        if ($chemin === '/api/admin/contenu' && $methode === 'PUT') {
            $actuel = $this->store->contenu();
            $nouveau = $corps['contenu'] ?? $corps;
            $fusionne = fusionner($actuel, is_array($nouveau) ? $nouveau : []);
            $enregistre = $this->store->ecrireContenu($fusionne);
            $this->store->journaliser('contenu-modifie', ['utilisateur' => $utilisateur['identifiant'] ?? '']);

            return $this->reponse(['ok' => true, 'contenu' => $enregistre]);
        }

        if ($chemin === '/api/admin/reglages' && $methode === 'PUT') {
            $enregistre = $this->store->ecrireReglages($corps['reglages'] ?? $corps);
            $this->store->journaliser('reglages-modifies', ['utilisateur' => $utilisateur['identifiant'] ?? '']);

            return $this->reponse(['ok' => true, 'reglages' => $enregistre]);
        }

        /* ============================ PRODUITS ============================= */

        if ($chemin === '/api/admin/produits' && $methode === 'POST') {
            $contenu = $this->store->contenu();
            $produit = [
                'id' => identifiant('p'),
                'nom' => nettoyer($corps['nom'] ?? '', 140) ?: 'Nouveau produit',
                'description' => nettoyer($corps['description'] ?? '', 600),
                'prix' => (float) ($corps['prix'] ?? 0),
                'devise' => nettoyer($corps['devise'] ?? 'USD', 8) ?: 'USD',
                'categorie' => ($corps['categorie'] ?? '') === 'intl' ? 'intl' : 'local',
                'filtre' => nettoyer($corps['filtre'] ?? '', 30),
                'badge' => nettoyer($corps['badge'] ?? '', 40),
                'image' => nettoyer($corps['image'] ?? '', 500),
                'stock' => (int) ($corps['stock'] ?? 0),
                'actif' => ($corps['actif'] ?? true) !== false,
            ];

            array_unshift($contenu['produits'], $produit);
            $this->store->ecrireContenu($contenu);
            $this->store->journaliser('produit-ajoute', ['id' => $produit['id']]);

            return $this->reponse(['ok' => true, 'produit' => $produit], 201);
        }

        if (str_starts_with($chemin, '/api/admin/produits/') && in_array($methode, ['PUT', 'DELETE'], true)) {
            $id = substr($chemin, strlen('/api/admin/produits/'));
            $contenu = $this->store->contenu();

            if ($methode === 'DELETE') {
                $contenu['produits'] = array_values(array_filter(
                    $contenu['produits'] ?? [],
                    static fn (array $produit): bool => ($produit['id'] ?? null) !== $id
                ));
                $this->store->ecrireContenu($contenu);
                $this->store->journaliser('produit-supprime', ['id' => $id]);

                return $this->reponse(['ok' => true]);
            }

            $produitModifie = null;
            foreach ($contenu['produits'] as $index => $produit) {
                if (($produit['id'] ?? null) === $id) {
                    $contenu['produits'][$index] = array_merge($produit, $corps);
                    $produitModifie = $contenu['produits'][$index];
                    break;
                }
            }

            if ($produitModifie === null) {
                return $this->reponse(['erreur' => 'Produit introuvable.'], 404);
            }

            $this->store->ecrireContenu($contenu);
            $this->store->journaliser('produit-modifie', ['id' => $id]);

            return $this->reponse(['ok' => true, 'produit' => $produitModifie]);
        }

        /* ========================= SERVICES / ÉTAPES ======================= */

        if ($chemin === '/api/admin/services' && $methode === 'PUT') {
            $contenu = $this->store->contenu();
            if (isset($corps['services']) && is_array($corps['services'])) {
                $contenu['services'] = $corps['services'];
            }
            $this->store->ecrireContenu($contenu);

            return $this->reponse(['ok' => true, 'services' => $contenu['services']]);
        }

        /* ============================= MESSAGES ============================ */

        if ($chemin === '/api/admin/messages' && $methode === 'GET') {
            return $this->reponse(['messages' => $this->store->messages()]);
        }

        if (str_starts_with($chemin, '/api/admin/messages/')) {
            $id = substr($chemin, strlen('/api/admin/messages/'));

            if ($methode === 'PATCH') {
                $message = $this->store->marquerMessage($id, ($corps['lu'] ?? true) !== false);
                return $this->reponse(['ok' => true, 'message' => $message]);
            }

            if ($methode === 'DELETE') {
                $this->store->supprimerMessage($id);
                return $this->reponse(['ok' => true]);
            }
        }

        /* ============================= UPLOADS ============================= */

        if ($chemin === '/api/admin/upload' && $methode === 'POST') {
            $chaine = (string) ($corps['dataUrl'] ?? '');

            if (!preg_match('#^data:(image/(png|jpeg|jpg|webp|svg\+xml|gif));base64,(.+)$#is', $chaine, $correspondance)) {
                return $this->reponse(['erreur' => 'Image invalide (PNG, JPG, WEBP, SVG ou GIF attendu).'], 400);
            }

            $donnees = base64_decode($correspondance[3], true);
            if ($donnees === false) {
                return $this->reponse(['erreur' => 'Image illisible.'], 400);
            }

            if (strlen($donnees) > 4 * 1024 * 1024) {
                return $this->reponse(['erreur' => "L'image dépasse 4 Mo."], 413);
            }

            $extension = str_replace(['jpeg', 'svg+xml'], ['jpg', 'svg'], strtolower($correspondance[2]));
            $nom = 'img-' . time() . '-' . bin2hex(random_bytes(4)) . '.' . $extension;
            $cible = $this->store->dossierUploads() . '/' . $nom;

            if (@file_put_contents($cible, $donnees) === false) {
                return $this->reponse(['erreur' => "Impossible d'enregistrer l'image (droits du dossier uploads)."], 500);
            }

            $this->store->journaliser('image-televersee', ['nom' => $nom]);

            return $this->reponse(['ok' => true, 'url' => base_url() . '/uploads/' . $nom], 201);
        }

        /* ====================== MOT DE PASSE / EXPORT ====================== */

        if ($chemin === '/api/admin/mot-de-passe' && $methode === 'POST') {
            $resultat = $this->auth->changerMotDePasse(
                $utilisateur,
                (string) ($corps['actuel'] ?? ''),
                (string) ($corps['nouveau'] ?? '')
            );

            return $resultat['ok']
                ? $this->reponse(['ok' => true, 'message' => $resultat['message']])
                : $this->reponse(['erreur' => $resultat['message']], 400);
        }

        if ($chemin === '/api/admin/export' && $methode === 'GET') {
            return $this->reponse(
                [
                    'exporteLe' => date('c'),
                    'contenu' => $this->store->contenu(),
                    'reglages' => $this->store->reglages(),
                    'messages' => $this->store->messages(),
                ],
                200,
                ['Content-Disposition' => 'attachment; filename="linksmartec-export.json"']
            );
        }

        if ($chemin === '/api/admin/reinitialiser' && $methode === 'POST') {
            $defauts = lire_json($this->racine . '/app/defaults.json', ['contenu' => [], 'reglages' => []]);
            $contenu = $this->store->ecrireContenu((array) ($defauts['contenu'] ?? []));
            $this->store->ecrireReglages((array) ($defauts['reglages'] ?? []));
            $this->store->journaliser('contenu-reinitialise', ['utilisateur' => $utilisateur['identifiant'] ?? '']);

            return $this->reponse(['ok' => true, 'contenu' => $contenu]);
        }

        return $this->reponse(['erreur' => 'Route API inconnue.'], 404);
    }

    /**
     * @param mixed $corps
     * @param array<string,string> $entetes
     * @return array{code:int, corps:mixed, entetes:array<string,string>}
     */
    private function reponse($corps, int $code = 200, array $entetes = []): array
    {
        return ['code' => $code, 'corps' => $corps, 'entetes' => $entetes];
    }
}
