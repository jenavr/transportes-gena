import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
  }),
);

app.use(express.json());

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

type EstimatedPrice = {
  currencyCode?: string;
  units?: string | number;
  nanos?: number;
};

type PlacesAutocompleteSuggestion = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
};

const FX_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const fxCache = new Map<string, { rate: number; ts: number }>();

async function getFxRate(
  from: string,
  to: string,
): Promise<number | null> {
  if (from === to) return 1;

  const key = `${from}->${to}`;
  const cached = fxCache.get(key);
  const now = Date.now();

  if (cached && now - cached.ts < FX_CACHE_TTL_MS) {
    return cached.rate;
  }

  try {
    const url = `https://api.frankfurter.app/latest?from=${encodeURIComponent(
      from,
    )}&to=${encodeURIComponent(to)}`;

    const res = await fetch(url);

    if (!res.ok) return null;

    const data = (await res.json()) as {
      rates?: Record<string, number>;
    };

    const rate = data.rates?.[to];

    if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0) {
      return null;
    }

    fxCache.set(key, { rate, ts: now });

    return rate;
  } catch {
    return null;
  }
}

async function geocodeAddress(address: string): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY || !address?.trim()) return null;

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');

    url.searchParams.set('address', address);
    url.searchParams.set('key', GOOGLE_MAPS_API_KEY);
    url.searchParams.set('language', 'es-419');
    url.searchParams.set('region', 'mx');

    const res = await fetch(url);

    if (!res.ok) return null;

    const data = await res.json();

    return data.results?.[0]?.formatted_address ?? null;
  } catch {
    return null;
  }
}

app.post('/api/route-tolls', async (req, res) => {
  try {
    const { origin, destination } = req.body ?? {};

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Missing GOOGLE_MAPS_API_KEY' });
    }

    if (!origin || !destination) {
      return res.status(400).json({
        error: 'origin and destination are required',
      });
    }

    const [routeRes, resolvedOrigin, resolvedDestination] = await Promise.all([
      fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.travelAdvisory.tollInfo',
        },
        body: JSON.stringify({
          origin: { address: origin },
          destination: { address: destination },
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          extraComputations: ['TOLLS'],
          languageCode: 'es-419',
          units: 'METRIC',
        }),
      }),
      geocodeAddress(origin),
      geocodeAddress(destination),
    ]);

    const data = await routeRes.json();

    if (!routeRes.ok) {
      console.log('Google Routes API error:', JSON.stringify(data, null, 2));

      return res.status(routeRes.status).json({
        error: 'Google Routes API error',
        details: data,
      });
    }

    const route = data.routes?.[0];

    if (!route) {
      return res.status(404).json({ error: 'No route found' });
    }

    const distanceKm = (route.distanceMeters ?? 0) / 1000;
    const durationSec = parseInt(
      String(route.duration ?? '0s').replace('s', ''),
      10,
    );

    const prices: EstimatedPrice[] =
      route.travelAdvisory?.tollInfo?.estimatedPrice ?? [];

    const mxn = prices.find((price) => price.currencyCode === 'MXN');
    const selectedPrice = mxn ?? prices[0];

    let tollAmount: number | null = null;
    let tollCurrency: string | null = null;
    let originalAmount: number | null = null;
    let originalCurrency: string | null = null;
    let fxRate: number | null = null;

    if (selectedPrice) {
      const units = Number(selectedPrice.units ?? 0);
      const nanos = Number(selectedPrice.nanos ?? 0) / 1e9;
      const rawAmount = units + nanos;
      const rawCurrency = selectedPrice.currencyCode ?? 'MXN';

      originalAmount = rawAmount;
      originalCurrency = rawCurrency;

      if (rawCurrency === 'MXN') {
        tollAmount = rawAmount;
        tollCurrency = 'MXN';
      } else {
        const rate = await getFxRate(rawCurrency, 'MXN');

        if (rate != null) {
          tollAmount = rawAmount * rate;
          tollCurrency = 'MXN';
          fxRate = rate;
        } else {
          tollAmount = rawAmount;
          tollCurrency = rawCurrency;
        }
      }
    }

    return res.json({
      distanceKm,
      durationMin: durationSec / 60,
      tollAmount,
      tollCurrency,
      hasTolls: Boolean(route.travelAdvisory?.tollInfo),
      resolvedOrigin: resolvedOrigin ?? origin,
      resolvedDestination: resolvedDestination ?? destination,
      tollOriginal:
        originalAmount != null && originalCurrency != null
          ? {
              amount: originalAmount,
              currency: originalCurrency,
              fxRate,
            }
          : null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/places/autocomplete', async (req, res) => {
  try {
    const { input, sessionToken } = req.body ?? {};

    if (!GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Missing GOOGLE_MAPS_API_KEY' });
    }

    if (typeof input !== 'string' || input.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const response = await fetch(
      'https://places.googleapis.com/v1/places:autocomplete',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY,
          'X-Goog-FieldMask':
            'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text',
        },
        body: JSON.stringify({
          input: input.trim(),
          languageCode: 'es-419',
          includedRegionCodes: ['mx', 'us'],
          ...(typeof sessionToken === 'string' && sessionToken
            ? { sessionToken }
            : {}),
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      console.warn(
        'Places autocomplete error:',
        JSON.stringify(data, null, 2),
      );

      return res.status(response.status).json({
        error: 'Places API error',
        details: data,
      });
    }

    const raw: PlacesAutocompleteSuggestion[] = data.suggestions ?? [];

    const suggestions = raw
      .filter((s) => s.placePrediction?.placeId)
      .map((s) => {
        const pred = s.placePrediction!;
        const description = pred.text?.text ?? '';
        const mainText =
          pred.structuredFormat?.mainText?.text ?? description;
        const secondaryText =
          pred.structuredFormat?.secondaryText?.text ?? '';

        return {
          placeId: pred.placeId!,
          description,
          mainText,
          secondaryText,
        };
      });

    return res.json({ suggestions });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: 'Internal server error' });
  }
});

const frontendDistPath = path.join(__dirname, '..', 'dist');

app.use(express.static(frontendDistPath));

app.get('*', (_, res) => {
  res.sendFile(path.join(frontendDistPath, 'index.html'));
});

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});