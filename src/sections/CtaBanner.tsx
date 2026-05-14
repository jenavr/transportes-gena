import { ArrowRight, PhoneCall } from 'lucide-react';

export const CtaBanner = () => {
  return (
    <section className="section pt-0">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/30 via-ink-900 to-ink-950 p-8 shadow-card sm:p-12 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:from-brand-50 [html:not(.dark)_&]:via-white [html:not(.dark)_&]:to-white [html:not(.dark)_&]:shadow-card-light">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-60 w-60 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-grid-dark bg-[size:42px_42px] opacity-30 [html:not(.dark)_&]:hidden" />

          <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <span className="badge">Listo para empezar</span>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl [html:not(.dark)_&]:text-slate-900">
                Tu siguiente viaje cuesta lo justo.
              </h2>
              <p className="mt-2 max-w-xl text-sm text-slate-300 sm:text-base [html:not(.dark)_&]:text-slate-600">
                Genera tu cotizacion ahora o habla directamente con un ejecutivo.
                Tenemos disponibilidad inmediata en rutas troncales.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href="#cotizador" className="btn-primary h-12 px-6 text-sm">
                Cotizar viaje
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contacto" className="btn-secondary h-12 px-6 text-sm">
                <PhoneCall className="h-4 w-4" />
                Hablar con un asesor
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
