import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env') });

// Dynamic import to ensure dotenv is loaded first
const { orchestrate } = await import('../agent/orchestrate.js');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/orchestrate', async (req, res) => {
  const guestId = (req.query.guestId as string) || 'g_tarun';
  const delay = parseInt((req.query.delay as string) || '0', 10);

  try {
    const result = await orchestrate(guestId, delay);
    res.json(result);
  } catch (err) {
    console.error('[API] Error:', err);
    res.status(500).json({ error: String(err) });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`GuestFlow API → http://localhost:${PORT}`);
});
