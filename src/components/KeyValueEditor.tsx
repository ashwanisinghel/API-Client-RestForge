import { Plus, X } from 'lucide-react';
import { KeyValuePair } from '@/types';
import { createKeyValuePair } from '@/utils/requestUtils';

interface KeyValueEditorProps {
  items: KeyValuePair[];
  onChange: (items: KeyValuePair[]) => void;
  placeholder?: { key: string; value: string };
}

export default function KeyValueEditor({ items, onChange, placeholder }: KeyValueEditorProps) {
  const handleAdd = () => {
    onChange([...items, createKeyValuePair()]);
  };

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: keyof KeyValuePair, value: string | boolean) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={item.enabled}
            onChange={(e) => handleChange(item.id, 'enabled', e.target.checked)}
            className="w-4 h-4"
          />
          <input
            type="text"
            value={item.key}
            onChange={(e) => handleChange(item.id, 'key', e.target.value)}
            placeholder={placeholder?.key || 'Key'}
            className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            value={item.value}
            onChange={(e) => handleChange(item.id, 'value', e.target.value)}
            placeholder={placeholder?.value || 'Value'}
            className="flex-1 px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={() => handleRemove(item.id)}
            className="p-2 hover:bg-muted rounded-md transition-colors"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        onClick={handleAdd}
        className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-muted rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add
      </button>
    </div>
  );
}
