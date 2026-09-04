const SUFFIXES = [
  { value: 1e18, suffix: 'Qi' },
  { value: 1e15, suffix: 'Q' },
  { value: 1e12, suffix: 'T' },
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
] as const;

export function formatMoney(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const rounded = Math.round(value);
  const abs = Math.abs(rounded);
  if (abs < 1_000_000) return rounded.toLocaleString();

  const unit = SUFFIXES.find(entry => abs >= entry.value);
  if (!unit) return rounded.toLocaleString();
  const scaled = rounded / unit.value;
  const digits = Math.abs(scaled) >= 100 ? 0 : Math.abs(scaled) >= 10 ? 1 : 2;
  return `${Number(scaled.toFixed(digits))}${unit.suffix}`;
}

export function exactMoney(value: number): string {
  return Number.isFinite(value) ? Math.round(value).toLocaleString() : 'Unavailable';
}
