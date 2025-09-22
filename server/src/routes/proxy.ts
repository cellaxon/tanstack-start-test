import express, { type Request, type Response } from 'express';

const router = express.Router();

router.post('/', async (req: Request, res: Response) => {
  const { url, options = {} } = req.body;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Proxy request failed',
      message: error.message,
    });
  }
});

router.get('/external/:service', async (req: Request, res: Response) => {
  const { service } = req.params;

  const mockData = {
    weather: {
      temperature: 22,
      humidity: 65,
      description: 'Partly cloudy',
      city: 'Seoul',
      country: 'KR',
    },
    news: [
      {
        title: 'Breaking: TanStack Query v5 Released',
        description: 'Major improvements in performance and DX',
        url: '#',
        publishedAt: new Date(),
      },
      {
        title: 'OAuth 2.1 Draft Specification Published',
        description: 'Enhanced security recommendations',
        url: '#',
        publishedAt: new Date(Date.now() - 86400000),
      },
    ],
    crypto: [
      {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price: 45000,
        price_change_24h: 1200,
        price_change_percentage_24h: 2.74,
      },
      {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        current_price: 2800,
        price_change_24h: -50,
        price_change_percentage_24h: -1.75,
      },
    ],
  };

  if (mockData[service]) {
    res.json(mockData[service]);
  } else {
    res.status(404).json({ error: 'Service not found' });
  }
});

export default router;