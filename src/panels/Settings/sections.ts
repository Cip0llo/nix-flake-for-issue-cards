import { Bell, Boxes, Download, Keyboard, Palette, Plug, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { SettingsSection } from '@/types';

export interface SectionInfo {
  id: SettingsSection;
  label: string;
  hint: string;
  icon: LucideIcon;
  rows: string[];
}

export const SETTINGS_SECTIONS: SectionInfo[] = [
  {
    id: 'account',
    label: 'Account',
    hint: 'Who you are, your picture and your password',
    icon: UserRound,
    rows: ['Signed in as', 'Display name', 'About you', 'Avatar border', 'Password', 'Sign out'],
  },
  {
    id: 'appearance',
    label: 'Appearance',
    hint: 'Theme, accent, corners and how faces and names look',
    icon: Palette,
    rows: [
      'Theme',
      'Custom colors',
      'Accent',
      'Corners',
      'Monospace interface',
      'Clicking a face',
      'Right click menu',
      'Underline a name on hover',
      'Face shape',
    ],
  },
  {
    id: 'workspace',
    label: 'Workspace',
    hint: 'The open workspace, its invite code and the people in it',
    icon: Boxes,
    rows: ['Name', 'Current version', 'Invite code', 'Color', 'Leave', 'People'],
  },
  {
    id: 'notifications',
    label: 'Notifications',
    hint: 'When the app tells you something happened',
    icon: Bell,
    rows: ['Desktop pop ups'],
  },
  {
    id: 'keystrokes',
    label: 'Keystrokes',
    hint: 'Shortcuts for every command, and the double Shift finder',
    icon: Keyboard,
    rows: ['Keystrokes', 'Double Shift opens the finder'],
  },
  {
    id: 'updates',
    label: 'Updates',
    hint: 'Version, update checks and restart to update',
    icon: Download,
    rows: ['Progress', 'What changed', 'Check for updates'],
  },
  {
    id: 'connection',
    label: 'Connection',
    hint: 'The Supabase project and the image host this app uses',
    icon: Plug,
    rows: ['Project URL', 'Anon key', 'Imgur Client-ID', 'Apply'],
  },
];
