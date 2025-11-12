import { useState } from 'react';
import { ResponseData } from '@/types';
import { formatBytes, formatTime, getStatusColor, tryFormatJson } from '@/utils/requestUtils';

interface ResponseViewerProps {
  response: ResponseData;
}

export default function ResponseViewer({ response }: ResponseViewerProps) {
  const [view, setView] = useState<'body' | 'headers'>('body');
  const [format, setFormat] = useState<'pretty' | 'raw'>('pretty');

  const formattedBody = format === 'pretty' ? tryFormatJson(response.body) : response.body;

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

        {view === 'body' && (
          <div className="flex gap-2 px-4">
            <button
              onClick={() => setFormat('pretty')}
              className={`px-3 py-1 text-xs rounded ${
                format === 'pretty'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Pretty
            </button>
            <button
              onClick={() => setFormat('raw')}
              className={`px-3 py-1 text-xs rounded ${
                format === 'raw'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              Raw
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {view === 'body' ? (
          <pre className="text-sm font-mono whitespace-pre-wrap break-words">
            {formattedBody}
          </pre>
        ) : (
          <div className="space-y-2">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 py-2 border-b border-border">
                <span className="font-medium min-w-[200px]">{key}</span>
                <span className="text-muted-foreground break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
