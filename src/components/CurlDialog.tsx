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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="modern-card w-full max-w-3xl mx-4 animate-in shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-background/50 to-muted/10">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {mode === 'import' ? 'Import from cURL' : 'Export as cURL'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
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
                  className="modern-textarea h-40 font-mono text-sm resize-none shadow-sm"
                />
              </div>
              
              {error && (
                <div className="text-red-500 text-sm">{error}</div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="modern-button-secondary px-6 py-2.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  className="modern-button-primary px-6 py-2.5 flex items-center space-x-2"
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
                  className="modern-textarea h-40 bg-muted/50 font-mono text-sm resize-none cursor-text"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="modern-button-secondary px-6 py-2.5"
                >
                  Close
                </button>
                <button
                  onClick={handleDownload}
                  className="modern-button-secondary px-6 py-2.5 flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleCopy}
                  className="modern-button-primary px-6 py-2.5 flex items-center space-x-2"
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