<?php
/** Pied de page public, rendu côté serveur même sans JavaScript. */
$footerBase = base_url();
$footerContenu = contenu_public(lk_store()->contenu());
$footerIdentite = $footerContenu['identite'] ?? [];
$footerLogo = $footerIdentite['logoClair'] ?? '/assets/img/logo-clair.svg';
if (str_starts_with($footerLogo, '/') && !str_starts_with($footerLogo, '//')
    && $footerBase !== '' && !str_starts_with($footerLogo, $footerBase . '/')) {
    $footerLogo = $footerBase . $footerLogo;
}
?>
  <footer class="pied" aria-label="Pied de page LK-TECH">
    <div class="conteneur">
      <div class="pied__invitation">
        <div><h2>Un logiciel ou un projet en tête ?</h2><p>Échangeons sur la solution adaptée à vos besoins.</p></div>
        <a class="btn btn--accent" href="<?= $footerBase ?>/#contact">Contacter LK-TECH ↗</a>
      </div>
      <div class="pied__grille">
        <div>
          <img class="pied__logo" id="logo-pied" src="<?= e($footerLogo) ?>" alt="Logo LK-TECH">
          <div class="pied__nom" id="nom-pied"><?= e($footerIdentite['nom'] ?? 'LK-TECH') ?></div>
          <p class="pied__texte" id="pied-description"><?= e($footerContenu['pied']['description'] ?? 'Depuis Goma, LK-TECH accompagne vos projets en construction, architecture, numérique et énergie.') ?></p>
        </div>
        <div>
          <h4 class="pied__titre">Navigation</h4>
          <div class="pied__liens">
            <a href="<?= $footerBase ?>/#accueil">Accueil</a>
            <a href="<?= $footerBase ?>/#specialites">Spécialités</a>
            <a href="<?= $footerBase ?>/#logiciels">Nos logiciels</a>
            <a href="<?= $footerBase ?>/#collaborations">Investir &amp; collaborer</a>
            <a href="<?= $footerBase ?>/opportunites.php">Appels à projets &amp; Emplois</a>
            <a href="<?= $footerBase ?>/#services">Services</a>
            <a href="<?= $footerBase ?>/a-propos">À propos</a>
            <a href="<?= $footerBase ?>/travailler-avec-nous.php">Travailler avec nous</a>
            <a href="<?= $footerBase ?>/#contact">Contact</a>
            <a href="<?= $footerBase ?>/admin/">🔒 Espace admin</a>
          </div>
        </div>
        <div>
          <h4 class="pied__titre">Nos spécialités</h4>
          <div class="pied__liens" id="pied-specialites">
            <?php foreach ($footerContenu['specialites'] ?? [] as $specialite): ?>
              <a href="<?= $footerBase ?>/#specialites"><?= e($specialite['titre'] ?? '') ?></a>
            <?php endforeach; ?>
          </div>
        </div>
        <div>
          <h4 class="pied__titre">Coordonnées</h4>
          <div class="pied__liens">
            <span data-champ="ville"><?= e($footerIdentite['ville'] ?? 'Goma, Nord-Kivu, RDC') ?></span>
            <a data-champ="telephone" data-lien="tel" href="tel:<?= e(preg_replace('/[^+0-9]/', '', $footerIdentite['telephone'] ?? '+243976459970')) ?>"><?= e($footerIdentite['telephone'] ?? '+243 976 459 970') ?></a>
            <a data-champ="email" data-lien="mailto" href="mailto:<?= e($footerIdentite['email'] ?? 'contact@linksmartec.com') ?>"><?= e($footerIdentite['email'] ?? 'contact@linksmartec.com') ?></a>
            <span data-champ="rccm">RCCM : <?= e($footerIdentite['rccm'] ?? '') ?></span>
          </div>
          <div class="pied__liens" id="reseaux-sociaux" style="margin-top:1rem"></div>
        </div>
      </div>
      <div class="pied__bas">
        <span id="pied-copyright">© <?= date('Y') ?> <?= e($footerIdentite['nom'] ?? 'LK-TECH') ?> — <?= e($footerContenu['pied']['mentions'] ?? 'Tous droits réservés.') ?></span>
        <span>Goma, République démocratique du Congo</span>
      </div>
    </div>
  </footer>
