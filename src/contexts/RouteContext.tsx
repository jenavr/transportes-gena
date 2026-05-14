import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';

export type Stop = {
  origin: string;
  destination: string;
};

export type TollOriginal = {
  amount: number;
  currency: string;
  fxRate: number | null;
};

export type RouteData = {
  origin: string;
  destination: string;
  resolvedOrigin: string | null;
  resolvedDestination: string | null;
  distanceKm: number | null;
  durationMin: number | null;
  tollAmount: number | null;
  tollCurrency: string | null;
  tollOriginal: TollOriginal | null;
  embedUrl: string;
  mapKey: number;
  loading: boolean;
  error: string | null;
  requestId: number;
  lastUpdatedAt: number | null;
};

type RouteContextValue = {
  routeData: RouteData;
  calculate: (stop: Stop) => void;
};

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as
  | string
  | undefined;

  const BACKEND_URL =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? '';

export const buildEmbedUrl = (origin: string, destination: string) => {
  const o = encodeURIComponent(origin.trim() || 'Mexico');
  const d = encodeURIComponent(destination.trim() || 'Mexico');

  if (GOOGLE_MAPS_API_KEY) {
    return `https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${o}&destination=${d}&mode=driving&language=es&region=MX`;
  }

  return `https://www.google.com/maps?q=${o}+to+${d}&output=embed`;
};

const buildInitialState = (initial: Stop): RouteData => ({
  origin: initial.origin,
  destination: initial.destination,
  resolvedOrigin: null,
  resolvedDestination: null,
  distanceKm: null,
  durationMin: null,
  tollAmount: null,
  tollCurrency: null,
  tollOriginal: null,
  embedUrl: buildEmbedUrl(initial.origin, initial.destination),
  mapKey: 0,
  loading: false,
  error: null,
  requestId: 0,
  lastUpdatedAt: null,
});

const isTollOriginal = (value: unknown): value is TollOriginal => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.amount === 'number' &&
    typeof v.currency === 'string' &&
    (v.fxRate === null || typeof v.fxRate === 'number')
  );
};

const RouteContext = createContext<RouteContextValue | null>(null);

type ProviderProps = {
  initial: Stop;
  children: ReactNode;
};

export const RouteProvider = ({ initial, children }: ProviderProps) => {
  const [routeData, setRouteData] = useState<RouteData>(() =>
    buildInitialState(initial),
  );

  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const calculate = useCallback((next: Stop) => {
    const origin = next.origin.trim();
    const destination = next.destination.trim();

    if (!origin || !destination) {
      setRouteData((prev) => ({
        ...prev,
        error: 'Ingresa origen y destino para calcular la ruta.',
        loading: false,
      }));

      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    requestIdRef.current += 1;
    const currentReqId = requestIdRef.current;

    setRouteData((prev) => ({
      ...prev,
      origin,
      destination,
      embedUrl: buildEmbedUrl(origin, destination),
      mapKey: prev.mapKey + 1,
      loading: true,
      error: null,
      requestId: currentReqId,
      distanceKm: null,
      durationMin: null,
      tollAmount: null,
      tollCurrency: null,
      tollOriginal: null,
    }));

    fetch(`${BACKEND_URL}/api/route-tolls`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text().catch(() => '');

          throw new Error(`Backend ${res.status}: ${errText || 'fetch failed'}`);
        }

        return res.json();
      })
      .then((data) => {
        if (!mountedRef.current) return;
        if (currentReqId !== requestIdRef.current) return;

        setRouteData((prev) => {
          if (prev.requestId !== currentReqId) return prev;

          return {
            ...prev,
            distanceKm:
              typeof data.distanceKm === 'number' ? data.distanceKm : null,
            durationMin:
              typeof data.durationMin === 'number' ? data.durationMin : null,
            tollAmount:
              typeof data.tollAmount === 'number' ? data.tollAmount : null,
            tollCurrency:
              typeof data.tollCurrency === 'string' ? data.tollCurrency : null,
            tollOriginal: isTollOriginal(data.tollOriginal)
              ? data.tollOriginal
              : null,
            resolvedOrigin:
              typeof data.resolvedOrigin === 'string'
                ? data.resolvedOrigin
                : origin,
            resolvedDestination:
              typeof data.resolvedDestination === 'string'
                ? data.resolvedDestination
                : destination,
            loading: false,
            error: null,
            lastUpdatedAt: Date.now(),
          };
        });
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!mountedRef.current) return;
        if (currentReqId !== requestIdRef.current) return;

        const message =
          err instanceof TypeError
            ? 'No pudimos conectar al backend. Asegurate que este corriendo en :4000.'
            : 'No pudimos calcular la ruta. Verifica las ciudades.';

        setRouteData((prev) => {
          if (prev.requestId !== currentReqId) return prev;

          return {
            ...prev,
            loading: false,
            error: message,
            lastUpdatedAt: Date.now(),
          };
        });
      });
  }, []);

  useEffect(() => {
    if (!initial.origin.trim() || !initial.destination.trim()) return;
    calculate(initial);
  }, [calculate, initial]);

  return (
    <RouteContext.Provider value={{ routeData, calculate }}>
      {children}
    </RouteContext.Provider>
  );
};

export const useRoute = (): RouteContextValue => {
  const ctx = useContext(RouteContext);

  if (!ctx) {
    throw new Error('useRoute must be used inside a <RouteProvider>');
  }

  return ctx;
};
