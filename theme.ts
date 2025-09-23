// Centralized theme and color palette for the app
export const colors = {
  primary: '#FF6B35', // main brand color (warm pizza orange)
  primaryDark: '#E2592A',
  primaryLight: '#FF8E53',
  accent: '#F7931E',
  background: '#25292e',
  surface: '#FFFFFF',
  surfaceAlt: '#F8F9FA',
  muted: '#636E72',
  text: '#2D3436',
  textOnPrimary: '#FFFFFF',
  danger: '#FF4757',
  success: '#4CAF50',
};

export const gradients = {
  primary: [colors.primary, colors.primaryLight],
  accent: [colors.primary, colors.accent],
};

export function parseBrazilianPrice(text: string) {
  // Accept formats like "R$ 12,34" or "R$ 1.234,56" or "R$ 12.34"
  const m = text.match(/R\$\s*([0-9.,]+)/);
  if (!m) return null;
  let raw = m[1];
  // Remove thousand separators (both dots and spaces)
  raw = raw.replace(/\.(?=\d{3}(?:[,\.|]|$))/g, '');
  raw = raw.replace(/\s+/g, '');
  // Replace comma decimal with dot
  raw = raw.replace(',', '.');
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : null;
}

export default { colors, gradients, parseBrazilianPrice };
