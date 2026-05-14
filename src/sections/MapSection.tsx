import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Loader2,
  Receipt,
  Clock,
  Route as RouteIcon,
  Flag,
  ArrowDownUp,
  AlertTriangle,
} from 'lucide-react';
import { PlacesAutocompleteInput } from '../components/PlacesAutocompleteInput';
import { useRoute } from '../contexts/RouteContext';
import type { RouteData, Stop } from '../contexts/RouteContext';

const EMPTY_STOP: Stop = {
  origin: '',
  destination: '',
};

const formatDistance = (km: number) =>
  km >= 100
    ? `${km.toLocaleString('es-MX', { maximumFractionDigits: 0 })} km`
    : `${km.toLocaleString('es-MX', { maximumFractionDigits: 1 })} km`;

const formatDuration = (min: number) => {
  const total = Math.max(0, Math.round(min));
  const h = Math.floor(total / 60);
  const m = total % 60;

  if (h <= 0) return `${m} min`;

  return m === 0 ? `${h} h` : `${h} h ${m} m`;
};

const formatMoney = (amount: number, currency: string | null) =>
  amount.toLocaleString('es-MX', {
    style: 'currency',
    currency: currency ?? 'MXN',
    maximumFractionDigits: 0,
  });

/* ------------------------------------------------------------------ */
/*                        Animated counter                            */
/* ------------------------------------------------------------------ */

type AnimatedNumberProps = {
  value: number;
  format: (v: number) => string;
  durationMs?: number;
};

const AnimatedNumber = ({
  value,
  format,
  durationMs = 750,
}: AnimatedNumberProps) => {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = fromRef.current;
    const end = value;

    if (start === end) {
      setDisplay(end);
      return;
    }

    const t0 = performance.now();

    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / durationMs);
      const eased = 1 - Math.pow(1 - k, 3);
      const current = start + (end - start) * eased;

      setDisplay(current);

      if (k < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        fromRef.current = end;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return <>{format(display)}</>;
};

/* ------------------------------------------------------------------ */
/*                           Skeleton bar                             */
/* ------------------------------------------------------------------ */

const Skeleton = ({ className = '' }: { className?: string }) => (
  <div
    className={`relative overflow-hidden rounded-md bg-white/10 [html:not(.dark)_&]:bg-slate-200/80 ${className}`}
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent [html:not(.dark)_&]:via-white" />
  </div>
);

/* ------------------------------------------------------------------ */
/*                              Main                                  */
/* ------------------------------------------------------------------ */

