import { FlaskConical, KanbanSquare, Settings, Trophy } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import NotificationTray from '@/components/shared/NotificationTray';
import AccountMenu from './AccountMenu';
import { useIssueStore } from '@/stores/useIssueStore';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useTestStore, waitingOnMe } from '@/stores/useTestStore';
import type { PanelId } from '@/types';

export interface NavItem {
  id: PanelId;
  label: string;
  icon: LucideIcon;
}

const PRIMARY: NavItem[] = [
  { id: 'issue-cards', label: 'Issue Cards', icon: KanbanSquare },
  { id: 'testing', label: 'Testing', icon: FlaskConical },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];
const SYSTEM: NavItem[] = [{ id: 'settings', label: 'Settings', icon: Settings }];

export const NAV_ITEMS: NavItem[] = [...PRIMARY, ...SYSTEM];

const TITLE_BAR = 32;

interface NavSidebarProps {
  expanded: boolean;
}

export default function NavSidebar({ expanded }: NavSidebarProps) {
  const activePanel = useLayoutStore(s => s.activePanel);
  const setActivePanel = useLayoutStore(s => s.setActivePanel);
  const openCount = useIssueStore(s => s.cards.filter(c => c.status === 'open').length);
  const toTest = useTestStore(s => waitingOnMe(s.features));

  function renderGroup(label: string, items: NavItem[]) {
    return (
      <SidebarGroup key={label}>
        <SidebarGroupLabel>{label}</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map(item => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={activePanel === item.id}
                  tooltip={item.label}
                  onClick={() => setActivePanel(item.id)}
                >
                  <item.icon size={15} strokeWidth={1.6} />
                  <span>{item.label}</span>
                </SidebarMenuButton>
                {item.id === 'issue-cards' && openCount > 0 && (
                  <SidebarMenuBadge>{openCount}</SidebarMenuBadge>
                )}
                {item.id === 'testing' && toTest > 0 && <SidebarMenuBadge>{toTest}</SidebarMenuBadge>}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <Sidebar
      collapsible="icon"
      className="group-data-[side=left]:border-r-0"
      style={{ top: TITLE_BAR, height: `calc(100svh - ${TITLE_BAR}px)` }}
    >
      <SidebarContent className="pt-1">
        {renderGroup('Workspace', PRIMARY)}
        {renderGroup('System', SYSTEM)}
      </SidebarContent>

      <SidebarFooter>
        <div className={`flex flex-col gap-1 ${expanded ? 'items-stretch' : 'items-center'}`}>
          <NotificationTray collapsed={!expanded} />
          <AccountMenu collapsed={!expanded} />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
