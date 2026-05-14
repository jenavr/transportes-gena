import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ChangeEvent,
  KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { apiUrl } from '../lib/api';
import { cn } from '../lib/format';

export type PlaceSuggestion = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: PlaceSuggestion) => void;
  onSubmit?: () => void;
  placeholder?: string;
  className?: string;
  hasError?: boolean;
  minChars?: number;
  debounceMs?: number;
  ariaLabel?: string;
};

const generateSessionToken = (): string => {
  if (
    typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto?.randomUUID === 'function'
  ) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

export const PlacesAutocompleteInput = ({
  id,
  value,
  onChange,
  onSelect,
  onSubmit,
  placeholder,
  className,
  hasError,
  minChars = 2,
  debounceMs = 220,
  ariaLabel,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const sessionTokenRef = useRef<string>(generateSessionToken());
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const justSelectedRef = useRef(false);

  const listboxId = useMemo(() => `places-listbox-${id ?? generateSessionToken()}`, [id]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);

    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const fetchSuggestions = useCallback(
    async (input: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      try {
        const res = await fetch(apiUrl('/api/places/autocomplete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input,
            sessionToken: sessionTokenRef.current,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          setSuggestions([]);
          setActiveIdx(-1);
          return;
        }

        const data = (await res.json()) as {
          suggestions?: PlaceSuggestion[];
        };

        const list = Array.isArray(data.suggestions)
          ? data.suggestions.slice(0, 6)
          : [];

        setSuggestions(list);
        setActiveIdx(list.length > 0 ? 0 : -1);
        if (list.length > 0) setOpen(true);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setSuggestions([]);
        setActiveIdx(-1);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    onChange(next);

    justSelectedRef.current = false;

    if (debounceRef.current != null) {
      window.clearTimeout(debounceRef.current);
    }

    const trimmed = next.trim();

    if (trimmed.length < minChars) {
      abortRef.current?.abort();
      setSuggestions([]);
      setActiveIdx(-1);
      setLoading(false);
      setOpen(false);
      return;
    }

    setOpen(true);
    setLoading(true);

    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(trimmed);
    }, debounceMs);
  };

  const selectSuggestion = (s: PlaceSuggestion) => {
    onChange(s.description);
    setSuggestions([]);
    setActiveIdx(-1);
    setOpen(false);
    justSelectedRef.current = true;
    sessionTokenRef.current = generateSessionToken();
    onSelect?.(s);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      if (suggestions.length > 0) {
        e.preventDefault();
        setOpen(true);
        setActiveIdx((i) =>
          suggestions.length === 0 ? -1 : (i + 1) % suggestions.length,
        );
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      if (suggestions.length > 0) {
        e.preventDefault();
        setOpen(true);
        setActiveIdx((i) =>
          suggestions.length === 0
            ? -1
            : i <= 0
              ? suggestions.length - 1
              : i - 1,
        );
      }
      return;
    }

    if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
      return;
    }

    if (e.key === 'Enter') {
      if (open && activeIdx >= 0 && suggestions[activeIdx]) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIdx]);
        return;
      }

      onSubmit?.();
      return;
    }
  };

  const showDropdown =
    open && (loading || suggestions.length > 0);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0 && !justSelectedRef.current) setOpen(true);
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={showDropdown}
        aria-activedescendant={
          activeIdx >= 0 && suggestions[activeIdx]
            ? `${listboxId}-opt-${activeIdx}`
            : undefined
        }
        role="combobox"
        autoComplete="off"
        spellCheck={false}
        className={cn('input', hasError && 'input-error', className)}
      />

      {loading && (
        <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-brand-400" />
      )}

      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-white/10 bg-ink-900/95 p-1 shadow-card backdrop-blur-2xl animate-fade-slide-in [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:bg-white/95 [html:not(.dark)_&]:shadow-card-light"
        >
          {loading && suggestions.length === 0 && (
            <li className="px-3 py-3">
              <div className="relative h-3 w-3/4 overflow-hidden rounded bg-white/10 [html:not(.dark)_&]:bg-slate-200">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent [html:not(.dark)_&]:via-white" />
              </div>
              <div className="relative mt-2 h-2.5 w-1/2 overflow-hidden rounded bg-white/10 [html:not(.dark)_&]:bg-slate-200">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent [html:not(.dark)_&]:via-white" />
              </div>
            </li>
          )}

          {!loading && suggestions.length === 0 && (
            <li className="px-3 py-3 text-xs text-slate-400">
              Sin resultados
            </li>
          )}

          {suggestions.map((s, i) => {
            const active = i === activeIdx;

            return (
              <li
                key={s.placeId}
                id={`${listboxId}-opt-${i}`}
                role="option"
                aria-selected={active}
              >
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s);
                  }}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={cn(
                    'flex w-full items-start gap-2 rounded-lg px-3 py-2.5 text-left transition-colors',
                    active
                      ? 'bg-brand-400/15 [html:not(.dark)_&]:bg-brand-50'
                      : 'hover:bg-white/5 [html:not(.dark)_&]:hover:bg-slate-50',
                  )}
                >
                  <MapPin
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors',
                      active
                        ? 'text-brand-300'
                        : 'text-slate-400 [html:not(.dark)_&]:text-slate-500',
                    )}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white [html:not(.dark)_&]:text-slate-900">
                      {s.mainText}
                    </p>
                    {s.secondaryText && (
                      <p className="truncate text-[11px] text-slate-400 [html:not(.dark)_&]:text-slate-500">
                        {s.secondaryText}
                      </p>
                    )}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
