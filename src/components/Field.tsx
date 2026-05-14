import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '../lib/format';

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  suffix?: ReactNode;
  prefix?: ReactNode;
  children: (id: string) => ReactNode;
};

export const Field = ({ label, hint, error, icon, suffix, prefix, children }: FieldProps) => {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {prefix}
          </span>
        )}
        {children(id)}
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 [html:not(.dark)_&]:text-slate-500">
            {suffix}
          </span>
        )}
      </div>
      <div className="min-h-[16px]">
        {error ? (
          <p className="text-[11px] font-medium text-rose-400">{error}</p>
        ) : hint ? (
          <p className="text-[11px] text-slate-500">{hint}</p>
        ) : null}
      </div>
    </div>
  );
};

type NumberInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
  withPrefix?: boolean;
  withSuffix?: boolean;
};

export const NumberInput = ({
  hasError,
  withPrefix,
  withSuffix,
  className,
  ...rest
}: NumberInputProps) => (
  <input
    type="number"
    inputMode="decimal"
    min={0}
    className={cn(
      'input',
      withPrefix && 'pl-8',
      withSuffix && 'pr-12',
      hasError && 'input-error',
      className
    )}
    {...rest}
  />
);

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const TextInput = ({ hasError, className, ...rest }: TextInputProps) => (
  <input
    type="text"
    className={cn('input', hasError && 'input-error', className)}
    {...rest}
  />
);
