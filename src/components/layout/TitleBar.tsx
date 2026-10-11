import { useEffect, useState } from 'react';
import { Copy, Download, Minus, PanelLeft, RotateCw, Square, Ticket, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { resolveBindings } from '@/lib/commands';
import { formatBinding } from '@/lib/keys';
import { useAuthStore } from '@/stores/useAuthStore';
import { useLayoutStore } from '@/stores/useLayoutStore';
import { useUpdateStore } from '@/stores/useUpdateStore';

const DRAG = { WebkitAppRegion: 'drag' } as React.CSSProperties;
const NO_DRAG = { WebkitAppRegion: 'no-drag' } as React.CSSProperties;

const RAIL = 48;

const BUTTON = 'flex h-8 w-11 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground';

export default function TitleBar() {
  const workspace = useAuthStore(s => s.workspaces.find(w => w.id === s.activeWorkspaceId)?.name ?? null);
  const navMode = useLayoutStore(s => s.navSidebar.mode);
  const navWidth = useLayoutStore(s => s.navSidebar.width);
  const setNavSidebar = useLayoutStore(s => s.setNavSidebar);
  const workspaceColor = useAuthStore(
    s => s.workspaces.find(w => w.id === s.activeWorkspaceId)?.color ?? 'blue',
  );
  const binding = useAuthStore(s => resolveBindings(s.profile?.keys)['nav.toggle']);
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    void window.api.shell.isMaximized().then(setMaximized);
    return window.api.shell.onMaximized(setMaximized);
  }, []);

  const expanded = navMode === 'expanded';

  function toggleExpand() {
    setNavSidebar({ mode: expanded ? 'retracted' : 'expanded' });
  }

  return (
    <div style={DRAG} className="relative z-30 flex h-8 shrink-0 select-none items-stretch bg-sidebar text-muted-foreground">
      <div
        data-accent={workspaceColor}
        className={`flex shrink-0 items-center gap-2 overflow-hidden pt-1 transition-[width] duration-200 ease-linear ${expanded ? 'pl-3 pr-2' : 'justify-center'}`}
        style={{ width: expanded ? navWidth : RAIL }}
      >
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{
            color: 'var(--primary)',
            background: 'color-mix(in oklab, var(--primary) 18%, transparent)',
          }}
        >
          <Ticket size={14} strokeWidth={1.6} />
        </div>
        {expanded && (
          <>
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">Issue Cards</span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  style={NO_DRAG}
                  className="flex size-7 shrink-0 items-center justify-center rounded-md hover:bg-accent hover:text-foreground"
                  onClick={toggleExpand}
                  aria-label="Collapse sidebar"
                >
                  <PanelLeft size={15} strokeWidth={1.6} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-1.5">
                Collapse
                {binding && (
                  <KbdGroup>
                    {formatBinding(binding).map(key => (
                      <Kbd key={key}>{key}</Kbd>
                    ))}
                  </KbdGroup>
                )}
              </TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
      <div className="flex min-w-0 flex-1 items-center">
        <span className="min-w-0 flex-1 truncate px-3 text-xs">
          Issue Cards
          {workspace && <span className="text-muted-foreground/60"> | {workspace}</span>}
        </span>
        <div style={NO_DRAG} className="flex shrink-0 items-center self-stretch">
          <UpdateStatus />
          <button className={BUTTON} onClick={() => window.api.shell.minimize()} aria-label="Minimize">
            <Minus size={14} strokeWidth={1.6} />
          </button>
          <button
            className={BUTTON}
            onClick={() => window.api.shell.toggleMaximize()}
            aria-label={maximized ? 'Restore' : 'Maximize'}
          >
            {maximized ? <Copy size={12} strokeWidth={1.6} /> : <Square size={12} strokeWidth={1.6} />}
          </button>
          <button
            className={`${BUTTON} hover:bg-destructive hover:text-destructive-foreground`}
            onClick={() => window.api.shell.close()}
            aria-label="Close"
          >
            <X size={14} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
}

function UpdateStatus() {
  const state = useUpdateStore(s => s.state);
  const install = useUpdateStore(s => s.install);

  if (state.stage !== 'downloading' && state.stage !== 'ready') return null;

  return (
    <>
      {state.stage === 'downloading' ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-2 px-2 text-[12px] text-muted-foreground">
              <Download size={15} strokeWidth={1.6} />
              <Progress value={state.percent} className="h-1 w-16" />
              <span className="tnum">{state.percent}%</span>
            </span>
          </TooltipTrigger>
          <TooltipContent side="bottom">Downloading version {state.version}</TooltipContent>
        </Tooltip>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" className="mx-1 h-6 px-2 text-[12px]" onClick={install}>
              <RotateCw size={15} strokeWidth={1.6} />
              Restart to update
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Installs {state.version}, the window closes for a moment</TooltipContent>
        </Tooltip>
      )}
      <Separator orientation="vertical" className="mx-1 h-4" />
    </>
  );
}
