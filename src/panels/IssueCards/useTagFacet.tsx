import { useMemo, useState, type ReactNode } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import type { Facet } from '@/components/shared/FilterBar';
import { Button } from '@/components/ui/button';
import { errorText } from '@/lib/supabase';
import { findTag, tagRows, tagVar } from '@/lib/tags';
import { useIssueStore } from '@/stores/useIssueStore';
import { adoptTag, deleteTag, useTags } from '@/stores/useTagStore';
import type { IssueCard, IssueTag } from '@/types';

import TagDialog from './TagDialog';

export function useTagFacet(cards: IssueCard[]): { facet: Facet; dialog: ReactNode } {
  const selected = useIssueStore(s => s.filters.tag);
  const toggleTag = useIssueStore(s => s.toggleTag);
  const setFilter = useIssueStore(s => s.setFilter);
  const tags = useTags();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<IssueTag | null>(null);

  const rows = useMemo(() => tagRows(tags, cards), [tags, cards]);

  function openDialog(tag: IssueTag | null) {
    setEditing(tag);
    setDialogOpen(true);
  }

  async function edit(name: string) {
    try {
      const tag = findTag(tags, name) ?? (await adoptTag(name));
      if (tag) openDialog(tag);
    } catch (err) {
      toast.error(errorText(err));
    }
  }

  async function remove(name: string) {
    try {
      const tag = findTag(tags, name) ?? (await adoptTag(name));
      if (!tag) return;
      await deleteTag(tag.id);
      toast.success(`${tag.name} deleted`);
    } catch (err) {
      toast.error(errorText(err));
    }
  }

  const facet: Facet = {
    key: 'tag',
    label: 'Tags',
    icon: Tags,
    options: rows.map(row => ({ value: row.name, label: row.name, count: row.count, color: tagVar(row.color) })),
    selected,
    onToggle: toggleTag,
    onClear: () => setFilter('tag', []),
    rowActions: (option, close) => (
      <>
        <button
          type="button"
          aria-label={`edit ${option.label}`}
          className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground"
          onClick={e => {
            e.stopPropagation();
            close();
            void edit(option.value);
          }}
        >
          <Pencil size={13} strokeWidth={1.6} />
        </button>
        <button
          type="button"
          aria-label={`delete ${option.label}`}
          className="rounded-sm p-0.5 text-muted-foreground hover:text-destructive"
          onClick={e => {
            e.stopPropagation();
            void remove(option.value);
          }}
        >
          <Trash2 size={13} strokeWidth={1.6} />
        </button>
      </>
    ),
    footer: close => (
      <Button
        variant="ghost"
        size="xs"
        onClick={() => {
          close();
          openDialog(null);
        }}
      >
        <Plus size={13} strokeWidth={1.6} />
        New tag
      </Button>
    ),
  };

  return { facet, dialog: <TagDialog open={dialogOpen} onOpenChange={setDialogOpen} tag={editing} /> };
}
