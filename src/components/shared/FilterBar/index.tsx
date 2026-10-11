import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { hasValue } from '@/lib/facets';
import { cn } from '@/lib/utils';

export interface FacetOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
  lead?: ReactNode;
}

export interface Facet {
  key: string;
  label: string;
  icon: LucideIcon;
  options: FacetOption[];
  selected: string[];
  onToggle: (value: string) => void;
  onClear: () => void;
  rowActions?: (option: FacetOption, close: () => void) => ReactNode;
  footer?: (close: () => void) => ReactNode;
}

const SEARCH_FROM = 8;

function Swatch({ color }: { color: string }) {
  return <span className="dot" style={{ background: color }} />;
}

function FacetMenu({ facet }: { facet: Facet }) {
  const [open, setOpen] = useState(false);
  const { icon: Icon, label, options, selected } = facet;
  const active = selected.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          data-active={active}
          className="gap-1.5 px-2.5 text-[12px] data-[active=true]:border-primary/60 data-[active=true]:bg-primary/10"
        >
          <Icon size={15} strokeWidth={1.6} />
          {label}
          {active && (
            <span className="tnum rounded-full bg-primary px-1.5 text-[10px] leading-4 text-primary-foreground">
              {selected.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-64 p-0">
        <Command>
          {options.length >= SEARCH_FROM && <CommandInput placeholder={`Find ${label.toLowerCase()}`} />}
          <CommandList className="max-h-64">
            <CommandEmpty className="py-4 text-center text-[12px] text-muted-foreground">
              Nothing matches
            </CommandEmpty>
            <CommandGroup>
              {options.map(option => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label]}
                  onSelect={() => facet.onToggle(option.value)}
                  className="group/option gap-2 text-[13px]"
                >
                  <Checkbox checked={hasValue(selected, option.value)} tabIndex={-1} className="pointer-events-none" />
                  {option.color && <Swatch color={option.color} />}
                  {option.lead}
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {facet.rowActions && (
                    <span className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/option:opacity-100 group-data-[selected=true]/option:opacity-100">
                      {facet.rowActions(option, () => setOpen(false))}
                    </span>
                  )}
                  {option.count !== undefined && (
                    <span className="tnum w-7 shrink-0 text-right text-[11px] text-muted-foreground">
                      {option.count}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <div className="flex items-center gap-1 border-t border-border p-1">
            {facet.footer?.(() => setOpen(false))}
            <Button
              variant="ghost"
              size="xs"
              disabled={!active}
              onClick={facet.onClear}
              className="ml-auto whitespace-nowrap"
            >
              <X size={13} strokeWidth={1.6} />
              Clear
            </Button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ActiveChips({ facets, onClearAll }: { facets: Facet[]; onClearAll: () => void }) {
  const chips = facets.flatMap(facet =>
    facet.selected.map(value => ({
      facet,
      value,
      option: facet.options.find(o => o.value === value),
    })),
  );
  if (chips.length === 0) return null;

  return (
    <div className="flex basis-full flex-wrap items-center gap-1.5">
      {chips.map(({ facet, value, option }) => (
        <Badge key={`${facet.key}:${value}`} variant="outline" className="gap-1.5 pr-1">
          {option?.color && <Swatch color={option.color} />}
          {option?.lead}
          {option?.label ?? value}
          <button
            type="button"
            aria-label={`remove ${option?.label ?? value}`}
            className="rounded-sm p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => facet.onToggle(value)}
          >
            <X size={11} strokeWidth={2} />
          </button>
        </Badge>
      ))}
      <Button variant="ghost" size="xs" onClick={onClearAll} className="text-muted-foreground">
        Clear all
      </Button>
    </div>
  );
}

interface FilterBarProps {
  facets: Facet[];
  onClearAll: () => void;
  className?: string;
}

export default function FilterBar({ facets, onClearAll, className }: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {facets.map(facet => (
        <FacetMenu key={facet.key} facet={facet} />
      ))}
      <ActiveChips facets={facets} onClearAll={onClearAll} />
    </div>
  );
}
