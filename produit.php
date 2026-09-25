<?php
/**
 * LK-TECH (Linksmartech) — fiche produit
 * Adresse : /produit/{slug} (réécrit vers ce fichier, voir .htaccess à la racine).
 * Le produit est identifié par son identifiant interne, son slug personnalisé
 * ou le slug déduit de son nom — aucune configuration n'est nécessaire.
 *
 * @package LK-TECH
 */

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

$base = base_url();
$contenu = lk_store()->contenu();
$identite = $contenu['identite'] ?? [];
$reglages = lk_store()->reglages();

/** Préfixe les chemins d'image internes (/uploads/…, /assets/…) avec la base. */
$url_image = static function (string $chemin) use ($base): string {
    $chemin = trim($chemin);
    if ($chemin === '' || str_starts_with($chemin, 'http://') || str_starts_with($chemin, 'https://') || str_starts_with($chemin, 'data:')) {
        return $chemin;
    }

    return $base . '/' . ltrim($chemin, '/');
};

/** Origine du site pour les URL absolues (SEO, Open Graph, JSON-LD). */
$origine = 'https://' . preg_replace('#^https?://#i', '', rtrim((string) ($identite['siteWeb'] ?? 'www.linksmartec.com'), '/'));
if (!filter_var((string) $origine, FILTER_VALIDATE_URL)) {
    $origine = 'https://www.linksmartec.com';
}

/* ------------------- quel produit est demandé ? ------------------- */

$segment = trim((string) ($_GET['slug'] ?? ''));
if ($segment === '') {
    // Sans réécriture d'URL : on lit le segment directement dans l'adresse.
    $uri = (string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH);
    if ($base !== '' && str_starts_with($uri, $base)) {
        $uri = substr($uri, strlen($base));
    }
    if (preg_match('#^/produit/([^/?]+)#', $uri, $correspondances)) {
        $segment = rawurldecode($correspondances[1]);
    }
}
$segment = trim($segment, "/ \t\n\r");

$produits = array_values(array_filter(
    $contenu['produits'] ?? [],
    static fn (array $p): bool => ($p['actif'] ?? true) !== false
));

$produit = $segment !== '' ? trouver_produit($produits, $segment) : null;

