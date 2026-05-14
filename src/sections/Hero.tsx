import { ArrowRight, MapPinned, ShieldCheck, Sparkles, Truck, Gauge } from 'lucide-react';

export const Hero = () => {
  return (
    <section id="top" className="relative overflow-hidden pt-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-radial-glow" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-grid-dark bg-[size:48px_48px] mask-fade-b opacity-60 dark:opacity-60" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[600px] bg-grid-light bg-[size:48px_48px] mask-fade-b opacity-0 [html:not(.dark)_&]:opacity-100" />

      <div className="container-page relative">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="badge animate-fade-in-up">
              <span className="relative inline-flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-400" />
              </span>
              Logistica premium · Carga pesada
            </div>

            <h1
              className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl lg:text-7xl animate-fade-in-up"
              style={{ animationDelay: '60ms' }}
            >
              Carga pesada,{' '}
              <span className="gradient-text">rutas inteligentes</span> y{' '}
              <span className="relative inline-block">
                costos claros
                <svg
                  aria-hidden
                  viewBox="0 0 300 14"
                  className="absolute -bottom-2 left-0 h-3 w-full text-brand-400"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8 C 60 1, 140 14, 298 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>

            <p
              className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 dark:text-slate-300 sm:text-lg animate-fade-in-up [html:not(.dark)_&]:text-slate-600"
              style={{ animationDelay: '120ms' }}
            >
              Movemos tu carga por Mexico y Estados Unidos con tecnologia de cotizacion
              automatica, monitoreo en tiempo real y precios transparentes. Sin
              sorpresas, sin demoras.
            </p>

            <div
              className="mt-8 flex flex-col gap-3 sm:flex-row animate-fade-in-up"
              style={{ animationDelay: '180ms' }}
            >
              <a href="#cotizador" className="btn-primary h-12 px-6 text-sm sm:text-base">
                Cotizar viaje
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#cobertura" className="btn-secondary h-12 px-6 text-sm sm:text-base">
                <MapPinned className="h-4 w-4" />
                Ver cobertura
              </a>
            </div>

            <dl
              className="mt-12 grid grid-cols-3 gap-4 animate-fade-in-up"
              style={{ animationDelay: '240ms' }}
            >
              {[
                { k: '+250', v: 'rutas activas' },
                { k: '98%', v: 'a tiempo' },
                { k: '24/7', v: 'soporte' },
              ].map((s) => (
                <div key={s.v} className="glass rounded-2xl px-4 py-3">
                  <dt className="text-xl font-bold text-white dark:text-white [html:not(.dark)_&]:text-slate-900">
                    {s.k}
                  </dt>
                  <dd className="text-[11px] uppercase tracking-wider text-slate-400">
                    {s.v}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative lg:col-span-5">
            <HeroVisual />
          </div>
        </div>
      </div>

      <div className="container-page relative mt-20">
        <Marquee />
      </div>
    </section>
  );
};

const HeroVisual = () => {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-md animate-fade-in-up" style={{ animationDelay: '160ms' }}>
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-brand-400/30 via-brand-500/10 to-transparent blur-3xl" />

      <div className="glass-strong relative h-full w-full overflow-hidden rounded-[2rem] p-5 shadow-card">
        <div className="absolute inset-0 -z-0 opacity-50">
          <div className="absolute inset-0 bg-grid-dark bg-[size:32px_32px]" />
        </div>

        <div className="relative z-10 flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300 dark:text-slate-300 [html:not(.dark)_&]:text-slate-600">
              <Sparkles className="h-4 w-4 text-brand-400" />
              Dashboard en vivo
            </div>
            <div className="flex gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-400/80" />
              <span className="h-2 w-2 rounded-full bg-amber-300/80" />
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
            </div>
          </div>

          <div className="mt-5 flex-1">
            <RouteSVG />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <MiniStat icon={<Truck className="h-4 w-4 text-brand-400" />} label="Unidad" value="T-038" />
            <MiniStat icon={<Gauge className="h-4 w-4 text-brand-400" />} label="ETA" value="06:42" />
            <MiniStat icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />} label="Status" value="OK" />
          </div>
        </div>
      </div>

      <div className="absolute -bottom-14 -left-4 w-48 animate-float sm:-bottom-16 sm:-left-6">
        <div className="glass-strong rounded-2xl p-3 shadow-card">
          <p className="text-[10px] uppercase tracking-wider text-slate-400">Costo estimado</p>
          <p className="mt-1 font-display text-xl font-bold text-white dark:text-white [html:not(.dark)_&]:text-slate-900">
            $42,380
          </p>
          <p className="text-[11px] text-emerald-400">+18% margen ganancia</p>
        </div>
      </div>
    </div>
  );
};

const MiniStat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white">
    <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-slate-400">
      {icon}
      {label}
    </div>
    <div className="mt-0.5 text-sm font-semibold text-white dark:text-white [html:not(.dark)_&]:text-slate-900">
      {value}
    </div>
  </div>
);

