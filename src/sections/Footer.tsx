import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { Logo } from '../components/Logo';

const FacebookIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.77l-.44 2.89h-2.33v6.99A10 10 0 0 0 22 12z" />
  </svg>
);

const InstagramIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <rect width="20" height="20" x="2" y="2" rx="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zm1.78 13.02H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
);

const linkGroups = [
  {
    title: 'Servicios',
    links: [
      { label: 'Carga pesada', href: '#servicios' },
      { label: 'Fletes express', href: '#servicios' },
      { label: 'Rutas Mexico - EE.UU.', href: '#servicios' },
      { label: 'Monitoreo de rutas', href: '#servicios' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nosotros', href: '#empresa' },
      { label: 'Cobertura', href: '#cobertura' },
      { label: 'Testimonios', href: '#testimonios' },
      { label: 'Trabaja con nosotros', href: '#contacto' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Cotizador', href: '#cotizador' },
      { label: 'Calculadora de rutas', href: '#cobertura' },
      { label: 'Blog logistico', href: '#' },
      { label: 'Preguntas frecuentes', href: '#' },
    ],
  },
];

const socials = [
  { icon: FacebookIcon, href: '#', label: 'Facebook' },
  { icon: InstagramIcon, href: '#', label: 'Instagram' },
  { icon: TwitterIcon, href: '#', label: 'Twitter / X' },
  { icon: LinkedinIcon, href: '#', label: 'LinkedIn' },
];

export const Footer = () => {
  return (
    <footer id="contacto" className="relative mt-20 border-t border-white/5 [html:not(.dark)_&]:border-slate-200">
      <div className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm text-slate-300 [html:not(.dark)_&]:text-slate-600">
              Movemos tu carga con tecnologia, transparencia y compromiso. Una
              empresa mexicana que mueve carga entre Mexico y Estados Unidos.
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <ContactLine
                icon={<MessageCircle className="h-4 w-4 text-emerald-400" />}
                label="WhatsApp"
                value="+52 614 268 6518"
                href="https://wa.me/528112345678"
              />
              <ContactLine
                icon={<Mail className="h-4 w-4 text-brand-400" />}
                label="Correo"
                value="enagena777@gmail.com"
                href="mailto:enagena777@gmail.com"
              />
              <ContactLine
                icon={<MapPin className="h-4 w-4 text-amber-400" />}
                label="Direccion"
                value="Chihuahua, Chihuahua"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {linkGroups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-200 [html:not(.dark)_&]:text-slate-900">
                  {group.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.label}>
                      <a
                        href={l.href}
                        className="text-sm text-slate-400 transition-colors hover:text-white [html:not(.dark)_&]:hover:text-slate-900"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="divider-soft my-10" />

        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Transportes El Gena. Todos los
            derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white [html:not(.dark)_&]:text-slate-600 [html:not(.dark)_&]:hover:text-slate-900"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

type ContactLineProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
};

const ContactLine = ({ icon, label, value, href }: ContactLineProps) => {
  const content = (
    <div className="group flex items-center gap-3">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white">
        {icon}
      </span>
      <span>
        <span className="block text-[10px] uppercase tracking-wider text-slate-400">
          {label}
        </span>
        <span className="text-sm text-slate-200 transition-colors group-hover:text-white [html:not(.dark)_&]:text-slate-700 [html:not(.dark)_&]:group-hover:text-slate-900">
          {value}
        </span>
      </span>
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }
  return content;
};
