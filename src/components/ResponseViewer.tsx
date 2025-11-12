import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ResponseData } from '@/types';
import { formatBytes, formatTime, getStatusColor, tryFormatJson } from '@/utils/requestUtils';
import JsonViewer from './JsonViewer';

interface ResponseViewerProps {
  response: ResponseData;
}

export default function ResponseViewer({ response }: ResponseViewerProps) {
  const [view, setView] = useState<'body' | 'headers'>('body');
  const [format, setFormat] = useState<'pretty' | 'raw'>('pretty');
  const [copied, setCopied] = useState(false);

  const formattedBody = format === 'pretty' ? tryFormatJson(response.body) : response.body;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(view === 'body' ? response.body : JSON.stringify(response.headers, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Response Status Bar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-xs text-muted-foreground">Status</span>
            <p className={`text-lg font-semibold ${getStatusColor(response.status)}`}>
              {response.status} {response.statusText}
            </p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Time</span>
            <p className="text-sm font-medium">{formatTime(response.time)}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Size</span>
            <p className="text-sm font-medium">{formatBytes(response.size)}</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center justify-between border-b border-border">
        <div className="flex">
          <button
            onClick={() => setView('body')}
            className={`px-4 py-2 text-sm ${
              view === 'body'
                ? 'bg-background border-b-2 border-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Body
          </button>
          <button
            onClick={() => setView('headers')}
            className={`px-4 py-2 text-sm ${
              view === 'headers'
                ? 'bg-background border-b-2 border-primary font-medium'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Headers ({Object.keys(response.headers).length})
          </button>
        </div>

        <div className="flex gap-2 px-4">
          {view === 'body' && (
            <>
              <button
                onClick={() => setFormat('pretty')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  format === 'pretty'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Pretty
              </button>
              <button
                onClick={() => setFormat('raw')}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  format === 'raw'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
              >
                Raw
              </button>
            </>
          )}
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors flex items-center gap-1.5"
            title="Copy to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 bg-background">
        {view === 'body' ? (
          format === 'pretty' && response.headers['content-type']?.includes('application/json') ? (
            <JsonViewer json={formattedBody} />
          ) : (
            <div className="rounded-md bg-muted/30 border border-border p-3 overflow-x-auto">
              <pre className="text-xs font-mono whitespace-pre-wrap break-words leading-relaxed text-foreground">
                {formattedBody}
              </pre>
            </div>
          )
        ) : (
          <div className="space-y-1">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="grid grid-cols-[minmax(150px,200px)_1fr] gap-4 py-2 px-3 border-b border-border hover:bg-muted/30 transition-colors">
                <span className="font-medium text-sm text-primary truncate" title={key}>{key}</span>
                <span className="text-foreground/80 break-all font-mono text-xs">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
