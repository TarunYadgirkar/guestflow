import type { VercelRequest, VercelResponse } from '@vercel/node';
import { orchestrate } from '../agent/orchestrate.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const guestId = (req.query.guestId as string) || 'g_tarun';
  const delay = parseInt((req.query.delay as string) || '0', 10);

  try {
    const result = await orchestrate(guestId, delay);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
