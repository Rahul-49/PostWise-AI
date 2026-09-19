const express = require('express');

const router = express.Router();
const cache = new Map(); // term -> { photos, expiresAt }
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

router.get('/search', async (req, res) => {
  const term = (req.query.term || '').trim();
  if (!term) return res.status(400).json({ error: 'Missing search term' });

  const now = Date.now();
  const cached = cache.get(term);
  if (cached && cached.expiresAt > now) {
    return res.json({ photos: cached.photos });
  }

  try {
    const apiKey = process.env.PEXELS_API || process.env.PEXELS_API_KEY;
    if (!apiKey) {
      console.warn('Pexels API key is not configured in .env');
      return res.status(500).json({ error: 'Pexels API key not configured' });
    }

    const url = new URL('https://api.pexels.com/v1/search');
    url.searchParams.set('query', term);
    url.searchParams.set('per_page', '3');

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pexels API error status:', response.status, errorText);
      return res.status(response.status).json({ error: 'Pexels API error' });
    }

    const data = await response.json();
    const photos = (data.photos || []).map((p) => p.src?.large || p.src?.medium || p.src?.original);

    // If query didn't return any photos, try fallback with just the first word
    if (photos.length === 0 && term.includes(' ')) {
      const fallbackWord = term.split(/\s+/)[0];
      const fallbackUrl = new URL('https://api.pexels.com/v1/search');
      fallbackUrl.searchParams.set('query', fallbackWord);
      fallbackUrl.searchParams.set('per_page', '3');

      const fallbackRes = await fetch(fallbackUrl.toString(), {
        headers: { Authorization: apiKey },
      });
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        const fallbackPhotos = (fallbackData.photos || []).map((p) => p.src?.large || p.src?.medium || p.src?.original);
        if (fallbackPhotos.length > 0) {
          cache.set(term, { photos: fallbackPhotos, expiresAt: now + CACHE_TTL });
          return res.json({ photos: fallbackPhotos });
        }
      }
    }

    cache.set(term, { photos, expiresAt: now + CACHE_TTL });
    res.json({ photos });
  } catch (e) {
    console.error('Pexels fetch exception:', e.message);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

module.exports = router;
