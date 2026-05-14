import { useEffect, useState } from 'react';
import { Menu, X, PhoneCall } from 'lucide-react';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import type { Theme } from '../hooks/useTheme';

const links = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#cotizador', label: 'Cotizador' },
  { href: '#cobertura', label: 'Cobertura' },
];

type Props = {
  theme: Theme;
  onToggleTheme: () => void;
};

export const Navbar = ({ theme, onToggleTheme }: Props) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/5 backdrop-blur-2xl bg-ink-950/70 dark:bg-ink-950/70'
          : 'bg-transparent'
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#cotizador"
            className="btn-primary hidden h-10 px-4 text-sm sm:inline-flex"
          >
            <PhoneCall className="h-4 w-4" />
            Cotizar viaje
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <div className="container-page pb-4 pt-2">
            <div className="glass-strong rounded-2xl p-3">
              <nav className="flex flex-col">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-slate-200 hover:bg-white/5"
                  >
                    {link.label}
                  </a>
                ))}
                <a
                  href="#cotizador"
                  onClick={() => setOpen(false)}
                  className="btn-primary mt-2 h-11 text-sm"
                >
                  <PhoneCall className="h-4 w-4" />
                  Cotizar viaje
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
