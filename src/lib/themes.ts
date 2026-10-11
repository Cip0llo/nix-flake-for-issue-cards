import { foregroundFor } from '@/lib/accents';
import type { ThemeChoice } from '@/types';

export type ThemeName = Exclude<ThemeChoice, 'system'>;
export type ThemeMode = 'dark' | 'light';

export interface ThemeInfo {
  id: ThemeName;
  label: string;
  mode: ThemeMode;
  background: string;
  foreground: string;
}

export const THEME_LIST: ThemeInfo[] = [
  { id: 'oled', label: 'OLED', mode: 'dark', background: '#000000', foreground: '#fafafa' },
  { id: 'dark', label: 'Dark', mode: 'dark', background: '#0a0a0a', foreground: '#fafafa' },
  { id: 'light', label: 'Light', mode: 'light', background: '#ffffff', foreground: '#09090b' },
  { id: 'midnight', label: 'Midnight', mode: 'dark', background: '#0b0e1a', foreground: '#e8ebff' },
  { id: 'forest', label: 'Forest', mode: 'dark', background: '#0a110d', foreground: '#e6f3ea' },
  { id: 'mocha', label: 'Mocha', mode: 'dark', background: '#14100d', foreground: '#f3e9e0' },
  { id: 'sand', label: 'Sand', mode: 'light', background: '#f6f1e7', foreground: '#2b2419' },
];

export interface CustomTheme {
  background: string;
  card: string;
  foreground: string;
  primary: string;
  secondary: string;
}

export const DEFAULT_CUSTOM: CustomTheme = {
  background: '#12131a',
  card: '#1a1c26',
  foreground: '#eef0f6',
  primary: '#7c5cff',
  secondary: '#2a2d3d',
};

export const CUSTOM_FIELDS: { key: keyof CustomTheme; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'card', label: 'Surface' },
  { key: 'foreground', label: 'Text' },
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
];

function rgb(hex: string): [number, number, number] {
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

export function isDarkHex(hex: string): boolean {
  const [r, g, b] = rgb(hex).map(v => v / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5;
}

export function themeAppearance(
  name: ThemeName,
  custom: CustomTheme,
): { mode: ThemeMode; background: string; foreground: string } {
  if (name === 'custom') {
    return {
      mode: isDarkHex(custom.background) ? 'dark' : 'light',
      background: custom.background,
      foreground: custom.foreground,
    };
  }
  const info = THEME_LIST.find(theme => theme.id === name) ?? THEME_LIST[0];
  return { mode: info.mode, background: info.background, foreground: info.foreground };
}

export function customVars(custom: CustomTheme): Record<string, string> {
  return {
    '--custom-background': custom.background,
    '--custom-card': custom.card,
    '--custom-foreground': custom.foreground,
    '--custom-secondary': custom.secondary,
    '--custom-secondary-foreground': foregroundFor(custom.secondary),
  };
}

export function bootVars(
  appearance: { background: string; foreground: string },
  custom: CustomTheme,
  primary: { value: string; foreground: string } | null,
): Record<string, string> {
  const vars: Record<string, string> = {
    '--boot-bg': appearance.background,
    '--boot-fg': rgb(appearance.foreground).join(' '),
    ...customVars(custom),
  };
  if (primary) {
    vars['--primary'] = primary.value;
    vars['--primary-foreground'] = primary.foreground;
  }
  return vars;
}
