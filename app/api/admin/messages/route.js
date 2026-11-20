import { json, exigerSession } from '../../../../lib/http';
import { listerMessages } from '../../../../lib/store';

export const dynamic = 'force-dynamic';

export async function GET(requete) {
  const { refus } = await exigerSession(requete);
  if (refus) return refus;
  return json({ messages: await listerMessages() });
}