if ($produit === null) {
    http_response_code(404);
} else {
    /* ------------------ préparation des données ------------------ */

    $slug = slug_produit($produit);
    $libellesCategories = ['informatique' => 'Informatique', 'energie' => 'Énergie renouvelable', 'terroir' => 'Produit du terroir'];
    $libelleCategorie = $libellesCategories[$produit['filtre'] ?? ''] ?? (($produit['categorie'] ?? '') === 'intl' ? 'Solution internationale' : 'Produit national');

    $prixValeur = (float) ($produit['prix'] ?? 0);
    $prixFormate = '$' . number_format($prixValeur, 2, ',', ' ');
    $enStock = (int) ($produit['stock'] ?? 0) > 0;

    // Galerie : image principale puis images complémentaires, sans doublons.
    $galerie = [];
    foreach (array_merge([(string) ($produit['image'] ?? '')], (array) ($produit['images'] ?? [])) as $image) {
        $image = trim((string) $image);
        if ($image !== '' && !in_array($image, $galerie, true)) {
            $galerie[] = $image;
        }
    }

    // Description longue : un paragraphe par bloc de lignes.
    $texteLong = trim((string) str_replace("\r\n", "\n", (string) ($produit['descriptionLongue'] ?? '')));
    $paragraphes = $texteLong !== ''
        ? array_values(array_filter(array_map('trim', explode("\n", $texteLong)), static fn (string $p): bool => $p !== ''))
        : [];

    $specifications = [];
    foreach ((array) ($produit['specifications'] ?? []) as $specification) {
        $label = trim((string) (is_array($specification) ? ($specification['label'] ?? '') : ''));
        $valeur = trim((string) (is_array($specification) ? ($specification['valeur'] ?? '') : ''));
        if ($label !== '' || $valeur !== '') {
            $specifications[] = ['label' => $label, 'valeur' => $valeur];
        }
    }

    // Produits similaires : même spécialité, hors produit affiché.
    $similaires = array_values(array_filter(
        $produits,
        static fn (array $p): bool => ($p['id'] ?? '') !== ($produit['id'] ?? '')
            && (($p['filtre'] ?? $p['categorie'] ?? '') === ($produit['filtre'] ?? $produit['categorie'] ?? ''))
    ));
    $similaires = array_slice($similaires, 0, 4);

    // Description pour les moteurs (balise meta) : 160 caractères environ.
    $descriptionMeta = $paragraphes[0] ?? (string) ($produit['description'] ?? '');
    $descriptionMeta = mb_substr(preg_replace('/\s+/u', ' ', $descriptionMeta) ?? '', 0, 158);

    $imagePrincipale = $galerie[0] ?? '/assets/img/photo-manquante.svg';
    $lienCanonique = $origine . $base . '/produit/' . rawurlencode($slug);

    // Commande directe par WhatsApp, pré-remplie.
    $telephone = preg_replace('/[^\d]/', '', (string) ($identite['telephone'] ?? '')) ?? '';
    $messageWhatsApp = sprintf(
        'Bonjour %s, je suis intéressé(e) par « %s » (%s). Est-il disponible ?',
        (string) ($identite['nom'] ?? 'LK-TECH'),
        (string) ($produit['nom'] ?? ''),
        $prixFormate
    );
    $lienWhatsApp = $telephone !== ''
        ? 'https://wa.me/' . $telephone . '?text=' . rawurlencode($messageWhatsApp)
        : $base . '/#contact';

    // Données structurées : produit + fil d'Ariane.
    $imagesJsonLd = array_values(array_map(
        static fn (string $image): string => str_starts_with($image, 'http') ? $image : $origine . $url_image($image),
        $galerie
    ));
    $donneesProduit = [
        '@context' => 'https://schema.org',
        '@type' => 'Product',
        'name' => (string) ($produit['nom'] ?? ''),
        'description' => $descriptionMeta,
        'image' => $imagesJsonLd ?: [$origine . '/assets/img/photo-manquante.svg'],
        'sku' => (string) ($produit['id'] ?? ''),
        'brand' => ['@type' => 'Brand', 'name' => (string) ($identite['nom'] ?? 'LK-TECH')],
        'offers' => [
            '@type' => 'Offer',
            'url' => $lienCanonique,
            'price' => number_format($prixValeur, 2, '.', ''),
            'priceCurrency' => (string) ($produit['devise'] ?? 'USD'),
            'availability' => $enStock ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
            'itemCondition' => 'https://schema.org/NewCondition',
            'seller' => ['@type' => 'Organization', 'name' => (string) ($identite['nomComplet'] ?? ($identite['nom'] ?? 'LK-TECH'))],
        ],
    ];
    $donneesFilAriane = [
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => [
            ['@type' => 'ListItem', 'position' => 1, 'name' => 'Accueil', 'item' => $origine . $base . '/'],
            ['@type' => 'ListItem', 'position' => 2, 'name' => 'Boutique', 'item' => $origine . $base . '/#boutique'],
            ['@type' => 'ListItem', 'position' => 3, 'name' => (string) ($produit['nom'] ?? '')],
        ],
    ];
}

