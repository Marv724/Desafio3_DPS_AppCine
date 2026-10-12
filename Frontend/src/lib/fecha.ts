const p = (n: number) => String(n).padStart(2, '0');

export const formatearFecha = (iso: string) => {
  const d = new Date(iso);
  return `${p(d.getUTCDate())}/${p(d.getUTCMonth() + 1)}/${d.getUTCFullYear()} ${p(d.getUTCHours())}:${p(d.getUTCMinutes())}`;
};