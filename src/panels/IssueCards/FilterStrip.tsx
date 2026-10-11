import { memo, useMemo } from 'react';
import { Boxes, CircleDot, Flag, Layers, TableProperties, Tag as TagIcon, Users } from 'lucide-react';

import FilterBar, { type Facet, type FacetOption } from '@/components/shared/FilterBar';
import UserAvatar from '@/components/shared/UserAvatar';
import { countValues, toggleValue } from '@/lib/facets';
import { metaRows, tagVar, type MetaKey } from '@/lib/tags';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  PRIORITIES,
  SHEET_AUTHOR,
  STATUS_FILTERS,
  hasRejection,
  isFromSheet,
  useIssueStore,
} from '@/stores/useIssueStore';
import type { IssueCard } from '@/types';
import { PRIORITY_COLOR, STATUS_COLOR } from './IssueBits';
import { useTagFacet } from './useTagFacet';

interface FilterStripProps {
  cards: IssueCard[];
}

function metaOptions(cards: IssueCard[], key: MetaKey): FacetOption[] {
  const rows = metaRows(cards, key);
  const ordered = key === 'version' ? [...rows].reverse() : rows;
  return ordered.map(row => ({ value: row.name, label: row.name, count: row.count, color: tagVar(row.color) }));
}

export default memo(function FilterStrip({ cards }: FilterStripProps) {
  const filters = useIssueStore(s => s.filters);
  const setFilter = useIssueStore(s => s.setFilter);
  const toggleMeta = useIssueStore(s => s.toggleMeta);
  const toggleAuthor = useIssueStore(s => s.toggleAuthor);
  const clearFacets = useIssueStore(s => s.clearFacets);
  const members = useAuthStore(s => s.members);
  const tag = useTagFacet(cards);

  const facets = useMemo(() => {
    const statusCounts = countValues(cards, c => (hasRejection(c) ? [c.status, 'rejected'] : [c.status]));
    const priorityCounts = countValues(cards, c => [c.priority]);
    const typeCounts = countValues(cards, c => [c.type || 'Other']);
    const authorCounts = countValues(cards, c => [isFromSheet(c) ? SHEET_AUTHOR : (c.createdBy ?? 'nobody')]);

    const people: FacetOption[] = members.map(member => ({
      value: member.userId,
      label: member.displayName,
      count: authorCounts.get(member.userId) ?? 0,
      lead: (
        <UserAvatar
          name={member.displayName}
          initials={member.initials}
          accent={member.accent}
          url={member.avatarUrl}
          className="size-5"
        />
      ),
    }));
    if ((authorCounts.get(SHEET_AUTHOR) ?? 0) > 0) {
      people.push({
        value: SHEET_AUTHOR,
        label: 'From the bug sheet',
        count: authorCounts.get(SHEET_AUTHOR),
        lead: <TableProperties size={15} strokeWidth={1.6} className="text-muted-foreground" />,
      });
    }

    const list: Facet[] = [
      {
        key: 'status',
        label: 'Status',
        icon: CircleDot,
        options: STATUS_FILTERS.map(s => ({
          value: s,
          label: s,
          count: statusCounts.get(s) ?? 0,
          color: STATUS_COLOR[s],
        })),
        selected: filters.status,
        onToggle: value => setFilter('status', toggleValue(filters.status, value as (typeof filters.status)[number])),
        onClear: () => setFilter('status', []),
      },
      {
        key: 'priority',
        label: 'Priority',
        icon: Flag,
        options: PRIORITIES.map(p => ({
          value: p,
          label: p,
          count: priorityCounts.get(p) ?? 0,
          color: PRIORITY_COLOR[p],
        })),
        selected: filters.priority,
        onToggle: value => setFilter('priority', toggleValue(filters.priority, value as (typeof filters.priority)[number])),
        onClear: () => setFilter('priority', []),
      },
    ];

    const types = [...typeCounts.keys()].sort();
    if (types.length > 1) {
      list.push({
        key: 'type',
        label: 'Type',
        icon: Layers,
        options: types.map(t => ({ value: t, label: t, count: typeCounts.get(t) })),
        selected: filters.type,
        onToggle: value => setFilter('type', toggleValue(filters.type, value)),
        onClear: () => setFilter('type', []),
      });
    }

    list.push(tag.facet);

    for (const key of ['codebase', 'version'] as const) {
      const options = metaOptions(cards, key);
      if (options.length === 0) continue;
      list.push({
        key,
        label: key === 'codebase' ? 'Codebase' : 'Version',
        icon: key === 'codebase' ? Boxes : TagIcon,
        options,
        selected: filters[key],
        onToggle: value => toggleMeta(key, value),
        onClear: () => setFilter(key, []),
      });
    }

    if (people.length > 1 || people.some(p => p.value === SHEET_AUTHOR)) {
      list.push({
        key: 'author',
        label: 'People',
        icon: Users,
        options: people,
        selected: filters.author,
        onToggle: toggleAuthor,
        onClear: () => setFilter('author', []),
      });
    }

    return list;
  }, [cards, filters, members, setFilter, toggleMeta, toggleAuthor, tag.facet]);

  return (
    <>
      <FilterBar facets={facets} onClearAll={clearFacets} className="min-w-0 flex-1" />
      {tag.dialog}
    </>
  );
});
