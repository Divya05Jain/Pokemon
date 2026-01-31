const express = require('express');
const https = require('https');
const http = require('http');

const router = express.Router();

const ALLOWED_HOSTS = [
  'img.pokemondb.net',
  'raw.githubusercontent.com',
  'cdn.jsdelivr.net',
  'via.placeholder.com',
  'placehold.co',
];

router.get('/', (req, res) => {
  const url = req.query.url;
  if (!url || typeof url !== 'string') {
    return res.status(400).send('Missing url');
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).send('Invalid url');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.status(400).send('Invalid protocol');
  }
  if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
    return res.status(403).send('Host not allowed');
  }
  const client = parsed.protocol === 'https:' ? https : http;
  client
    .get(url, { headers: { 'User-Agent': 'PokemonBattle/1.0' } }, (response) => {
      if (response.statusCode !== 200) {
        res.status(response.statusCode).send('Upstream error');
        return;
      }
      const ct = response.headers['content-type'] || 'image/png';
      res.setHeader('Content-Type', ct);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      response.pipe(res);
    })
    .on('error', () => res.status(502).send('Fetch failed'));
});

module.exports = router;
