import { Truck } from 'lucide-react';

type LogoProps = {
  compact?: boolean;
};

export const Logo = ({ compact = false }: LogoProps) => {
  return (
    <a
      href="#top"
      className="group inline-flex items-center gap-3"
      aria-label="Transportes El Gena - Inicio"
    >
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 shadow-glow transition-transform duration-300 group-hover:-rotate-6">
        <Truck className="h-5 w-5 text-ink-950" strokeWidth={2.4} />
        <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-base font-bold tracking-tight">
            Transportes <span className="gradient-text">El Gena</span>
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-400">
            Logistica inteligente
          </span>
        </span>
      )}
    </a>
  );
};
