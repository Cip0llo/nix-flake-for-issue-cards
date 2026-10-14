import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVersions } from '@/lib/versions';

interface VersionSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export default function VersionSelect({ id, value, onChange, className, disabled }: VersionSelectProps) {
  const { list, current, indev } = useVersions(value);
  const names = value && !list.includes(value) ? [value, ...list] : list;

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || names.length === 0}>
      <SelectTrigger id={id} className={`mono ${className ?? 'w-full'}`}>
        <SelectValue placeholder={names.length === 0 ? 'No versions yet' : 'Pick a version'} />
      </SelectTrigger>
      <SelectContent>
        {names.map(name => (
          <SelectItem key={name} value={name}>
            <span className="mono">{name}</span>
            {name === current && <Badge variant="outline">current</Badge>}
            {name === indev && <Badge variant="outline">indev</Badge>}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
