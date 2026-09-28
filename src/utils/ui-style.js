export const UI_STYLES = ['liquid-glass', 'minimal', 'retro'];

export function normalizeUiStyle(value) {
  if (value === 'minimal' || value === 'retro') return value;
  return 'liquid-glass';
}
