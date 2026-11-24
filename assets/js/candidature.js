/* LK-TECH — Candidature « Travailler avec nous » */
(function () {
  'use strict';
  const BASE = (typeof window !== 'undefined' && window.LK_BASE) || '';
  function el(id) { return document.getElementById(id); }
  function toast(msg, err) {
    const t = el('toast');
    if (!t) { return; }
    t.textContent = msg;
    t.className = 'toast' + (err ? ' toast--erreur' : ' toast--succes');
    t.hidden = false;
    clearTimeout(t._timer);
    t._timer = setTimeout(() => { t.hidden = true; }, 6000);
  }

  const form = el('formulaire-candidature');
  if (!form) return;

  const succesBox = el('cand-succes');
  const erreurBox = el('cand-erreur');
  const btn = el('cand-envoyer');
  const lienGForm = el('lien-google-form');
  const hintGForm = el('google-form-hint');

  function showSucces(msg) {
    if (succesBox) { succesBox.textContent = msg; succesBox.hidden = false; succesBox.style.display = 'block'; succesBox.classList.add('visible'); }
    if (erreurBox) { erreurBox.hidden = true; erreurBox.style.display = 'none'; }
  }
  function showErreur(msg) {
    if (erreurBox) { erreurBox.textContent = msg; erreurBox.hidden = false; erreurBox.style.display = 'block'; erreurBox.classList.add('visible'); }
    if (succesBox) { succesBox.hidden = true; succesBox.style.display = 'none'; }
  }
  function hideAlerts() {
    if (succesBox) { succesBox.hidden = true; }
    if (erreurBox) { erreurBox.hidden = true; }
  }

  if (succesBox) succesBox.hidden = true;
  if (erreurBox) erreurBox.hidden = true;

  // Afficher le lien Google Form direct si configuré
  (async function chargerGForm() {
    try {
      const res = await fetch((BASE || '') + '/api/site', { headers: { 'Cache-Control': 'no-store' } });
      if (!res.ok) return;
      const data = await res.json();
      const gform = data?.contenu?.travaillerAvecNous?.googleForm;
      const actionUrl = gform?.actionUrl || '';
      if (actionUrl && actionUrl.includes('docs.google.com')) {
        const viewUrl = actionUrl.replace('/formResponse', '/viewform');
        if (lienGForm) {
          lienGForm.href = viewUrl;
          lienGForm.style.display = 'inline';
          lienGForm.textContent = 'Ouvrir le Google Form';
          lienGForm.target = '_blank';
          lienGForm.rel = 'noopener';
        }
        if (hintGForm) hintGForm.style.display = 'none';
      }
    } catch {}
  })();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlerts();

    const fd = new FormData(form);
    const payload = {};
    fd.forEach((v, k) => { payload[k] = typeof v === 'string' ? v.trim() : v; });
    payload.consentement = form.querySelector('[name="consentement"]')?.checked || false;

    if (!payload.nom || !payload.prenom || !payload.email || !payload.message || payload.message.length < 10) {
      showErreur('Merci de remplir nom, prénom, e-mail et votre motivation (10 caractères minimum).');
      return;
    }
    if (!payload.consentement) {
      showErreur('Veuillez accepter la politique de confidentialité.');
      return;
    }
    if (btn) { btn.disabled = true; btn.textContent = 'Envoi en cours…'; }

    try {
      const res = await fetch(BASE + '/api/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.erreur || data.message || 'Erreur lors de l’envoi.');
      let msg = data.message || 'Merci ! Votre candidature a bien été envoyée. Nous vous recontactons rapidement.';
      // Info Google Form si transfert
      if (data.googleForm && data.googleForm.ok) {
        msg += ' (Transmise à notre Google Form / Gmail)';
      } else if (data.googleForm && data.googleForm.raison === 'non-configure') {
        // pas grave, stocké localement
      }
      showSucces(msg);
      toast(msg, false);
      form.reset();
    } catch (err) {
      const msg = (err && err.message) ? err.message : 'Impossible d’envoyer la candidature. Réessayez.';
      showErreur(msg);
      toast(msg, true);
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Envoyer ma candidature ↗'; }
    }
  });
})();