export const MapSection = () => {
  const { routeData, calculate } = useRoute();
  const [stop, setStop] = useState<Stop>(EMPTY_STOP);
  const [spin, setSpin] = useState(0);

  const handleCalculate = useCallback(() => {
    calculate(stop);
  }, [calculate, stop]);

  const handleSwap = useCallback(() => {
    const next: Stop = {
      origin: stop.destination,
      destination: stop.origin,
    };

    setSpin((s) => s + 180);
    setStop(next);

    if (next.origin.trim() && next.destination.trim()) {
      calculate(next);
    }
  }, [calculate, stop.destination, stop.origin]);

  const canCalculate =
    stop.origin.trim().length > 0 && stop.destination.trim().length > 0;

  const isInitialLoading =
    routeData.loading && routeData.lastUpdatedAt == null;

  const showDestinationCard =
    routeData.loading ||
    routeData.resolvedDestination != null ||
    routeData.error != null;

  return (
    <section id="cobertura" className="section">
      <div className="container-page">
        <div className="grid items-stretch gap-8 lg:grid-cols-12">
          {/* -------------------- Left column -------------------- */}
          <div className="lg:col-span-5">
            <span className="badge">
              <Compass className="h-3.5 w-3.5 text-brand-400" />
              Cobertura Mexico - EE.UU.
            </span>

            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
              Visualiza tu{' '}
              <span className="gradient-text">ruta optima</span>
            </h2>

            <p className="mt-4 text-slate-300 [html:not(.dark)_&]:text-slate-600">
              Calculamos la mejor combinacion entre tiempo, distancia y
              consumo. Sin caminos peligrosos ni atajos riesgosos.
            </p>

            <div className="mt-6 card p-5">
              <div className="relative grid gap-3">
                <div>
                  <label className="label flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-brand-400" />
                    Origen
                  </label>

                  <div className="mt-1.5">
                    <PlacesAutocompleteInput
                      value={stop.origin}
                      onChange={(v) => setStop((p) => ({ ...p, origin: v }))}
                      onSubmit={handleCalculate}
                      placeholder="Empieza a escribir una ciudad..."
                      className="pr-12"
                      ariaLabel="Origen"
                    />
                  </div>
                </div>

                <div>
                  <label className="label flex items-center gap-1.5">
                    <Flag className="h-3.5 w-3.5 text-amber-400" />
                    Destino
                  </label>

                  <div className="mt-1.5">
                    <PlacesAutocompleteInput
                      value={stop.destination}
                      onChange={(v) =>
                        setStop((p) => ({ ...p, destination: v }))
                      }
                      onSubmit={handleCalculate}
                      placeholder="Empieza a escribir una ciudad..."
                      className="pr-12"
                      ariaLabel="Destino"
                    />
                  </div>
                </div>

                <SwapButton spin={spin} onClick={handleSwap} />

                <button
                  type="button"
                  onClick={handleCalculate}
                  disabled={routeData.loading || !canCalculate}
                  className="btn-primary mt-2 h-11 text-sm disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {routeData.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Calculando ruta...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      Calcular ruta
                    </>
                  )}
                </button>

                {routeData.error && (
                  <div
                    key={routeData.lastUpdatedAt ?? 'err'}
                    className="flex animate-fade-slide-in items-start gap-2 rounded-lg border border-rose-400/30 bg-rose-400/[0.06] px-3 py-2 text-[11px] text-rose-300 [html:not(.dark)_&]:border-rose-300 [html:not(.dark)_&]:bg-rose-50 [html:not(.dark)_&]:text-rose-700"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="leading-snug">{routeData.error}</span>
                  </div>
                )}
              </div>
            </div>

            {showDestinationCard && (
              <DestinationCard data={routeData} />
            )}
          </div>

          {/* -------------------- Right column -------------------- */}
          <div className="lg:col-span-7">
            <div className="card relative h-full min-h-[480px] overflow-hidden">
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white/70">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-rose-400/80" />
                    <span className="h-2 w-2 rounded-full bg-amber-300/80" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                  </div>

                  <span className="truncate text-xs text-slate-300 [html:not(.dark)_&]:text-slate-600">
                    {routeData.origin} → {routeData.destination}
                  </span>
                </div>

                <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400 sm:inline-flex">
                  {routeData.loading && (
                    <span className="relative inline-flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-400" />
                    </span>
                  )}
                  {routeData.loading ? 'Recalculando' : 'Powered by Google Maps'}
                </span>
              </div>

              <iframe
                key={routeData.mapKey}
                title="Mapa de la ruta"
                className="absolute inset-0 h-full w-full transition-opacity duration-500"
                style={{ border: 0 }}
                src={routeData.embedUrl}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

              <BottomStats
                data={routeData}
                isInitialLoading={isInitialLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ */
/*                          Subcomponents                             */
/* ------------------------------------------------------------------ */

const SwapButton = ({
  spin,
  onClick,
}: {
  spin: number;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Intercambiar origen y destino"
    className="group absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-slate-200 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:border-brand-400/50 hover:bg-brand-400/20 hover:text-brand-300 hover:shadow-glow active:scale-95 focus:outline-none focus:ring-2 focus:ring-brand-400/40 [html:not(.dark)_&]:border-slate-300 [html:not(.dark)_&]:bg-white [html:not(.dark)_&]:text-slate-600 [html:not(.dark)_&]:hover:border-brand-500/50 [html:not(.dark)_&]:hover:bg-brand-50 [html:not(.dark)_&]:hover:text-brand-600"
  >
    <ArrowDownUp
      className="h-3.5 w-3.5 transition-transform duration-500 ease-out"
      style={{ transform: `rotate(${spin}deg)` }}
    />
  </button>
);

const DestinationCard = ({ data }: { data: RouteData }) => {
  const animKey = useMemo(
    () => `${data.requestId}-${data.lastUpdatedAt ?? 0}`,
    [data.requestId, data.lastUpdatedAt],
  );

  const showSkeleton = data.loading && data.resolvedDestination == null;

  return (
    <div
      key={animKey}
      className="mt-4 card animate-fade-slide-in p-4"
    >
      <p className="text-[10px] uppercase tracking-wider text-slate-400">
        Punto de destino
      </p>

      {showSkeleton ? (
        <div className="mt-2 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : (
        <>
          <p className="mt-1 flex items-start gap-2 text-sm text-white [html:not(.dark)_&]:text-slate-900">
            <Flag className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span className="font-medium leading-snug">
              {data.resolvedDestination ?? data.destination}
            </span>
          </p>

          {(data.resolvedOrigin ?? data.origin) && (
            <p className="mt-2 flex items-start gap-2 text-[12px] text-slate-300 [html:not(.dark)_&]:text-slate-600">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
              <span className="leading-snug">
                Saliendo desde {data.resolvedOrigin ?? data.origin}
              </span>
            </p>
          )}
        </>
      )}
    </div>
  );
};

const BottomStats = ({
  data,
  isInitialLoading,
}: {
  data: RouteData;
  isInitialLoading: boolean;
}) => {
  const animKey = useMemo(
    () => `stats-${data.requestId}-${data.lastUpdatedAt ?? 0}`,
    [data.requestId, data.lastUpdatedAt],
  );

  const tollLabel: ReactNode = (() => {
    if (data.tollAmount != null) {
      return (
        <AnimatedNumber
          value={data.tollAmount}
          format={(v) => formatMoney(v, data.tollCurrency)}
        />
      );
    }

    if (data.loading) return null;
    if (data.error) return '—';

    return 'Sin casetas';
  })();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 border-t border-white/10 bg-gradient-to-t from-ink-950/85 via-ink-950/55 to-transparent p-4 backdrop-blur-md [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:from-white/95 [html:not(.dark)_&]:via-white/70">
      <div
        key={animKey}
        className="grid animate-fade-slide-in grid-cols-3 gap-3"
      >
        <RouteStat
          icon={<RouteIcon className="h-3.5 w-3.5 text-brand-400" />}
          label="Distancia"
          loading={isInitialLoading}
          value={
            data.distanceKm != null ? (
              <AnimatedNumber
                value={data.distanceKm}
                format={formatDistance}
              />
            ) : data.loading ? null : (
              '—'
            )
          }
        />

        <RouteStat
          icon={<Clock className="h-3.5 w-3.5 text-brand-400" />}
          label="Duracion"
          loading={isInitialLoading}
          value={
            data.durationMin != null ? (
              <AnimatedNumber
                value={data.durationMin}
                format={formatDuration}
              />
            ) : data.loading ? null : (
              '—'
            )
          }
        />

        <RouteStat
          icon={<Receipt className="h-3.5 w-3.5 text-amber-400" />}
          label="Casetas"
          loading={isInitialLoading}
          value={tollLabel}
          hint={
            data.tollOriginal &&
            data.tollOriginal.currency !== 'MXN' &&
            data.tollAmount != null
              ? `~ ${formatMoney(
                  data.tollOriginal.amount,
                  data.tollOriginal.currency,
                )}`
              : undefined
          }
        />
      </div>
    </div>
  );
};

const RouteStat = ({
  icon,
  label,
  value,
  loading,
  hint,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  loading?: boolean;
  hint?: string;
}) => {
  const showSkeleton = value == null || loading;

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400">
        {icon}
        {label}
      </div>

      <div className="mt-1 min-h-[20px]">
        {showSkeleton ? (
          <Skeleton className="h-4 w-2/3" />
        ) : (
          <p className="text-sm font-semibold tabular-nums text-white [html:not(.dark)_&]:text-slate-900">
            {value}
          </p>
        )}

        {!showSkeleton && hint && (
          <p className="mt-0.5 text-[10px] text-slate-400 [html:not(.dark)_&]:text-slate-500">
            {hint}
          </p>
        )}
      </div>
    </div>
  );
};
