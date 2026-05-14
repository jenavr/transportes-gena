import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDownUp,
  Calculator,
  Check,
  CheckCircle2,
  Coins,
  Copy,
  Fuel,
  Gauge,
  HardHat,
  LineChart,
  MapPin,
  MessageCircle,
  Printer,
  Receipt,
  RefreshCcw,
  Ruler,
  Sparkles,
  Truck,
  Wallet,
  Weight,
  Wrench,
  X,
  CircleDot,
  CalendarDays,
  Navigation,
} from 'lucide-react';
import type { QuoteCalculation } from '../types/quote';
import { Field, NumberInput } from '../components/Field';
import { PlacesAutocompleteInput } from '../components/PlacesAutocompleteInput';
import {
  DEFAULT_QUOTE,
  calculateQuote,
  validateQuote,
} from '../lib/quote';
import { formatMXN, formatMXNFine, formatNumber, cn } from '../lib/format';
import type {
  DistanceUnit,
  EfficiencyUnit,
  QuoteInputs,
} from '../types/quote';
import { useRoute } from '../contexts/RouteContext';

type SyncSummary = {
  distanceKm: number;
  tolls: number | null;
  tripDays: number;
  destination: string;
};

const SYNCED_FIELDS = [
  'origin',
  'destination',
  'distance',
  'distanceUnit',
  'tolls',
  'tripDays',
] as const;

type SyncedField = (typeof SYNCED_FIELDS)[number];

