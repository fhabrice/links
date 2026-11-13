import { json } from '../../../lib/http';
import { modePilote } from '../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  return json({
    statut: 'ok',
    pilote: modePilote(),
    horodatage: new Date().toISOString()
  });
}
