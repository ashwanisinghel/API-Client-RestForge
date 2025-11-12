import { Plus, X, Check } from 'lucide-react';
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
      {items.length > 0 && (
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 px-3 py-2 text-xs font-medium text-muted-foreground">
          <div className="w-5"></div>
          <div>Key</div>
          <div>Value</div>
          <div className="w-8"></div>
        </div>
      )}
      
      {items.map((item) => (
        <div 
          key={item.id} 
          className="group grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors border border-border"
        >
          <div className="relative">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={(e) => handleChange(item.id, 'enabled', e.target.checked)}
              className="peer sr-only"
              id={`checkbox-${item.id}`}
            />
            <label
              htmlFor={`checkbox-${item.id}`}
              className="flex items-center justify-center w-5 h-5 rounded border-2 border-border bg-background cursor-pointer transition-colors peer-checked:bg-primary peer-checked:border-primary"
            >
              <Check 
                className={`w-3 h-3 text-primary-foreground transition-all ${
                  item.enabled ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                }`}
              />
            </label>
          </div>
          
          <input
            type="text"
            value={item.key}
            onChange={(e) => handleChange(item.id, 'key', e.target.value)}
            placeholder={placeholder?.key || 'Key'}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
          
          <input
            type="text"
            value={item.value}
            onChange={(e) => handleChange(item.id, 'value', e.target.value)}
            placeholder={placeholder?.value || 'Value'}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
          
          <button
            onClick={() => handleRemove(item.id)}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            title="Remove"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      <button
        onClick={handleAdd}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-md transition-colors border border-dashed border-border hover:border-primary w-full justify-center"
      >
        <Plus className="w-4 h-4" />
        Add {placeholder?.key || 'Item'}
      </button>
    </div>
  );
}
