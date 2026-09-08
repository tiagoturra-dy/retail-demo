import 'dotenv/config';
import express from 'express';
import { handleApiRequest } from './router.js';

const app = express();

app.use(express.json());

app.all('/api/*', async (req, res) => {
  const origin = `${req.protocol}://${req.get('host')}`;
  const headers = new Headers();

  Object.entries(req.headers).forEach(([key, value]) => {
    if (typeof value === 'string') {
      headers.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      headers.set(key, value.join(','));
    }
  });

  const body = req.method === 'GET' || req.method === 'HEAD'
    ? undefined
    : JSON.stringify(req.body ?? {});

  const request = new Request(new URL(req.originalUrl, origin), {
    method: req.method,
    headers,
    body,
  });

  const response = await handleApiRequest(request);
  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(await response.text());
});

app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

if (process.env.NODE_ENV !== 'production') {
  const port = 5000;
  app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

export default app;