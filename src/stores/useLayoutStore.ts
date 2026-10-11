import { create } from 'zustand';
import { DEFAULT_CUSTOM, type CustomTheme } from '@/lib/themes';
import type { IdentityPrefs, LayoutState, PanelId, SettingsSection, SidebarState } from '@/types';

const STORE_KEY = 'issue-cards:layout';

export const DEFAULT_LAYOUT: LayoutState = {
  activePanel: 'issue-cards',
  navSidebar: { mode: 'retracted', width: 240 },
  lastSelectedIssueId: null,
  issueColumnWidths: {},
  issueSheetWidth: 560,
  settingsSection: 'account',
  customTheme: DEFAULT_CUSTOM,
  identity: { click: 'profile', menu: true, underline: true, shape: 'circle' },
};

interface LayoutStore extends LayoutState {
  setActivePanel: (id: PanelId) => void;
  setNavSidebar: (patch: Partial<SidebarState>) => void;
  setLastSelectedIssue: (id: string | null) => void;
  setIssueColumnWidth: (column: string, width: number) => void;
  setIssueSheetWidth: (width: number) => void;
  setSettingsSection: (section: SettingsSection) => void;
  setCustomTheme: (patch: Partial<CustomTheme>) => void;
  setIdentity: (patch: Partial<IdentityPrefs>) => void;
}

function load(): LayoutState {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return DEFAULT_LAYOUT;
    const saved = { ...DEFAULT_LAYOUT, ...(JSON.parse(raw) as Partial<LayoutState>) };
    saved.identity = { ...DEFAULT_LAYOUT.identity, ...(saved.identity ?? {}) };
    saved.customTheme = { ...DEFAULT_CUSTOM, ...(saved.customTheme ?? {}) };
    if ((saved.navSidebar.mode as string) === 'locked-retracted') {
      saved.navSidebar = { ...saved.navSidebar, mode: 'retracted' };
    }
    return saved;
  } catch {
    return DEFAULT_LAYOUT;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

function scheduleSave(state: LayoutState): void {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    const snapshot: LayoutState = {
      activePanel: state.activePanel,
      navSidebar: state.navSidebar,
      lastSelectedIssueId: state.lastSelectedIssueId,
      issueColumnWidths: state.issueColumnWidths,
      issueSheetWidth: state.issueSheetWidth,
      settingsSection: state.settingsSection,
      customTheme: state.customTheme,
      identity: state.identity,
    };
    localStorage.setItem(STORE_KEY, JSON.stringify(snapshot));
  }, 300);
}

export const useLayoutStore = create<LayoutStore>((set, get) => {
  const save = () => scheduleSave(get());

  return {
    ...load(),

    setActivePanel: id => {
      if (get().activePanel === id) return;
      set({ activePanel: id });
      save();
    },

    setNavSidebar: patch => {
      set(s => ({ navSidebar: { ...s.navSidebar, ...patch } }));
      save();
    },

    setLastSelectedIssue: id => {
      set({ lastSelectedIssueId: id });
      save();
    },

    setIssueColumnWidth: (column, width) => {
      set(s => ({ issueColumnWidths: { ...s.issueColumnWidths, [column]: width } }));
      save();
    },

    setIssueSheetWidth: width => {
      set({ issueSheetWidth: Math.round(width) });
      save();
    },

    setCustomTheme: patch => {
      set(s => ({ customTheme: { ...s.customTheme, ...patch } }));
      save();
    },

    setSettingsSection: section => {
      set({ settingsSection: section });
      save();
    },

    setIdentity: patch => {
      set(s => ({ identity: { ...s.identity, ...patch } }));
      save();
    },
  };
});
