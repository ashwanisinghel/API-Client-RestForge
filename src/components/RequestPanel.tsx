import { useState } from 'react';
import { Send, Loader2, Download, Upload } from 'lucide-react';
import { useTabsStore } from '@/stores/tabsStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useEnvironmentsStore } from '@/stores/environmentsStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { executeRequest } from '@/utils/httpClient';
import { HttpMethod, RequestConfig } from '@/types';
import KeyValueEditor from './KeyValueEditor';
import ResponseViewer from './ResponseViewer';
import CurlDialog from './CurlDialog';
import ResizablePanels from './ResizablePanels';

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

export default function RequestPanel() {
  const { tabs, activeTabId, updateTabRequest, updateTabResponse, setTabLoading } = useTabsStore();
  const { addHistoryItem } = useHistoryStore();
  const { environments } = useEnvironmentsStore();
  const { activeEnvironment } = useSettingsStore();
  const [activeSection, setActiveSection] = useState<'params' | 'headers' | 'body' | 'auth'>('params');
  const [curlDialog, setCurlDialog] = useState<{ isOpen: boolean; mode: 'import' | 'export' }>({
    isOpen: false,
    mode: 'import'
  });

  const activeTab = tabs.find((t) => t.id === activeTabId);

  if (!activeTab) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        No tab selected
      </div>
    );
  }

  const { request, response, isLoading } = activeTab;

  const handleSendRequest = async () => {
    if (!request.url) return;

    setTabLoading(activeTabId!, true);

    try {
      const activeEnv = environments.find((e) => e.id === activeEnvironment);
      const variables = activeEnv?.variables || [];

      const responseData = await executeRequest({ request, variables });

      updateTabResponse(activeTabId!, responseData);

      // Add to history
      addHistoryItem({
        id: crypto.randomUUID(),
        request,
        response: responseData,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Request failed:', error);
    } finally {
      setTabLoading(activeTabId!, false);
    }
  };

  const updateRequest = (updates: Partial<typeof request>) => {
    updateTabRequest(activeTabId!, { ...request, ...updates });
  };

  const handleImportCurl = (importedRequest: RequestConfig) => {
    updateTabRequest(activeTabId!, importedRequest);
  };

  const openCurlDialog = (mode: 'import' | 'export') => {
    setCurlDialog({ isOpen: true, mode });
  };

  const closeCurlDialog = () => {
    setCurlDialog({ isOpen: false, mode: 'import' });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* URL Bar */}
      <div className="p-4 border-b border-border bg-background">
        <div className="flex items-stretch gap-2">
          <select
            value={request.method}
            onChange={(e) => updateRequest({ method: e.target.value as HttpMethod })}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          >
            {HTTP_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={request.url}
            onChange={(e) => updateRequest({ url: e.target.value })}
            placeholder="https://api.example.com/endpoint"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
          />
          
          {/* cURL Import/Export Buttons */}
          <button
            onClick={() => openCurlDialog('import')}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
            title="Import from cURL"
          >
            <Download className="w-4 h-4" />
            Import
          </button>
          <button
            onClick={() => openCurlDialog('export')}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
            title="Export as cURL"
          >
            <Upload className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={handleSendRequest}
            disabled={isLoading || !request.url}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send
              </>
            )}
          </button>
        </div>
      </div>

      {/* Request Config */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex border-b border-border bg-muted/30">
          {(['params', 'headers', 'body', 'auth'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 text-sm capitalize font-medium transition-colors relative ${
                activeSection === section
                  ? 'text-primary bg-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {section}
              {activeSection === section && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden">
          <ResizablePanels
            showRightPanel={!!response}
            defaultLeftWidth={50}
            minLeftWidth={30}
            maxLeftWidth={70}
            leftPanel={
              <div className="h-full overflow-y-auto p-4">
                {activeSection === 'params' && (
                  <KeyValueEditor
                    items={request.queryParams}
                    onChange={(params) => updateRequest({ queryParams: params })}
                    placeholder={{ key: 'Parameter', value: 'Value' }}
                  />
                )}

                {activeSection === 'headers' && (
                  <KeyValueEditor
                    items={request.headers}
                    onChange={(headers) => updateRequest({ headers })}
                    placeholder={{ key: 'Header', value: 'Value' }}
                  />
                )}

                {activeSection === 'body' && (
                  <div className="space-y-3">
                    <select
                      value={request.bodyType}
                      onChange={(e) => updateRequest({ bodyType: e.target.value as any })}
                      className="px-3 py-2 bg-background border border-border rounded-md text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                    >
                      <option value="none">None</option>
                      <option value="json">JSON</option>
                      <option value="xml">XML</option>
                      <option value="form-data">Form Data</option>
                      <option value="x-www-form-urlencoded">x-www-form-urlencoded</option>
                      <option value="raw">Raw</option>
                    </select>

                    {request.bodyType !== 'none' && (
                      request.bodyType === 'form-data' || request.bodyType === 'x-www-form-urlencoded' ? (
                        <KeyValueEditor
                          items={request.formData || []}
                          onChange={(formData) => updateRequest({ formData })}
                          placeholder={{ key: 'Field', value: 'Value' }}
                        />
                      ) : (
                        <textarea
                          value={request.body}
                          onChange={(e) => updateRequest({ body: e.target.value })}
                          placeholder={`Enter ${request.bodyType} body`}
                          className="w-full h-64 px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none transition-colors"
                        />
                      )
                    )}
                  </div>
                )}

                {activeSection === 'auth' && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {(['none', 'bearer', 'basic', 'api-key'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => updateRequest({ auth: { ...request.auth, type } })}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            request.auth.type === type
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80 text-foreground'
                          }`}
                        >
                          {type === 'none' ? 'No Auth' : type === 'bearer' ? 'Bearer Token' : type === 'basic' ? 'Basic Auth' : 'API Key'}
                        </button>
                      ))}
                    </div>

                    {request.auth.type === 'bearer' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-foreground">Token</label>
                        <input
                          type="text"
                          value={request.auth.token || ''}
                          onChange={(e) => updateRequest({ auth: { ...request.auth, token: e.target.value } })}
                          placeholder="Enter your bearer token"
                          className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                        />
                      </div>
                    )}

                    {request.auth.type === 'basic' && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Username</label>
                          <input
                            type="text"
                            value={request.auth.username || ''}
                            onChange={(e) => updateRequest({ auth: { ...request.auth, username: e.target.value } })}
                            placeholder="Enter username"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Password</label>
                          <input
                            type="password"
                            value={request.auth.password || ''}
                            onChange={(e) => updateRequest({ auth: { ...request.auth, password: e.target.value } })}
                            placeholder="Enter password"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                          />
                        </div>
                      </div>
                    )}

                    {request.auth.type === 'api-key' && (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Key</label>
                          <input
                            type="text"
                            value={request.auth.apiKeyName || ''}
                            onChange={(e) => updateRequest({ auth: { ...request.auth, apiKeyName: e.target.value } })}
                            placeholder="e.g., X-API-Key"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Value</label>
                          <input
                            type="text"
                            value={request.auth.apiKey || ''}
                            onChange={(e) => updateRequest({ auth: { ...request.auth, apiKey: e.target.value } })}
                            placeholder="Enter your API key"
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-foreground">Add to</label>
                          <select
                            value={request.auth.apiKeyLocation || 'header'}
                            onChange={(e) => updateRequest({ auth: { ...request.auth, apiKeyLocation: e.target.value as any } })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
                          >
                            <option value="header">Header</option>
                            <option value="query">Query Params</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            }
            rightPanel={
              response ? <ResponseViewer response={response} /> : null
            }
          />
        </div>
      </div>

      {/* cURL Dialog */}
      <CurlDialog
        isOpen={curlDialog.isOpen}
        onClose={closeCurlDialog}
        mode={curlDialog.mode}
        currentRequest={request}
        onImport={handleImportCurl}
      />
    </div>
  );
}
