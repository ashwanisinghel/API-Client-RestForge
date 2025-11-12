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
      <div className="p-4 border-b border-border/50 bg-gradient-to-r from-background/50 to-muted/10">
        <div className="flex items-stretch gap-2 mb-3">
          <select
            value={request.method}
            onChange={(e) => updateRequest({ method: e.target.value as HttpMethod })}
            className="modern-select font-semibold w-20 text-xs px-2 py-2 flex-shrink-0"
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
            className="modern-input flex-1 text-sm px-3 py-2 bg-background border-border font-mono"
          />
          
          {/* cURL Import/Export Buttons */}
          <button
            onClick={() => openCurlDialog('import')}
            className="modern-button-secondary px-3 py-2 flex items-center gap-1.5 text-xs flex-shrink-0"
            title="Import from cURL"
          >
            <Download className="w-3.5 h-3.5" />
            Import
          </button>
          <button
            onClick={() => openCurlDialog('export')}
            className="modern-button-secondary px-3 py-2 flex items-center gap-1.5 text-xs flex-shrink-0"
            title="Export as cURL"
          >
            <Upload className="w-3.5 h-3.5" />
            Export
          </button>
          
          <button
            onClick={handleSendRequest}
            disabled={isLoading || !request.url}
            className="modern-button-primary px-6 py-2 flex items-center gap-2 font-semibold text-sm flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
        <div className="flex border-b border-border/50 bg-muted/20">
          {(['params', 'headers', 'body', 'auth'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-6 py-3 text-sm capitalize font-medium transition-all duration-200 relative ${
                activeSection === section
                  ? 'text-primary bg-background/80 shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
              }`}
            >
              {section}
              {activeSection === section && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-primary/80 rounded-full" />
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
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      {(['none', 'json', 'xml', 'form-data', 'x-www-form-urlencoded', 'raw'] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => updateRequest({ bodyType: type })}
                          className={`px-3 py-1.5 text-sm rounded ${
                            request.bodyType === type
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted hover:bg-muted/80'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>

                    {request.bodyType !== 'none' && (
                      request.bodyType === 'form-data' || request.bodyType === 'x-www-form-urlencoded' ? (
                        <KeyValueEditor
                          items={request.formData || []}
                          onChange={(formData) => updateRequest({ formData })}
                          placeholder={{ key: 'Key', value: 'Value' }}
                        />
                      ) : (
                        <textarea
                          value={request.body}
                          onChange={(e) => updateRequest({ body: e.target.value })}
                          placeholder={`Enter ${request.bodyType} body`}
                          className="w-full h-64 px-3 py-2 bg-background border border-input rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                        />
                      )
                    )}
                  </div>
                )}

                {activeSection === 'auth' && (
                  <div className="space-y-4">
                    <select
                      value={request.auth.type}
                      onChange={(e) => updateRequest({ auth: { ...request.auth, type: e.target.value as any } })}
                      className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="none">No Auth</option>
                      <option value="bearer">Bearer Token</option>
                      <option value="basic">Basic Auth</option>
                      <option value="api-key">API Key</option>
                    </select>

                    {request.auth.type === 'bearer' && (
                      <input
                        type="text"
                        value={request.auth.token || ''}
                        onChange={(e) => updateRequest({ auth: { ...request.auth, token: e.target.value } })}
                        placeholder="Token"
                        className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    )}

                    {request.auth.type === 'basic' && (
                      <>
                        <input
                          type="text"
                          value={request.auth.username || ''}
                          onChange={(e) => updateRequest({ auth: { ...request.auth, username: e.target.value } })}
                          placeholder="Username"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <input
                          type="password"
                          value={request.auth.password || ''}
                          onChange={(e) => updateRequest({ auth: { ...request.auth, password: e.target.value } })}
                          placeholder="Password"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </>
                    )}

                    {request.auth.type === 'api-key' && (
                      <>
                        <input
                          type="text"
                          value={request.auth.apiKeyName || ''}
                          onChange={(e) => updateRequest({ auth: { ...request.auth, apiKeyName: e.target.value } })}
                          placeholder="Key Name"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <input
                          type="text"
                          value={request.auth.apiKey || ''}
                          onChange={(e) => updateRequest({ auth: { ...request.auth, apiKey: e.target.value } })}
                          placeholder="Key Value"
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        <select
                          value={request.auth.apiKeyLocation || 'header'}
                          onChange={(e) => updateRequest({ auth: { ...request.auth, apiKeyLocation: e.target.value as any } })}
                          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="header">Header</option>
                          <option value="query">Query Parameter</option>
                        </select>
                      </>
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
