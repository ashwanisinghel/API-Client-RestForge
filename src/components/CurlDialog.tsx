import { useState } from 'react';
import { Copy, Download, Upload, X } from 'lucide-react';
import { RequestConfig } from '@/types';
import { parseCurlCommand, generateCurlCommand, isValidCurlCommand } from '@/utils/curlUtils';

interface CurlDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'import' | 'export';
  currentRequest?: RequestConfig;
  onImport?: (request: RequestConfig) => void;
}

export default function CurlDialog({ 
  isOpen, 
  onClose, 
  mode, 
  currentRequest, 
  onImport 
}: CurlDialogProps) {
  const [curlCommand, setCurlCommand] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleImport = () => {
    try {
      if (!curlCommand.trim()) {
        setError('Please enter a cURL command');
        return;
      }

      if (!isValidCurlCommand(curlCommand)) {
        setError('Invalid cURL command format');
        return;
      }

      const request = parseCurlCommand(curlCommand);
      onImport?.(request);
      onClose();
      setCurlCommand('');
      setError('');
    } catch (err) {
      setError('Failed to parse cURL command. Please check the format.');
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(curlCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([curlCommand], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentRequest?.name || 'request'}.curl`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Generate cURL command for export mode
  if (mode === 'export' && currentRequest && !curlCommand) {
    setCurlCommand(generateCurlCommand(currentRequest));
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {mode === 'import' ? 'Import from cURL' : 'Export as cURL'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {mode === 'import' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Paste your cURL command:
                </label>
                <textarea
                  value={curlCommand}
                  onChange={(e) => {
                    setCurlCommand(e.target.value);
                    setError('');
                  }}
                  placeholder={`curl -X POST 'https://api.example.com/data' -H 'Content-Type: application/json' -d '{"key": "value"}'`}
                  className="w-full h-32 px-3 py-2 border border-border rounded-md bg-background text-foreground font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Import</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  cURL command:
                </label>
                <textarea
                  value={curlCommand}
                  readOnly
                  className="w-full h-32 px-3 py-2 border border-border rounded-md bg-muted text-foreground font-mono text-sm resize-none focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}