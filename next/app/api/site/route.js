import { json } from '../../../lib/http';
import { lireContenu, lireReglages } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [contenu, reglages] = await Promise.all([lireContenu(), lireReglages()]);
  return json({ contenu, reglages }, { entetes: { 'Cache-Control': 'no-store' } });
}
