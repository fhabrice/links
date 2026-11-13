'use client';

/** Petit client des API de l'administration (partagé par les onglets). */
export async function api(url, options = {}) {
  const reponse = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
  const donnees = await reponse.json().catch(() => ({}));
  return { ok: reponse.ok, code: reponse.status, donnees };
}
