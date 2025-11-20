export interface AccessibilityConfig {
  textScale: number;
  highContrast: boolean;
  focusVisible: boolean;
  colorblindMode: ColorblindMode;
}

export type ColorblindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export const colorblindFilters: Record<ColorblindMode, string> = {
  none: 'none',
  protanopia: 'url(#protanopia-filter)',
  deuteranopia: 'url(#deuteranopia-filter)',
  tritanopia: 'url(#tritanopia-filter)',
};

export function applyColorblindFilter(mode: ColorblindMode): void {
  const root = document.documentElement;
  const filter = colorblindFilters[mode];

  if (mode === 'none') {
    root.style.filter = 'none';
    return;
  }

  if (!document.getElementById('colorblind-filters')) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'colorblind-filters';
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.innerHTML = `
      <defs>
        <filter id="protanopia-filter">
          <feColorMatrix type="matrix" values="
            0.567, 0.433, 0.000, 0, 0
            0.558, 0.442, 0.000, 0, 0
            0.000, 0.242, 0.758, 0, 0
            0.000, 0.000, 0.000, 1, 0
          "/>
        </filter>
        <filter id="deuteranopia-filter">
          <feColorMatrix type="matrix" values="
            0.625, 0.375, 0.000, 0, 0
            0.700, 0.300, 0.000, 0, 0
            0.000, 0.300, 0.700, 0, 0
            0.000, 0.000, 0.000, 1, 0
          "/>
        </filter>
        <filter id="tritanopia-filter">
          <feColorMatrix type="matrix" values="
            0.950, 0.050, 0.000, 0, 0
            0.000, 0.433, 0.567, 0, 0
            0.000, 0.475, 0.525, 0, 0
            0.000, 0.000, 0.000, 1, 0
          "/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
  }

  root.style.filter = filter;
}

export function applyTextScale(scale: number): void {
  const root = document.documentElement;
  root.style.fontSize = `${scale * 16}px`;
}

export function applyHighContrast(enabled: boolean, isDark: boolean): void {
  const root = document.documentElement;

  if (enabled) {
    root.classList.add('high-contrast');
    if (isDark) {
      root.style.setProperty('--color-text', '#ffffff');
      root.style.setProperty('--color-background', '#000000');
      root.style.setProperty('--color-border', '#ffffff');
    } else {
      root.style.setProperty('--color-text', '#000000');
      root.style.setProperty('--color-background', '#ffffff');
      root.style.setProperty('--color-border', '#000000');
    }
  } else {
    root.classList.remove('high-contrast');
  }
}

export function applyFocusVisible(enabled: boolean): void {
  const root = document.documentElement;

  if (enabled) {
    root.classList.add('focus-visible-enabled');
  } else {
    root.classList.remove('focus-visible-enabled');
  }
}

export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const rsRGB = r / 255;
    const gsRGB = g / 255;
    const bsRGB = b / 255;

    const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

export function meetsWCAGAAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}
