import { memo, useMemo } from 'react';
import { CircleDot, Tag as TagIcon, Users } from 'lucide-react';

import FilterBar, { type Facet } from '@/components/shared/FilterBar';
import UserAvatar from '@/components/shared/UserAvatar';
import { countValues, toggleValue } from '@/lib/facets';
import { fallbackColor, tagVar } from '@/lib/tags';
import { useAuthStore } from '@/stores/useAuthStore';
import {
  EMPTY_TEST_FILTERS,
  TEST_STATUS_FILTERS,
  TEST_STATUS_LABEL,
  useTestStore,
  visibleFeatures,
  type TestStatusFilter,
} from '@/stores/useTestStore';
import type { TestFeature } from '@/types';

const DOT: Record<TestStatusFilter, string> = {
  mine: 'var(--primary)',
  untested: 'var(--muted-foreground)',
  testing: 'var(--warning)',
  passed: 'var(--success)',
  failing: 'var(--destructive)',
  archived: 'var(--muted-foreground)',
};

export default memo(function TestFilterStrip({ features }: { features: TestFeature[] }) {
  const filters = useTestStore(s => s.filters);
  const setFilter = useTestStore(s => s.setFilter);
  const togglePerson = useTestStore(s => s.togglePerson);
  const toggleVersion = useTestStore(s => s.toggleVersion);
  const members = useAuthStore(s => s.members);

  const facets = useMemo(() => {
    const statusCount = (status: TestStatusFilter) =>
      visibleFeatures({
        features,
        filters: { ...EMPTY_TEST_FILTERS, status: [status] },
        query: '',
        sortKey: 'key',
        sortDir: 1,
      }).length;
    const makerCounts = countValues(features, f => [f.createdBy ?? 'nobody']);
    const versionCounts = countValues(features, f => (f.version ? [f.version] : []));

    const list: Facet[] = [
      {
        key: 'status',
        label: 'Status',
        icon: CircleDot,
        options: TEST_STATUS_FILTERS.map(s => ({
          value: s,
          label: TEST_STATUS_LABEL[s],
          count: statusCount(s),
          color: DOT[s],
        })),
        selected: filters.status,
        onToggle: value => setFilter('status', toggleValue(filters.status, value as TestStatusFilter)),
        onClear: () => setFilter('status', []),
      },
    ];

    const makers = members
      .map(member => ({ member, count: makerCounts.get(member.userId) ?? 0 }))
      .filter(row => row.count > 0);
    if (makers.length > 1) {
      list.push({
        key: 'person',
        label: 'Maker',
        icon: Users,
        options: makers.map(({ member, count }) => ({
          value: member.userId,
          label: member.displayName,
          count,
          lead: (
            <UserAvatar
              name={member.displayName}
              initials={member.initials}
              accent={member.accent}
              url={member.avatarUrl}
              className="size-5"
            />
          ),
        })),
        selected: filters.person,
        onToggle: togglePerson,
        onClear: () => setFilter('person', []),
      });
    }

    if (versionCounts.size > 0) {
      const versions = [...versionCounts.keys()].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
      list.push({
        key: 'version',
        label: 'Version',
        icon: TagIcon,
        options: versions.map(name => ({
          value: name,
          label: name,
          count: versionCounts.get(name),
          color: tagVar(fallbackColor(name)),
        })),
        selected: filters.version,
        onToggle: toggleVersion,
        onClear: () => setFilter('version', []),
      });
    }

    return list;
  }, [features, filters, members, setFilter, togglePerson, toggleVersion]);

  const clearAll = () => {
    setFilter('status', []);
    setFilter('person', []);
    setFilter('version', []);
  };

  return <FilterBar facets={facets} onClearAll={clearAll} className="min-w-0 flex-1" />;
});