const RouteSVG = () => (
  <svg viewBox="0 0 320 280" className="h-full w-full">
    <defs>
      <linearGradient id="route" x1="0" x2="1">
        <stop offset="0%" stopColor="#2fcdff" />
        <stop offset="100%" stopColor="#0091c7" />
      </linearGradient>
      <radialGradient id="dot" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#2fcdff" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#2fcdff" stopOpacity="0" />
      </radialGradient>
    </defs>

    <g opacity="0.45" stroke="rgba(255,255,255,0.12)">
      {Array.from({ length: 7 }).map((_, i) => (
        <line key={`h-${i}`} x1="0" y1={i * 40 + 20} x2="320" y2={i * 40 + 20} />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`v-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="280" />
      ))}
    </g>

    <path
      d="M30 230 C 80 200, 90 120, 160 130 S 260 80, 290 40"
      fill="none"
      stroke="url(#route)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeDasharray="6 8"
    >
      <animate
        attributeName="stroke-dashoffset"
        from="0"
        to="-140"
        dur="6s"
        repeatCount="indefinite"
      />
    </path>

    <circle cx="30" cy="230" r="22" fill="url(#dot)" />
    <circle cx="30" cy="230" r="5" fill="#2fcdff" />
    <circle cx="290" cy="40" r="22" fill="url(#dot)" />
    <circle cx="290" cy="40" r="5" fill="#f0b429" />

    <g className="animate-pulse-soft">
      <circle cx="160" cy="130" r="20" fill="rgba(47,205,255,0.15)" />
      <circle cx="160" cy="130" r="8" fill="#2fcdff" />
    </g>

    <g transform="translate(140 110)" opacity="0.95">
      <rect x="-12" y="-8" width="24" height="14" rx="2" fill="#0b1220" stroke="#2fcdff" />
      <rect x="6" y="-6" width="10" height="9" rx="1" fill="#0b1220" stroke="#2fcdff" />
      <circle cx="-6" cy="8" r="2" fill="#fff" />
      <circle cx="6" cy="8" r="2" fill="#fff" />
      <circle cx="13" cy="8" r="2" fill="#fff" />
    </g>
  </svg>
);

const partners = [
  'CEMEX', 'Bimbo', 'PEMEX', 'Heineken', 'FEMSA', 'Grupo Modelo', 'Mabe', 'La Costena', 'Lala', 'Sigma',
];

const Marquee = () => (
  <div className="glass relative overflow-hidden rounded-2xl py-5">
    <p className="px-6 text-[11px] uppercase tracking-[0.18em] text-slate-400">
      Empresas que confian en nuestra red
    </p>
    <div className="mt-3 flex w-max animate-marquee gap-12 px-6">
      {[...partners, ...partners].map((p, i) => (
        <span
          key={`${p}-${i}`}
          className="font-display text-lg font-bold tracking-wider text-slate-300/70 [html:not(.dark)_&]:text-slate-500"
        >
          {p}
        </span>
      ))}
    </div>
  </div>
);
