/* LK-TECH — Candidature & interactions « Travailler avec nous » */
(function () {
  'use strict';

  const BASE = (typeof window !== 'undefined' && window.LK_BASE) || '';
  function el(id) { return document.getElementById(id); }

  // Filet de sécurité menu mobile si site.js n'a pas encore branché le burger
  const burger = el('burger');
  const nav = el('nav');
  if (burger && nav && !burger.dataset.menuBranche) {
    burger.dataset.menuBranche = '1';
    burger.addEventListener('click', function (e) {
      e.stopPropagation();
      const ouvert = nav.classList.toggle('ouvert');
      burger.setAttribute('aria-expanded', String(ouvert));
      burger.textContent = ouvert ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('ouvert');
        burger.setAttribute('aria-expanded', 'false');
        burger.textContent = '☰';
      });
    });
  }

  function toast(msg, err) {
    const t = el('toast');
    if (!t) return;
    t.textContent = msg;
    t.hidden = false;
    t.className = 'toast visible' + (err ? ' toast--erreur' : ' toast--succes');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () {
      t.classList.remove('visible');
    }, 5500);
  }

  function mettreEnEvidenceChamp(champ) {
    if (!champ) return;
    champ.classList.remove('champ-surligne');
    void champ.offsetWidth;
    champ.classList.add('champ-surligne');
    setTimeout(function () { champ.classList.remove('champ-surligne'); }, 1800);
  }

  function selectionnerValeur(selectEl, valeur) {
    if (!selectEl || !valeur) return false;
    const options = Array.from(selectEl.options);
    const exacte = options.find(function (o) { return o.value.toLowerCase() === valeur.toLowerCase(); });
    if (exacte) {
      selectEl.value = exacte.value;
      mettreEnEvidenceChamp(selectEl);
      return true;
    }
    return false;
  }

  // Pré-sélection via paramètres d'URL (?domaine=Informatique&type=Stage)
  const params = new URLSearchParams(window.location.search);
  const domaineUrl = params.get('domaine');
  const typeUrl = params.get('type');
  if (domaineUrl) selectionnerValeur(el('cand-domaine'), domaineUrl);
  if (typeUrl) selectionnerValeur(el('cand-type'), typeUrl);

  // Boutons interactifs « Postuler dans ce pôle » & « Choisir ce mode »
  document.querySelectorAll('[data-choisir-domaine]').forEach(function (btnPole) {
    btnPole.addEventListener('click', function (e) {
      const selectDomaine = el('cand-domaine');
      const domaine = btnPole.getAttribute('data-choisir-domaine');
      if (selectDomaine && domaine) {
        e.preventDefault();
        selectionnerValeur(selectDomaine, domaine);
        const sectionCand = el('candidature') || selectDomaine;
        sectionCand.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(function () {
          const champNom = el('cand-nom');
          if (champNom && !champNom.value) champNom.focus({ preventScroll: true });
          else selectDomaine.focus({ preventScroll: true });
        }, 450);
      }
    });
  });

  document.querySelectorAll('[data-choisir-type]').forEach(function (btnType) {
    btnType.addEventListener('click', function (e) {
      const selectType = el('cand-type');
      const typeCollab = btnType.getAttribute('data-choisir-type');
      if (selectType && typeCollab) {
        e.preventDefault();
        selectionnerValeur(selectType, typeCollab);
        const sectionCand = el('candidature') || selectType;
        sectionCand.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const form = el('formulaire-candidature');
  if (!form) return;

  const succesBox = el('cand-succes');
  const erreurBox = el('cand-erreur');
  const btn = el('cand-envoyer');
  const lienGForm = el('lien-google-form');
  const blocGForm = el('cand-gform-direct');

  function showSucces(msg) {
    if (succesBox) {
      succesBox.textContent = msg;
      succesBox.hidden = false;
      succesBox.classList.add('visible');
      succesBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (erreurBox) {
      erreurBox.hidden = true;
      erreurBox.classList.remove('visible');
    }
  }

  function showErreur(msg) {
    if (erreurBox) {
      erreurBox.textContent = msg;
      erreurBox.hidden = false;
      erreurBox.classList.add('visible');
      erreurBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    if (succesBox) {
      succesBox.hidden = true;
      succesBox.classList.remove('visible');
    }
  }

  function hideAlerts() {
    if (succesBox) { succesBox.hidden = true; succesBox.classList.remove('visible'); }
    if (erreurBox) { erreurBox.hidden = true; erreurBox.classList.remove('visible'); }
  }

  hideAlerts();

  // Afficher le lien Google Form direct uniquement s'il est configuré
  (async function chargerGForm() {
    try {
      const res = await fetch((BASE || '') + '/api/site', { headers: { 'Cache-Control': 'no-store' } });
      if (!res.ok) return;
      const data = await res.json();
      const gform = data && data.contenu && data.contenu.travaillerAvecNous && data.contenu.travaillerAvecNous.googleForm;
      const actionUrl = (gform && gform.actionUrl) || '';
      if (actionUrl && actionUrl.includes('docs.google.com')) {
        const viewUrl = actionUrl.replace('/formResponse', '/viewform');
        if (lienGForm) {
          lienGForm.href = viewUrl;
          lienGForm.target = '_blank';
          lienGForm.rel = 'noopener';
        }
        if (blocGForm) blocGForm.hidden = false;
      }
    } catch {}
  })();

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideAlerts();

    const fd = new FormData(form);
    const payload = {};
    fd.forEach(function (v, k) { payload[k] = typeof v === 'string' ? v.trim() : v; });
    const checkConsent = form.querySelector('[name="consentement"]');
    payload.consentement = Boolean(checkConsent && checkConsent.checked);

    if (!payload.domaine) {
      showErreur('Merci de choisir le domaine / pôle souhaité.');
      el('cand-domaine')?.focus();
      return;
    }
    if (!payload.nom || !payload.prenom || !payload.email) {
      showErreur('Merci de renseigner vos nom, prénom et adresse e-mail.');
      return;
    }
    if (!payload.typeCollaboration) {
      showErreur('Merci d’indiquer le type de collaboration recherché (emploi, stage, freelance ou partenariat).');
      el('cand-type')?.focus();
      return;
    }
    if (!payload.message || payload.message.length < 10) {
      showErreur('Merci de rédiger quelques lignes de présentation et de motivation (10 caractères minimum).');
      el('cand-message')?.focus();
      return;
    }
    if (!payload.consentement) {
      showErreur('Veuillez cocher la case d’acceptation du traitement de votre candidature.');
      return;
    }

    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Envoi de votre dossier en cours…';
    }

    try {
      const res = await fetch(BASE + '/api/candidature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(function () { return {}; });
      if (!res.ok) throw new Error(data.erreur || data.message || 'Erreur lors de l’envoi de la candidature.');
      let msg = data.message || 'Merci ! Votre candidature a bien été enregistrée. Notre équipe vous recontacte sous 48 h.';
      if (data.googleForm && data.googleForm.ok) {
        msg += ' (Synchronisée avec Google Form)';
      }
      showSucces(msg);
      toast('Candidature envoyée avec succès ✔', false);
      form.reset();
    } catch (err) {
      const msg = (err && err.message) ? err.message : 'Impossible d’envoyer la candidature pour le moment. Réessayez.';
      showErreur(msg);
      toast(msg, true);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = 'Envoyer ma candidature <span aria-hidden="true">↗</span>';
      }
    }
  });
})();
