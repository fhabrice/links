import { json } from '../../../lib/http';
import { piloteActif, supabaseConfigure } from '../../../lib/store';
import { supabasePret } from '../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [pilote, joignable] = await Promise.all([piloteActif(), supabasePret()]);
  return json({
    statut: 'ok',
    pilote,
    supabase: {
      configure: supabaseConfigure(),
      joignable: supabaseConfigure() ? joignable : null
    },
    horodatage: new Date().toISOString()
  });
}
