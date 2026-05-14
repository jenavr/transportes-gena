import {
  Truck,
  Route,
  Zap,
  Radar,
  Calculator,
  TrendingDown,
} from 'lucide-react';

const services = [
  {
    icon: Truck,
    title: 'Transporte de carga pesada',
    desc:
      'Trailers, plataformas y cajas secas para mover hasta 30 toneladas con seguridad y cobertura binacional Mexico - EE.UU.',
    accent: 'from-brand-400/30 to-brand-700/10',
  },
  {
    icon: Route,
    title: 'Rutas Mexico y EE.UU.',
    desc:
      'Cobertura en los 32 estados de Mexico y cruces fronterizos a Estados Unidos, con corredores logisticos optimizados y choferes certificados.',
    accent: 'from-amber-300/30 to-amber-600/10',
  },
  {
    icon: Zap,
    title: 'Fletes express',
    desc:
      'Servicio dedicado y entregas urgentes con tiempos garantizados para clientes que no pueden esperar.',
    accent: 'from-fuchsia-400/30 to-fuchsia-700/10',
  },
  {
    icon: Radar,
    title: 'Monitoreo de rutas',
    desc:
      'GPS en vivo, geocerca y reportes automaticos. Tu carga visible las 24 horas desde cualquier dispositivo.',
    accent: 'from-emerald-400/30 to-emerald-700/10',
  },
  {
    icon: Calculator,
    title: 'Cotizacion inteligente',
    desc:
      'Algoritmo propio que calcula combustible, casetas, viaticos, desgaste y margen en segundos.',
    accent: 'from-brand-400/30 to-brand-700/10',
  },
  {
    icon: TrendingDown,
    title: 'Optimizacion de costos',
    desc:
      'Identificamos rutas mas rentables, consolidamos viajes y reducimos kilometros muertos hasta un 22%.',
    accent: 'from-rose-400/30 to-rose-700/10',
  },
];

export const Services = () => {
  return (
    <section id="servicios" className="section">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="badge">Servicios</span>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            Todo lo que mueve <span className="gradient-text">tu operacion</span>
          </h2>
          <p className="mt-4 text-slate-300 [html:not(.dark)_&]:text-slate-600">
            Una plataforma integral que combina flota, tecnologia y datos para
            entregar mas, mas rapido y al menor costo posible.
          </p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, desc, accent }, i) => (
            <article
              key={title}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:shadow-glow backdrop-blur-xl [html:not(.dark)_&]:border-slate-200/70 [html:not(.dark)_&]:bg-white [html:not(.dark)_&]:shadow-card-light [html:not(.dark)_&]:hover:border-brand-400/40"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-70 transition-opacity duration-300 group-hover:opacity-100`}
              />

              <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-400 transition-transform duration-300 group-hover:-rotate-6 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-slate-50 [html:not(.dark)_&]:text-brand-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-white [html:not(.dark)_&]:text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300 [html:not(.dark)_&]:text-slate-600">
                  {desc}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400 transition-colors group-hover:text-brand-300">
                <span className="h-px w-6 bg-current" />
                Saber mas
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
