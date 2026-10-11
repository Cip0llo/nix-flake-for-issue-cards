import { useEffect, useState } from 'react';
import { foregroundFor, isHexColor } from '@/lib/accents';
import { bootVars, customVars, themeAppearance, type ThemeMode, type ThemeName } from '@/lib/themes';
import { SETTINGS_DEFAULTS, useAuthStore } from '@/stores/useAuthStore';
import { useLayoutStore } from '@/stores/useLayoutStore';
import type { ThemeChoice } from '@/types';

export type { ThemeName };

const SANS = '"Geist", "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif';

function usePrefersLight(): boolean {
  const [light, setLight] = useState(() => matchMedia('(prefers-color-scheme: light)').matches);

  useEffect(() => {
    const mq = matchMedia('(prefers-color-scheme: light)');
    const onChange = () => setLight(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return light;
}

export function useThemeName(): ThemeName {
  const theme = (useAuthStore(s => s.profile?.theme) ?? SETTINGS_DEFAULTS.theme) as ThemeChoice;
  const prefersLight = usePrefersLight();
  if (theme === 'system') return prefersLight ? 'light' : 'oled';
  return theme;
}

export function useThemeMode(): ThemeMode {
  const name = useThemeName();
  const custom = useLayoutStore(s => s.customTheme);
  return themeAppearance(name, custom).mode;
}

export function useApplyTheme(): void {
  const resolved = useThemeName();
  const custom = useLayoutStore(s => s.customTheme);
  const signedIn = useAuthStore(s => s.profile !== null);
  const accent = useAuthStore(s => s.profile?.accent) ?? SETTINGS_DEFAULTS.accent;
  const radius = useAuthStore(s => s.profile?.radius) ?? SETTINGS_DEFAULTS.radius;
  const monoUi = useAuthStore(s => s.profile?.monoUi) ?? SETTINGS_DEFAULTS.monoUi;

  useEffect(() => {
    if (!signedIn) return;
    const root = document.documentElement;
    const appearance = themeAppearance(resolved, custom);
    root.setAttribute('data-theme', resolved);
    root.setAttribute('data-mode', appearance.mode);

    const vars = customVars(custom);
    for (const [name, value] of Object.entries(vars)) root.style.setProperty(name, value);

    const themed = resolved === 'custom';
    const hexAccent = isHexColor(accent);
    const primary = themed
      ? { value: custom.primary, foreground: foregroundFor(custom.primary) }
      : hexAccent
        ? { value: accent, foreground: foregroundFor(accent) }
        : null;

    root.setAttribute('data-accent', themed || hexAccent ? 'custom' : accent);
    if (primary) {
      root.style.setProperty('--primary', primary.value);
      root.style.setProperty('--primary-foreground', primary.foreground);
    } else {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--primary-foreground');
    }
    root.style.setProperty('--radius', radius);
    root.style.setProperty('--font-sans', monoUi ? 'var(--font-mono)' : SANS);
    window.api?.shell.setTheme(resolved, appearance.background, appearance.mode === 'dark');

    localStorage.setItem(
      'ui:boot',
      JSON.stringify({
        theme: resolved,
        mode: appearance.mode,
        accent,
        radius,
        vars: bootVars(appearance, custom, primary),
      }),
    );
  }, [signedIn, resolved, custom, accent, radius, monoUi]);
}
