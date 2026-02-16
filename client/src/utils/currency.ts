export const formatMillions = (value: number | string): string => {
  const num = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(num)) {
    return '0 M€';
  }
  return `${Math.round(num)} M€`;
};

export const sanitizeDecimalInput = (value: string): string => {
  return value.replace(/[^0-9]/g, '');
};
