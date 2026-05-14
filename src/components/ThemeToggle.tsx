import { Moon, Sun } from 'lucide-react';
import type { Theme } from '../hooks/useTheme';

type Props = {
  theme: Theme;
  onToggle: () => void;
};

export const ThemeToggle = ({ theme, onToggle }: Props) => {
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-all hover:border-white/20 hover:bg-white/10 dark:text-slate-200"
    >
      <Sun
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'
        }`}
      />
      <Moon
        className={`absolute h-5 w-5 transition-all duration-300 ${
          isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'
        }`}
      />
    </button>
  );
};