$nomSite = (string) ($identite['nomComplet'] ?? ($identite['nom'] ?? 'LK-TECH'));
$e = static fn ($texte): string => htmlspecialchars((string) $texte, ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
<?php if ($produit !== null): ?>
  <title><?= $e($produit['nom']) ?> | <?= $e($nomSite) ?> — Boutique</title>
  <meta name="description" content="<?= $e($descriptionMeta) ?>">
  <meta name="theme-color" content="#16233F">
  <meta property="og:title" content="<?= $e($produit['nom']) ?> — <?= $e($prixFormate) ?>">
  <meta property="og:description" content="<?= $e($descriptionMeta) ?>">
  <meta property="og:type" content="product">
  <meta property="og:url" content="<?= $e($lienCanonique) ?>">
  <meta property="og:site_name" content="<?= $e($nomSite) ?>">
<?php foreach (array_slice($imagesJsonLd, 0, 3) as $imageOgg): ?>
  <meta property="og:image" content="<?= $e($imageOgg) ?>">
<?php endforeach; ?>
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="<?= $e($lienCanonique) ?>">
  <script type="application/ld+json"><?= json_encode($donneesProduit, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>
  <script type="application/ld+json"><?= json_encode($donneesFilAriane, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?></script>
<?php else: ?>
  <title>Produit introuvable | <?= $e($nomSite) ?></title>
  <meta name="robots" content="noindex">
  <meta name="theme-color" content="#16233F">
<?php endif; ?>
  <link rel="icon" type="image/svg+xml" href="<?= $e($base) ?>/assets/img/favicon.svg" id="favicon">
  <link rel="apple-touch-icon" href="<?= $e($base) ?>/assets/img/logo.svg">
  <link rel="stylesheet" href="<?= $e($base) ?>/assets/css/styles.css">
</head>
<body>

  <div class="bandeau-info" id="bandeau-maintenance" hidden>
    Site en cours de maintenance — certaines fonctions peuvent être momentanément indisponibles.
  </div>

  <!-- ============================== TOPBAR ============================== -->
  <div class="topbar">
    <div class="conteneur topbar__inner">
      <span class="topbar__rccm" data-champ="rccm">RCCM : <?= $e($identite['rccm'] ?? '') ?></span>
      <div class="topbar__infos">
        <span data-champ="ville">📍 <?= $e($identite['ville'] ?? '') ?></span>
        <a class="topbar__tel" data-champ="telephone" data-lien="tel" href="tel:<?= $e(preg_replace('/[^\d+]/', '', (string) ($identite['telephone'] ?? ''))) ?>">📞 <?= $e($identite['telephone'] ?? '') ?></a>
      </div>
    </div>
  </div>

  <!-- =============================== ENTÊTE ============================= -->
  <header class="entete">
    <div class="conteneur entete__inner">
      <a class="marque" href="<?= $e($base) ?>/" aria-label="Accueil LK-TECH">
        <img class="marque__logo" id="logo-entete" src="<?= $e($base) ?>/assets/img/logo.svg" alt="Logo LK-TECH">
        <span class="marque__texte">
          <span class="marque__nom" id="nom-entete">LK<i class="tiret">-</i>TECH</span>
          <span class="marque__slogan" id="slogan-entete"><?= $e($identite['slogan'] ?? '') ?></span>
        </span>
      </a>

      <nav class="nav" id="nav">
        <a class="nav__lien" href="<?= $e($base) ?>/">Accueil</a>
        <a class="nav__lien" href="<?= $e($base) ?>/#specialites">Spécialités</a>
        <a class="nav__lien" href="<?= $e($base) ?>/#boutique" style="color:var(--primaire)">Boutique</a>
        <a class="nav__lien" href="<?= $e($base) ?>/#services">Services</a>
        <a class="nav__lien" href="<?= $e($base) ?>/a-propos">À propos</a>
        <a class="nav__lien" href="<?= $e($base) ?>/#contact">Contact</a>
      </nav>

      <div class="entete__actions">
        <button class="btn btn--fantome btn--petit panier-btn" id="btn-panier" aria-label="Ouvrir le panier">
          🛒 Panier
          <span class="panier-btn__compteur" id="panier-compteur" hidden>0</span>
        </button>
        <a class="btn btn--petit" id="btn-portail" href="<?= $e($base) ?>/#contact">Devis gratuit</a>
        <button class="burger" id="burger" aria-label="Ouvrir le menu" aria-expanded="false">☰</button>
      </div>
    </div>
  </header>

<?php if ($produit === null): ?>

  <!-- ========================= PRODUIT INTROUVABLE ====================== -->
  <section class="page-entete">
    <div class="conteneur">
      <nav class="fil-ariane" aria-label="Fil d'Ariane">
        <a href="<?= $e($base) ?>/">Accueil</a> <span aria-hidden="true">›</span> <a href="<?= $e($base) ?>/#boutique">Boutique</a>
      </nav>
      <h1 class="page-entete__titre">Ce produit est introuvable</h1>
      <p class="page-entete__texte">Il a peut-être été retiré de la boutique ou l'adresse est incorrecte. Retrouvez toute notre offre ci-dessous.</p>
    </div>
  </section>

  <section class="section">
    <div class="conteneur" style="text-align:center">
      <p style="font-size:4rem;margin:0">🔎</p>
      <p style="max-width:34rem;margin:0 auto 1.75rem;color:var(--ardoise-500)">Parcourez la boutique <?= $e($nomSite) ?> : matériel informatique, solutions solaires et produits du terroir du Kivu.</p>
      <a class="btn btn--accent" href="<?= $e($base) ?>/#boutique">Voir tous les produits</a>
    </div>
  </section>

<?php else: ?>

  <!-- ========================= EN-TÊTE DE PAGE ========================== -->
  <section class="page-entete">
    <div class="conteneur">
      <nav class="fil-ariane" aria-label="Fil d'Ariane">
        <a href="<?= $e($base) ?>/">Accueil</a> <span aria-hidden="true">›</span>
        <a href="<?= $e($base) ?>/#boutique">Boutique</a> <span aria-hidden="true">›</span>
        <span><?= $e($produit['nom']) ?></span>
      </nav>
      <p class="section__sur"><?= $e($libelleCategorie) ?></p>
      <h1 class="page-entete__titre"><?= $e($produit['nom']) ?></h1>
      <p class="page-entete__texte"><?= $e($produit['description']) ?></p>
    </div>
  </section>

  <!-- ============================ FICHE PRODUIT ========================= -->
  <section class="section">
    <div class="conteneur">
      <div class="produit-fiche" id="produit-fiche" data-id="<?= $e($produit['id']) ?>" data-ssr>

        <div class="galerie-produit">
          <img class="galerie-produit__principale" id="produit-image"
               src="<?= $e($url_image($imagePrincipale)) ?>" alt="<?= $e($produit['nom']) ?>">
<?php if (count($galerie) > 1): ?>
          <div class="galerie-produit__miniatures" id="produit-miniatures">
<?php foreach ($galerie as $index => $image): ?>
            <button type="button" class="galerie-produit__miniature<?= $index === 0 ? ' actif' : '' ?>"
                    data-miniature="<?= $e($url_image($image)) ?>" aria-label="Voir l'image <?= $index + 1 ?>">
              <img src="<?= $e($url_image($image)) ?>" alt="" loading="lazy">
            </button>
<?php endforeach; ?>
          </div>
<?php endif; ?>
        </div>

        <div class="produit-infos">
<?php if (trim((string) ($produit['badge'] ?? '')) !== ''): ?>
          <span class="produit-badge"><?= $e($produit['badge']) ?></span>
<?php endif; ?>
          <div class="produit-prix">
            <?= $e($prixFormate) ?>
            <span class="produit-prix__devise"><?= $e($produit['devise'] ?? 'USD') ?></span>
          </div>
          <div class="produit-etat <?= $enStock ? 'produit-etat--stock' : 'produit-etat--commande' ?>">
            <?= $enStock ? '● En stock — disponible immédiatement' : '◐ Sur commande — délai de 3 à 10 jours' ?>
          </div>

          <p class="produit-desc"><?= $e($produit['description']) ?></p>

          <div class="produit-actions">
            <button class="btn btn--accent" data-ajouter="<?= $e($produit['id']) ?>">🛒 Ajouter au panier</button>
            <a class="btn btn--fantome" id="produit-whatsapp" href="<?= $e($lienWhatsApp) ?>" target="_blank" rel="noopener">💬 Commander sur WhatsApp</a>
          </div>
          <p class="produit-note">Paiement à la livraison · Livraison et installation possibles à Goma et dans tout le Nord-Kivu.</p>

          <dl class="produit-meta">
            <div><dt>Référence</dt><dd><?= $e($produit['id']) ?></dd></div>
            <div><dt>Catégorie</dt><dd><?= $e($libelleCategorie) ?></dd></div>
<?php if ($specifications): ?>
            <div><dt>Garantie &amp; services</dt><dd>Suivi après-vente assuré par nos équipes</dd></div>
<?php endif; ?>
          </dl>
        </div>
      </div>
    </div>
  </section>

<?php if ($paragraphes): ?>
  <!-- ========================= DESCRIPTION LONGUE ======================= -->
  <section class="section section--gris">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">En détail</p>
        <h2 class="section__titre">Description</h2>
      </div>
      <div class="prose-produit">
<?php foreach ($paragraphes as $paragraphe): ?>
        <p><?= $e($paragraphe) ?></p>
<?php endforeach; ?>
      </div>
    </div>
  </section>
<?php endif; ?>

<?php if ($specifications): ?>
  <!-- ======================= CARACTÉRISTIQUES =========================== -->
  <section class="section">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Fiche technique</p>
        <h2 class="section__titre">Caractéristiques techniques</h2>
      </div>
      <table class="specs">
        <tbody>
<?php foreach ($specifications as $specification): ?>
          <tr>
            <th scope="row"><?= $e($specification['label']) ?></th>
            <td><?= $e($specification['valeur']) ?></td>
          </tr>
<?php endforeach; ?>
        </tbody>
      </table>
    </div>
  </section>
<?php endif; ?>

<?php if ($similaires): ?>
  <!-- ======================= PRODUITS SIMILAIRES ======================== -->
  <section class="section section--gris" id="similaires">
    <div class="conteneur">
      <div class="section__entete">
        <p class="section__sur">Dans la même catégorie</p>
        <h2 class="section__titre">Vous aimerez aussi</h2>
      </div>
      <div class="grille-produits">
<?php foreach ($similaires as $similaire): ?>
<?php
    $prixSimilaire = '$' . number_format((float) ($similaire['prix'] ?? 0), 2, ',', ' ');
    $slugSimilaire = slug_produit($similaire);
    $imageSimilaire = trim((string) ($similaire['image'] ?? '')) !== '' ? $url_image((string) ($similaire['image'])) : $base . '/assets/img/photo-manquante.svg';
?>
        <article class="carte-produit apparait">
          <a class="carte-produit__media" href="<?= $e($base) ?>/produit/<?= $e(rawurlencode($slugSimilaire)) ?>">
            <img src="<?= $e($imageSimilaire) ?>" alt="<?= $e($similaire['nom']) ?>" loading="lazy">
<?php if (trim((string) ($similaire['badge'] ?? '')) !== ''): ?>
            <span class="carte-produit__badge"><?= $e($similaire['badge']) ?></span>
<?php endif; ?>
          </a>
          <div class="carte-produit__corps">
            <span class="carte-produit__cat"><?= $e($libelleCategorie) ?></span>
            <h3 class="carte-produit__titre"><a href="<?= $e($base) ?>/produit/<?= $e(rawurlencode($slugSimilaire)) ?>"><?= $e($similaire['nom']) ?></a></h3>
            <p class="carte-produit__desc"><?= $e($similaire['description']) ?></p>
            <div class="carte-produit__pied">
              <div>
                <div class="carte-produit__prix"><?= $e($prixSimilaire) ?></div>
                <div class="carte-produit__stock"><?= (int) ($similaire['stock'] ?? 0) > 0 ? 'En stock' : 'Sur commande' ?></div>
              </div>
              <button class="btn btn--petit" data-ajouter="<?= $e($similaire['id']) ?>">Ajouter</button>
            </div>
          </div>
        </article>
<?php endforeach; ?>
      </div>
    </div>
  </section>
<?php endif; ?>

  <!-- =============================== CTA ================================ -->
  <section class="appel">
    <div class="conteneur appel__inner">
      <div>
        <h2 class="appel__titre">Une question sur ce produit ?</h2>
        <p class="appel__texte">Nos techniciens vous conseillent sur la compatibilité, l'installation et les options de financement.</p>
      </div>
      <div class="appel__actions">
        <a class="btn btn--accent" href="<?= $e($base) ?>/#contact">Demander conseil</a>
        <a class="btn btn--fantome" data-champ="telephone" data-lien="tel" href="tel:<?= $e(preg_replace('/[^\d+]/', '', (string) ($identite['telephone'] ?? ''))) ?>" style="--btn-texte:#fff;border-color:rgba(255,255,255,.35)">📞 Nous appeler</a>
      </div>
    </div>
  </section>

<?php endif; ?>

  <!-- =============================== PIED =============================== -->
  <footer class="pied">
    <div class="conteneur">
      <div class="pied__grille">
        <div>
          <img class="pied__logo" id="logo-pied" src="<?= $e($base) ?>/assets/img/logo-clair.svg" alt="Logo LK-TECH">
          <div class="pied__nom" id="nom-pied">LK<i class="tiret">-</i>TECH</div>
          <p class="pied__texte" id="pied-description">LK-TECH (Linksmartech) développe des solutions de construction et de technologie et facilite les connexions commerciales à l'échelle internationale. Nous accompagnons entreprises, ONG, institutions et porteurs de startups, de l'étude à la réalisation.</p>
        </div>
        <div>
          <h4 class="pied__titre">Navigation</h4>
          <div class="pied__liens">
            <a href="<?= $e($base) ?>/">Accueil</a>
            <a href="<?= $e($base) ?>/#boutique">Boutique</a>
            <a href="<?= $e($base) ?>/#services">Services</a>
            <a href="<?= $e($base) ?>/a-propos">À propos</a>
            <a href="<?= $e($base) ?>/#contact">Contact</a>
          </div>
        </div>
        <div>
          <h4 class="pied__titre">Nos spécialités</h4>
          <div class="pied__liens" id="pied-specialites"></div>
        </div>
        <div>
          <h4 class="pied__titre">Coordonnées</h4>
          <div class="pied__liens">
            <span data-champ="ville"><?= $e($identite['ville'] ?? '') ?></span>
            <a data-champ="telephone" data-lien="tel" href="tel:<?= $e(preg_replace('/[^\d+]/', '', (string) ($identite['telephone'] ?? ''))) ?>"><?= $e($identite['telephone'] ?? '') ?></a>
            <a data-champ="email" data-lien="mailto" href="mailto:<?= $e($identite['email'] ?? '') ?>"><?= $e($identite['email'] ?? '') ?></a>
            <a data-champ="siteWeb" data-lien="web" href="https://<?= $e(preg_replace('#^https?://#i', '', rtrim((string) ($identite['siteWeb'] ?? ''), '/'))) ?>"><?= $e($identite['siteWeb'] ?? '') ?></a>
            <span data-champ="rccm">RCCM : <?= $e($identite['rccm'] ?? '') ?></span>
          </div>
          <div class="pied__liens" id="reseaux-sociaux" style="margin-top:1rem"></div>
        </div>
      </div>
      <div class="pied__bas">
        <span id="pied-copyright">© <?= date('Y') ?> <?= $e($nomSite) ?> — Tous droits réservés.</span>
        <span>Conçu à Goma 🇨🇩</span>
      </div>
    </div>
  </footer>

  <!-- =============================== PANIER ============================= -->
  <div class="voile" id="voile"></div>
  <aside class="panier" id="panier" aria-label="Panier" aria-hidden="true">
    <div class="panier__entete">
      <h2 class="panier__titre">Votre panier</h2>
      <button class="panier__fermer" id="panier-fermer" aria-label="Fermer le panier">×</button>
    </div>
    <div class="panier__liste" id="panier-liste"></div>
    <div class="panier__pied">
      <div class="panier__total"><span>Total</span><span id="panier-total">$0.00</span></div>
      <a class="btn btn--accent btn--bloc" id="panier-commander" href="#contact">Commander via WhatsApp</a>
      <button class="btn btn--fantome btn--bloc btn--petit" id="panier-vider">Vider le panier</button>
    </div>
  </aside>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <script>window.LK_BASE = "<?= $e($base) ?>";</script>
  <script>window.LK_SECOURS = "<?= $e($base) ?>/assets/data/site.json";</script>
  <script src="<?= $e($base) ?>/assets/js/site.js"></script>
</body>
</html>
