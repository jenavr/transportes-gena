export const mxn = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});

export const mxnFine = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
});

export const numberFmt = new Intl.NumberFormat('es-MX', {
  maximumFractionDigits: 2,
});

export const formatMXN = (value: number) => {
  if (!Number.isFinite(value)) return mxn.format(0);
  return mxn.format(value);
};

export const formatMXNFine = (value: number) => {
  if (!Number.isFinite(value)) return mxnFine.format(0);
  return mxnFine.format(value);
};

export const formatNumber = (value: number, fractionDigits = 2) => {
  if (!Number.isFinite(value)) return '0';
  return new Intl.NumberFormat('es-MX', {
    maximumFractionDigits: fractionDigits,
  }).format(value);
};

export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');