export const Quoter = () => {
  const { routeData, calculate: recalculateRoute } = useRoute();

  const [inputs, setInputs] = useState<QuoteInputs>(DEFAULT_QUOTE);
  const [touched, setTouched] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [syncedFields, setSyncedFields] = useState<Set<SyncedField>>(
    new Set(),
  );
  const [syncSummary, setSyncSummary] = useState<SyncSummary | null>(null);

  const lastSyncedAtRef = useRef<number | null>(null);
  const highlightTimerRef = useRef<number | null>(null);
  const summaryTimerRef = useRef<number | null>(null);

  const errors = useMemo(() => validateQuote(inputs), [inputs]);
  const hasErrors = Object.keys(errors).length > 0;

  const calculation = useMemo(() => calculateQuote(inputs), [inputs]);

  useEffect(() => {
    setPulse(true);
    const t = window.setTimeout(() => setPulse(false), 350);
    return () => window.clearTimeout(t);
  }, [calculation.total]);

  useEffect(() => {
    if (routeData.loading || routeData.error) return;
    if (routeData.lastUpdatedAt == null) return;
    if (routeData.lastUpdatedAt === lastSyncedAtRef.current) return;
    if (routeData.distanceKm == null) return;

    lastSyncedAtRef.current = routeData.lastUpdatedAt;

    const distanceKm = Math.round(routeData.distanceKm);
    const tolls = routeData.tollAmount;
    const tripDays =
      routeData.durationMin != null
        ? Math.max(1, Math.ceil(routeData.durationMin / 60 / 10))
        : DEFAULT_QUOTE.tripDays;

    const nextOrigin = routeData.resolvedOrigin ?? routeData.origin;
    const nextDestination =
      routeData.resolvedDestination ?? routeData.destination;

    setInputs((prev) => ({
      ...prev,
      origin: nextOrigin,
      destination: nextDestination,
      distanceUnit: 'km',
      distance: distanceKm,
      tolls: tolls ?? prev.tolls,
      tripDays,
    }));

    setSyncedFields(new Set(SYNCED_FIELDS));
    setSyncSummary({
      distanceKm,
      tolls,
      tripDays,
      destination: nextDestination,
    });

    if (highlightTimerRef.current != null) {
      window.clearTimeout(highlightTimerRef.current);
    }

    if (summaryTimerRef.current != null) {
      window.clearTimeout(summaryTimerRef.current);
    }

    highlightTimerRef.current = window.setTimeout(() => {
      setSyncedFields(new Set());
      highlightTimerRef.current = null;
    }, 2200);

    summaryTimerRef.current = window.setTimeout(() => {
      setSyncSummary(null);
      summaryTimerRef.current = null;
    }, 6000);
  }, [
    routeData.lastUpdatedAt,
    routeData.loading,
    routeData.error,
    routeData.distanceKm,
    routeData.durationMin,
    routeData.tollAmount,
    routeData.resolvedOrigin,
    routeData.resolvedDestination,
    routeData.origin,
    routeData.destination,
  ]);

  useEffect(
    () => () => {
      if (highlightTimerRef.current != null) {
        window.clearTimeout(highlightTimerRef.current);
      }
      if (summaryTimerRef.current != null) {
        window.clearTimeout(summaryTimerRef.current);
      }
    },
    [],
  );

  const setField = <K extends keyof QuoteInputs>(
    key: K,
    value: QuoteInputs[K],
  ) => {
    setInputs((prev) => ({ ...prev, [key]: value }));

    if ((SYNCED_FIELDS as readonly string[]).includes(key as string)) {
      setSyncedFields((prev) => {
        if (!prev.has(key as SyncedField)) return prev;
        const next = new Set(prev);
        next.delete(key as SyncedField);
        return next;
      });
    }
  };

  const onNumber =
    (key: keyof QuoteInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      const num = v === '' ? 0 : Math.max(0, Number(v));
      setField(key, num as QuoteInputs[typeof key]);
    };

  const distanceSuffix = inputs.distanceUnit === 'km' ? 'km' : 'mi';
  const efficiencySuffix =
    inputs.efficiencyUnit === 'km/l' ? 'km/l' : 'mpg';

  const handleGenerate = () => {
    setTouched(true);
    const currentErrors = validateQuote(inputs);
    if (Object.keys(currentErrors).length > 0) return;
    setShareOpen(true);
  };

  const handleReset = () => {
    setInputs(DEFAULT_QUOTE);
    setTouched(false);
    setSyncedFields(new Set());
    setSyncSummary(null);
  };

  const showError = (field: keyof QuoteInputs) =>
    touched ? errors[field] : undefined;

  const swapOriginDestination = () => {
    setInputs((p) => ({ ...p, origin: p.destination, destination: p.origin }));
  };

  const handleSyncToMap = () => {
    if (!inputs.origin.trim() || !inputs.destination.trim()) return;
    recalculateRoute({
      origin: inputs.origin,
      destination: inputs.destination,
    });
  };

  const isSynced = (field: SyncedField) => syncedFields.has(field);
  const syncRingClass =
    'ring-2 ring-brand-400/50 ring-offset-1 ring-offset-transparent transition-shadow duration-500';

  const breakdown = [
    {
      key: 'fuel',
      label: 'Combustible',
      value: calculation.fuel,
      icon: Fuel,
      color: 'from-brand-400 to-brand-600',
    },
    {
      key: 'tires',
      label: 'Desgaste de llantas',
      value: calculation.tires,
      icon: CircleDot,
      color: 'from-amber-300 to-amber-600',
    },
    {
      key: 'maintenance',
      label: 'Mantenimiento',
      value: calculation.maintenance,
      icon: Wrench,
      color: 'from-fuchsia-400 to-fuchsia-700',
    },
    {
      key: 'driver',
      label: 'Salario del chofer',
      value: calculation.driver,
      icon: HardHat,
      color: 'from-emerald-400 to-emerald-700',
    },
    {
      key: 'tolls',
      label: 'Casetas',
      value: calculation.tolls,
      icon: Receipt,
      color: 'from-rose-400 to-rose-700',
    },
    {
      key: 'perDiem',
      label: 'Viaticos',
      value: calculation.perDiem,
      icon: Wallet,
      color: 'from-sky-400 to-sky-700',
    },
  ] as const;

  const maxValue = Math.max(...breakdown.map((b) => b.value), 1);

  return (
    <section id="cotizador" className="section">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge">
            <Sparkles className="h-3.5 w-3.5 text-brand-400" />
            Cotizador inteligente
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Calcula tu viaje en <span className="gradient-text">menos de 60 segundos</span>
          </h2>
          <p className="mt-4 text-slate-300 [html:not(.dark)_&]:text-slate-600">
            Ingresa los datos de tu ruta y obten un desglose detallado de costos,
            margen y precio sugerido. Sin sorpresas, todo transparente.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* Left panel: inputs */}
          <div className="lg:col-span-7">
            <div className="card overflow-hidden p-5 sm:p-7">
              {syncSummary && (
                <SyncBanner
                  key={routeData.lastUpdatedAt ?? 0}
                  summary={syncSummary}
                />
              )}

              <SectionHeader
                icon={<MapPin className="h-4 w-4" />}
                title="Ruta y carga"
                subtitle="Donde inicia y termina tu viaje"
                aside={
                  <button
                    type="button"
                    onClick={handleSyncToMap}
                    disabled={
                      routeData.loading ||
                      !inputs.origin.trim() ||
                      !inputs.destination.trim()
                    }
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 text-[11px] font-medium text-slate-300 transition-all hover:border-brand-400/50 hover:bg-brand-400/10 hover:text-brand-300 disabled:cursor-not-allowed disabled:opacity-50 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white [html:not(.dark)_&]:text-slate-600 [html:not(.dark)_&]:hover:bg-brand-50 [html:not(.dark)_&]:hover:text-brand-700"
                  >
                    <Navigation
                      className={cn(
                        'h-3 w-3',
                        routeData.loading && 'animate-spin',
                      )}
                    />
                    {routeData.loading ? 'Calculando...' : 'Recalcular en mapa'}
                  </button>
                }
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
                <Field
                  label="Origen (Punto A)"
                  error={showError('origin')}
                  icon={<MapPin className="h-3.5 w-3.5 text-brand-400" />}
                >
                  {(id) => (
                    <PlacesAutocompleteInput
                      id={id}
                      placeholder="Empieza a escribir una ciudad..."
                      value={inputs.origin}
                      hasError={!!showError('origin')}
                      onChange={(v) => setField('origin', v)}
                      onSubmit={handleSyncToMap}
                      className={cn(isSynced('origin') && syncRingClass)}
                      ariaLabel="Origen"
                    />
                  )}
                </Field>

                <div className="hidden items-end pb-5 sm:flex">
                  <button
                    type="button"
                    onClick={swapOriginDestination}
                    aria-label="Intercambiar origen y destino"
                    className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:rotate-180 hover:border-brand-400/50 hover:text-brand-300 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white"
                  >
                    <ArrowDownUp className="h-4 w-4" />
                  </button>
                </div>

                <Field
                  label="Destino (Punto B)"
                  error={showError('destination')}
                  icon={<MapPin className="h-3.5 w-3.5 text-amber-400" />}
                >
                  {(id) => (
                    <PlacesAutocompleteInput
                      id={id}
                      placeholder="Empieza a escribir una ciudad..."
                      value={inputs.destination}
                      hasError={!!showError('destination')}
                      onChange={(v) => setField('destination', v)}
                      onSubmit={handleSyncToMap}
                      className={cn(isSynced('destination') && syncRingClass)}
                      ariaLabel="Destino"
                    />
                  )}
                </Field>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Unidad de distancia"
                  icon={<Ruler className="h-3.5 w-3.5 text-brand-400" />}
                >
                  {(id) => (
                    <UnitToggle
                      id={id}
                      options={[
                        { value: 'km', label: 'Kilometros' },
                        { value: 'mi', label: 'Millas' },
                      ]}
                      value={inputs.distanceUnit}
                      onChange={(v) =>
                        setField('distanceUnit', v as DistanceUnit)
                      }
                    />
                  )}
                </Field>

                <Field
                  label={`Distancia manual (${distanceSuffix})`}
                  error={showError('distance')}
                  icon={<Gauge className="h-3.5 w-3.5 text-brand-400" />}
                  suffix={distanceSuffix}
                  hint={
                    isSynced('distance')
                      ? 'Sincronizado desde el mapa'
                      : 'Si tienes la distancia exacta, sobrescribela'
                  }
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      withSuffix
                      hasError={!!showError('distance')}
                      value={inputs.distance || ''}
                      onChange={onNumber('distance')}
                      className={cn(isSynced('distance') && syncRingClass)}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Peso de la carga (toneladas)"
                  icon={<Truck className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('cargoWeight')}
                  suffix="t"
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      withSuffix
                      hasError={!!showError('cargoWeight')}
                      value={inputs.cargoWeight || ''}
                      onChange={onNumber('cargoWeight')}
                    />
                  )}
                </Field>
                <Field
                  label="Peso del camion vacio (t)"
                  icon={<Truck className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('emptyTruckWeight')}
                  suffix="t"
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      withSuffix
                      hasError={!!showError('emptyTruckWeight')}
                      value={inputs.emptyTruckWeight || ''}
                      onChange={onNumber('emptyTruckWeight')}
                    />
                  )}
                </Field>
              </div>

              <div className="divider-soft my-8" />

              <SectionHeader
                icon={<Fuel className="h-4 w-4" />}
                title="Costos operativos"
                subtitle="Combustible, salario y mantenimiento"
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Unidad de rendimiento"
                  icon={<Gauge className="h-3.5 w-3.5 text-brand-400" />}
                >
                  {(id) => (
                    <UnitToggle
                      id={id}
                      options={[
                        { value: 'km/l', label: 'km/litro' },
                        { value: 'mpg', label: 'millas/galon' },
                      ]}
                      value={inputs.efficiencyUnit}
                      onChange={(v) =>
                        setField('efficiencyUnit', v as EfficiencyUnit)
                      }
                    />
                  )}
                </Field>

                <Field
                  label={`Rendimiento (${efficiencySuffix})`}
                  icon={<Gauge className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('efficiency')}
                  suffix={efficiencySuffix}
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      step="0.1"
                      withSuffix
                      hasError={!!showError('efficiency')}
                      value={inputs.efficiency || ''}
                      onChange={onNumber('efficiency')}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Precio diesel / gasolina (por litro)"
                  icon={<Fuel className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('fuelPrice')}
                  prefix="$"
                  suffix="MXN"
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      step="0.01"
                      withPrefix
                      withSuffix
                      hasError={!!showError('fuelPrice')}
                      value={inputs.fuelPrice || ''}
                      onChange={onNumber('fuelPrice')}
                    />
                  )}
                </Field>
                <Field
                  label="Mantenimiento por km"
                  icon={<Wrench className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('maintenancePerKm')}
                  prefix="$"
                  suffix="/km"
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      step="0.01"
                      withPrefix
                      withSuffix
                      hasError={!!showError('maintenancePerKm')}
                      value={inputs.maintenancePerKm || ''}
                      onChange={onNumber('maintenancePerKm')}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Salario del chofer (por dia)"
                  icon={<HardHat className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('driverDailySalary')}
                  prefix="$"
                  suffix="MXN"
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      withPrefix
                      withSuffix
                      hasError={!!showError('driverDailySalary')}
                      value={inputs.driverDailySalary || ''}
                      onChange={onNumber('driverDailySalary')}
                    />
                  )}
                </Field>

                <Field
                  label="Duracion del viaje (dias)"
                  icon={<CalendarDays className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('tripDays')}
                  suffix="dias"
                  hint={
                    isSynced('tripDays')
                      ? 'Estimado desde la duracion del viaje'
                      : undefined
                  }
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      withSuffix
                      hasError={!!showError('tripDays')}
                      value={inputs.tripDays || ''}
                      onChange={onNumber('tripDays')}
                      className={cn(isSynced('tripDays') && syncRingClass)}
                    />
                  )}
                </Field>
              </div>

              <div className="divider-soft my-8" />

              <SectionHeader
                icon={<CircleDot className="h-4 w-4" />}
                title="Llantas, casetas y extras"
                subtitle="Desgaste, peajes y viaticos"
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Costo desgaste de llanta por km"
                  icon={<CircleDot className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('tireWearPerKm')}
                  prefix="$"
                  suffix="/km"
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      step="0.01"
                      withPrefix
                      withSuffix
                      hasError={!!showError('tireWearPerKm')}
                      value={inputs.tireWearPerKm || ''}
                      onChange={onNumber('tireWearPerKm')}
                    />
                  )}
                </Field>

                <Field
                  label="Numero de llantas"
                  icon={<CircleDot className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('numberOfTires')}
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      hasError={!!showError('numberOfTires')}
                      value={inputs.numberOfTires || ''}
                      onChange={onNumber('numberOfTires')}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Peajes / casetas"
                  icon={<Receipt className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('tolls')}
                  prefix="$"
                  suffix="MXN"
                  hint={
                    isSynced('tolls') ? 'Costo real estimado por Google' : undefined
                  }
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      withPrefix
                      withSuffix
                      hasError={!!showError('tolls')}
                      value={inputs.tolls || ''}
                      onChange={onNumber('tolls')}
                      className={cn(isSynced('tolls') && syncRingClass)}
                    />
                  )}
                </Field>

                <Field
                  label="Viaticos"
                  icon={<Wallet className="h-3.5 w-3.5 text-brand-400" />}
                  error={showError('perDiem')}
                  prefix="$"
                  suffix="MXN"
                >
                  {(id) => (
                    <NumberInput
                      id={id}
                      withPrefix
                      withSuffix
                      hasError={!!showError('perDiem')}
                      value={inputs.perDiem || ''}
                      onChange={onNumber('perDiem')}
                    />
                  )}
                </Field>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="btn-primary h-12 flex-1 text-sm sm:text-base"
                >
                  <Calculator className="h-4 w-4" />
                  Generar cotizacion
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary h-12 text-sm sm:text-base"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Limpiar datos
                </button>
              </div>

              {touched && hasErrors && (
                <p className="mt-3 text-[12px] text-rose-400">
                  Revisa los campos marcados antes de generar tu cotizacion.
                </p>
              )}
            </div>
          </div>

          {/* Right panel: results */}
          <aside className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="card overflow-hidden">
                <div className="relative overflow-hidden p-6 sm:p-7">
                  <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
                  <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <span className="badge">
                        <Sparkles className="h-3.5 w-3.5 text-brand-400" />
                        Cotizacion estimada
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500">
                        MXN
                      </span>
                    </div>

                    <p className="mt-4 text-xs uppercase tracking-wider text-slate-400">
                      Costo total del viaje
                    </p>
                    <p
                      className={cn(
                        'font-display text-5xl font-bold tracking-tight transition-all duration-300 sm:text-6xl num-shine animate-shine',
                        pulse && 'scale-[1.02]'
                      )}
                      style={{ animationDuration: '4s' }}
                    >
                      {formatMXN(calculation.total)}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MiniMetric
                        label="Distancia total"
                        value={`${formatNumber(calculation.distanceKm, 0)} km`}
                        icon={<Ruler className="h-3.5 w-3.5" />}
                      />
                      <MiniMetric
                        label="Subtotal operativo"
                        value={formatMXN(calculation.subtotal)}
                        icon={<Coins className="h-3.5 w-3.5" />}
                      />
                      <MiniMetric
                        label="Costo por km"
                        value={
                          calculation.distanceKm > 0
                            ? formatMXNFine(
                                calculation.total / calculation.distanceKm
                              )
                            : formatMXNFine(0)
                        }
                        icon={<LineChart className="h-3.5 w-3.5" />}
                      />
                      <MiniMetric
                        label="Costo por tonelada"
                        value={formatMXN(
                          calculation.total /
                            Math.max(1, inputs.cargoWeight || 1)
                        )}
                        icon={<Weight className="h-3.5 w-3.5" />}
                        accent
                      />
                    </div>
                  </div>
                </div>

                <div className="divider-soft" />

                <div className="p-6 sm:p-7">
                  <h3 className="text-sm font-semibold text-white [html:not(.dark)_&]:text-slate-900">
                    Desglose operativo
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {breakdown.map(({ key, label, value, icon: Icon, color }) => {
                      const pct = (value / maxValue) * 100;
                      return (
                        <li key={key}>
                          <div className="flex items-center justify-between text-xs">
                            <span className="inline-flex items-center gap-2 text-slate-300 [html:not(.dark)_&]:text-slate-700">
                              <Icon className="h-3.5 w-3.5 text-brand-400" />
                              {label}
                            </span>
                            <span className="font-medium text-white [html:not(.dark)_&]:text-slate-900">
                              {formatMXN(value)}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5 [html:not(.dark)_&]:bg-slate-200">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-500`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            />
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div className="mt-5 rounded-xl border border-brand-400/20 bg-brand-400/5 p-4 [html:not(.dark)_&]:border-brand-500/30 [html:not(.dark)_&]:bg-brand-50">
                    <div className="flex items-start gap-3">
                      <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white [html:not(.dark)_&]:text-slate-900">
                          Costo por tonelada
                        </p>
                        <p className="mt-1 text-xs text-slate-300 [html:not(.dark)_&]:text-slate-600">
                          Para una carga de {inputs.cargoWeight || 1} t, el
                          costo operativo por tonelada es de{' '}
                          <strong className="text-brand-300">
                            {formatMXN(
                              calculation.total /
                                Math.max(1, inputs.cargoWeight || 1)
                            )}
                          </strong>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {shareOpen && (
        <QuoteShareModal
          inputs={inputs}
          calculation={calculation}
          onClose={() => setShareOpen(false)}
        />
      )}
    </section>
  );
};

const SectionHeader = ({
  icon,
  title,
  subtitle,
  aside,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  aside?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between gap-3">
    <div className="flex items-start gap-3">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/15 text-brand-300">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white [html:not(.dark)_&]:text-slate-900">
          {title}
        </h3>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>
    </div>
    {aside && <div className="shrink-0">{aside}</div>}
  </div>
);

const SyncBanner = ({ summary }: { summary: SyncSummary }) => (
  <div className="mb-5 flex animate-fade-slide-in items-start gap-3 rounded-xl border border-brand-400/30 bg-gradient-to-br from-brand-400/15 via-brand-500/5 to-transparent px-4 py-3 [html:not(.dark)_&]:border-brand-500/30 [html:not(.dark)_&]:from-brand-100 [html:not(.dark)_&]:via-brand-50">
    <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500/25 text-brand-200 [html:not(.dark)_&]:bg-brand-500/15 [html:not(.dark)_&]:text-brand-700">
      <CheckCircle2 className="h-4 w-4" />
    </div>

    <div className="min-w-0 flex-1">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-white [html:not(.dark)_&]:text-slate-900">
        Cotizacion sincronizada con tu ruta
      </p>
      <p className="mt-0.5 truncate text-[11px] text-slate-300 [html:not(.dark)_&]:text-slate-600">
        Destino:{' '}
        <span className="font-medium text-white [html:not(.dark)_&]:text-slate-900">
          {summary.destination}
        </span>{' '}
        · {formatNumber(summary.distanceKm, 0)} km ·{' '}
        {summary.tolls != null ? formatMXN(summary.tolls) : 'sin casetas'} ·{' '}
        {summary.tripDays} {summary.tripDays === 1 ? 'dia' : 'dias'}
      </p>
    </div>
  </div>
);

type UnitToggleProps = {
  id?: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
};

const UnitToggle = ({ id, options, value, onChange }: UnitToggleProps) => (
  <div
    id={id}
    role="radiogroup"
    className="inline-flex w-full rounded-xl border border-white/10 bg-white/[0.04] p-1 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white"
  >
    {options.map((o) => {
      const active = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={active}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-lg px-3 py-2 text-xs font-medium transition-all',
            active
              ? 'bg-gradient-to-br from-brand-400 to-brand-600 text-ink-950 shadow-glow [html:not(.dark)_&]:text-white'
              : 'text-slate-300 hover:text-white [html:not(.dark)_&]:text-slate-600 [html:not(.dark)_&]:hover:text-slate-900'
          )}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const MiniMetric = ({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) => (
  <div
    className={cn(
      'rounded-xl border border-white/10 bg-white/[0.04] p-3 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-slate-50',
      accent &&
        'border-brand-400/30 bg-brand-400/10 [html:not(.dark)_&]:border-brand-500/30 [html:not(.dark)_&]:bg-brand-50'
    )}
  >
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400">
      {icon}
      {label}
    </div>
    <div
      className={cn(
        'mt-1 text-sm font-bold text-white [html:not(.dark)_&]:text-slate-900',
        accent && 'text-brand-300 [html:not(.dark)_&]:text-brand-700'
      )}
    >
      {value}
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*                     Quote share modal                              */
/* ------------------------------------------------------------------ */

const buildQuoteText = (inputs: QuoteInputs, calc: QuoteCalculation) => {
  const lines = [
    'TRANSPORTES EL GENA - Cotizacion',
    '',
    `Origen: ${inputs.origin}`,
    `Destino: ${inputs.destination}`,
    `Distancia: ${formatNumber(calc.distanceKm, 0)} km`,
    `Duracion: ${inputs.tripDays} ${inputs.tripDays === 1 ? 'dia' : 'dias'}`,
    `Carga: ${inputs.cargoWeight} t`,
    '',
    'Desglose operativo:',
    `- Combustible: ${formatMXN(calc.fuel)}`,
    `- Llantas: ${formatMXN(calc.tires)}`,
    `- Mantenimiento: ${formatMXN(calc.maintenance)}`,
    `- Salario chofer: ${formatMXN(calc.driver)}`,
    `- Casetas: ${formatMXN(calc.tolls)}`,
    `- Viaticos: ${formatMXN(calc.perDiem)}`,
    '',
    `TOTAL: ${formatMXN(calc.total)} MXN`,
    `Costo por km: ${
      calc.distanceKm > 0
        ? formatMXNFine(calc.total / calc.distanceKm)
        : formatMXNFine(0)
    }`,
    `Costo por tonelada: ${formatMXN(
      calc.total / Math.max(1, inputs.cargoWeight || 1),
    )}`,
    '',
    'Cotizacion valida por 7 dias',
  ];

  return lines.join('\n');
};

const QuoteShareModal = ({
  inputs,
  calculation,
  onClose,
}: {
  inputs: QuoteInputs;
  calculation: QuoteCalculation;
  onClose: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const copiedTimerRef = useRef<number | null>(null);

  const quoteText = useMemo(
    () => buildQuoteText(inputs, calculation),
    [inputs, calculation],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(
    () => () => {
      if (copiedTimerRef.current != null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    },
    [],
  );

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(quoteText);
      } else {
        const ta = document.createElement('textarea');
        ta.value = quoteText;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }

      setCopied(true);

      if (copiedTimerRef.current != null) {
        window.clearTimeout(copiedTimerRef.current);
      }

      copiedTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        copiedTimerRef.current = null;
      }, 1800);
    } catch (err) {
      console.warn('Copy failed', err);
    }
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(quoteText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handlePrint = () => {
    window.print();
  };

  const costPerKm =
    calculation.distanceKm > 0
      ? formatMXNFine(calculation.total / calculation.distanceKm)
      : formatMXNFine(0);

  const pricePerTon = formatMXN(
    calculation.total / Math.max(1, inputs.cargoWeight || 1),
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-share-title"
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-ink-950/70 p-4 backdrop-blur-md animate-fade-in sm:items-center [html:not(.dark)_&]:bg-slate-900/40"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-white/10 bg-ink-900/95 shadow-card backdrop-blur-2xl [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white/95 [html:not(.dark)_&]:shadow-card-light"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-400/40 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white [html:not(.dark)_&]:text-slate-600 [html:not(.dark)_&]:hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative overflow-hidden p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-amber-400/15 blur-3xl" />

          <div className="relative">
            <span className="badge">
              <Sparkles className="h-3.5 w-3.5 text-brand-400" />
              Cotizacion lista
            </span>

            <h3
              id="quote-share-title"
              className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl [html:not(.dark)_&]:text-slate-900"
            >
              {inputs.origin}
              <span className="mx-2 text-brand-400">→</span>
              {inputs.destination}
            </h3>

            <p className="mt-2 text-xs uppercase tracking-wider text-slate-400">
              Costo total del viaje
            </p>

            <p className="mt-1 font-display text-4xl font-bold tracking-tight num-shine animate-shine sm:text-5xl">
              {formatMXN(calculation.total)}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <ModalMetric
                label="Distancia"
                value={`${formatNumber(calculation.distanceKm, 0)} km`}
              />
              <ModalMetric
                label="Duracion"
                value={`${inputs.tripDays} ${inputs.tripDays === 1 ? 'dia' : 'dias'}`}
              />
              <ModalMetric label="Costo por km" value={costPerKm} />
              <ModalMetric
                label="Costo por tonelada"
                value={pricePerTon}
                accent
              />
            </div>
          </div>
        </div>

        <div className="divider-soft" />

        <div className="max-h-[260px] overflow-y-auto p-6 sm:p-7">
          <h4 className="text-sm font-semibold text-white [html:not(.dark)_&]:text-slate-900">
            Desglose operativo
          </h4>

          <ul className="mt-3 space-y-2 text-sm">
            <ModalRow label="Combustible" value={formatMXN(calculation.fuel)} />
            <ModalRow label="Llantas" value={formatMXN(calculation.tires)} />
            <ModalRow
              label="Mantenimiento"
              value={formatMXN(calculation.maintenance)}
            />
            <ModalRow
              label="Salario del chofer"
              value={formatMXN(calculation.driver)}
            />
            <ModalRow label="Casetas" value={formatMXN(calculation.tolls)} />
            <ModalRow label="Viaticos" value={formatMXN(calculation.perDiem)} />
            <li className="mt-2 border-t border-white/10 pt-2 [html:not(.dark)_&]:border-slate-200" />
            <ModalRow
              label="Total"
              value={formatMXN(calculation.total)}
              accent
            />
          </ul>
        </div>

        <div className="divider-soft" />

        <div className="flex flex-col gap-2 p-5 sm:flex-row sm:p-6">
          <button
            type="button"
            onClick={handleCopy}
            className={cn(
              'btn-secondary h-11 flex-1 text-sm transition-all',
              copied &&
                'border-emerald-400/50 text-emerald-300 hover:border-emerald-400/60 [html:not(.dark)_&]:border-emerald-500/50 [html:not(.dark)_&]:text-emerald-700',
            )}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copiado
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copiar texto
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary h-11 flex-1 text-sm"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="btn-primary h-11 flex-[1.4] text-sm"
          >
            <MessageCircle className="h-4 w-4" />
            Compartir por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

const ModalMetric = ({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <div
    className={cn(
      'rounded-xl border border-white/10 bg-white/[0.04] p-3 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-slate-50',
      accent &&
        'border-brand-400/30 bg-brand-400/10 [html:not(.dark)_&]:border-brand-500/30 [html:not(.dark)_&]:bg-brand-50',
    )}
  >
    <p className="text-[10px] uppercase tracking-wider text-slate-400">
      {label}
    </p>
    <p
      className={cn(
        'mt-0.5 text-sm font-bold text-white [html:not(.dark)_&]:text-slate-900',
        accent && 'text-brand-300 [html:not(.dark)_&]:text-brand-700',
      )}
    >
      {value}
    </p>
  </div>
);

const ModalRow = ({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) => (
  <li className="flex items-center justify-between">
    <span className="text-slate-300 [html:not(.dark)_&]:text-slate-600">
      {label}
    </span>
    <span
      className={cn(
        'font-semibold tabular-nums text-white [html:not(.dark)_&]:text-slate-900',
        accent && 'text-brand-300 [html:not(.dark)_&]:text-brand-700',
      )}
    >
      {value}
    </span>
  </li>
);
