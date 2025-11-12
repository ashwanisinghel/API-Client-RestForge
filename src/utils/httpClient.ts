import { RequestConfig, ResponseData, KeyValuePair } from '@/types';
import { replaceVariables } from './requestUtils';

// Check if we're in Tauri environment
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_IPC__;

// Dynamic imports for Tauri APIs
let tauriFetch: any;
let ResponseType: any;
let Body: any;

if (isTauri) {
  import('@tauri-apps/api/http').then((module) => {
    tauriFetch = module.fetch;
    ResponseType = module.ResponseType;
    Body = module.Body;
  });
}

interface ExecuteRequestOptions {
  request: RequestConfig;
  variables?: KeyValuePair[];
}

// Browser-compatible fetch function
async function browserFetch(url: string, options: any): Promise<any> {
  const response = await fetch(url, {
    method: options.method,
    headers: options.headers,
    body: options.body,
    mode: 'cors',
  });

  const responseText = await response.text();
  
  return {
    status: response.status,
    ok: response.ok,
    headers: Object.fromEntries(response.headers.entries()),
    data: responseText,
  };
}

export async function executeRequest({ request, variables = [] }: ExecuteRequestOptions): Promise<ResponseData> {
  const startTime = performance.now();

  try {
    // Replace variables in URL
    let url = replaceVariables(request.url, variables);

    // Add query parameters
    const enabledParams = request.queryParams.filter((p) => p.enabled && p.key);
    if (enabledParams.length > 0) {
      const params = new URLSearchParams();
      enabledParams.forEach((param) => {
        const value = replaceVariables(param.value, variables);
        params.append(param.key, value);
      });
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}${params.toString()}`;
    }

    // Build headers
    const headers: Record<string, string> = {};
    
    // Add request headers
    request.headers
      .filter((h) => h.enabled && h.key)
      .forEach((header) => {
        const value = replaceVariables(header.value, variables);
        headers[header.key] = value;
      });

    // Add auth headers
    if (request.auth.type === 'bearer' && request.auth.token) {
      const token = replaceVariables(request.auth.token, variables);
      headers['Authorization'] = `Bearer ${token}`;
    } else if (request.auth.type === 'basic' && request.auth.username && request.auth.password) {
      const username = replaceVariables(request.auth.username, variables);
      const password = replaceVariables(request.auth.password, variables);
      const encoded = btoa(`${username}:${password}`);
      headers['Authorization'] = `Basic ${encoded}`;
    } else if (request.auth.type === 'api-key' && request.auth.apiKey && request.auth.apiKeyName) {
      const apiKey = replaceVariables(request.auth.apiKey, variables);
      if (request.auth.apiKeyLocation === 'header') {
        headers[request.auth.apiKeyName] = apiKey;
      } else if (request.auth.apiKeyLocation === 'query') {
        const separator = url.includes('?') ? '&' : '?';
        url = `${url}${separator}${request.auth.apiKeyName}=${encodeURIComponent(apiKey)}`;
      }
    }

    // Prepare body
    let body: any;
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.bodyType !== 'none') {
      if (request.bodyType === 'json') {
        const bodyText = replaceVariables(request.body, variables);
        if (isTauri && Body) {
          body = Body.json(JSON.parse(bodyText));
        } else {
          body = bodyText;
          if (!headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
          }
        }
      } else if (request.bodyType === 'form-data' && request.formData) {
        if (isTauri && Body) {
          const formData: Record<string, string> = {};
          request.formData
            .filter((f) => f.enabled && f.key)
            .forEach((field) => {
              formData[field.key] = replaceVariables(field.value, variables);
            });
          body = Body.form(formData);
        } else {
          const formData = new FormData();
          request.formData
            .filter((f) => f.enabled && f.key)
            .forEach((field) => {
              formData.append(field.key, replaceVariables(field.value, variables));
            });
          body = formData;
        }
      } else if (request.bodyType === 'x-www-form-urlencoded' && request.formData) {
        if (isTauri && Body) {
          const formData: Record<string, string> = {};
          request.formData
            .filter((f) => f.enabled && f.key)
            .forEach((field) => {
              formData[field.key] = replaceVariables(field.value, variables);
            });
          body = Body.form(formData);
        } else {
          const params = new URLSearchParams();
          request.formData
            .filter((f) => f.enabled && f.key)
            .forEach((field) => {
              params.append(field.key, replaceVariables(field.value, variables));
            });
          body = params.toString();
        }
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (request.bodyType === 'raw' || request.bodyType === 'xml') {
        const bodyText = replaceVariables(request.body, variables);
        if (isTauri && Body) {
          body = Body.text(bodyText);
        } else {
          body = bodyText;
        }
        if (request.bodyType === 'xml' && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/xml';
        }
      }
    }

    // Execute request
    const method = request.method === 'CUSTOM' ? request.customMethod || 'GET' : request.method;
    
    let response: any;
    if (isTauri && tauriFetch) {
      response = await tauriFetch(url, {
        method,
        headers,
        body,
        responseType: ResponseType.Text,
      });
    } else {
      response = await browserFetch(url, {
        method,
        headers,
        body,
      });
    }

    const endTime = performance.now();
    const time = endTime - startTime;

    // Calculate response size
    const responseText = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    const size = new Blob([responseText]).size;

    return {
      status: response.status,
      statusText: response.ok ? 'OK' : 'Error',
      headers: response.headers as Record<string, string>,
      body: responseText,
      time,
      size,
    };
  } catch (error) {
    const endTime = performance.now();
    const time = endTime - startTime;

    return {
      status: 0,
      statusText: 'Error',
      headers: {},
      body: error instanceof Error ? error.message : 'An unknown error occurred',
      time,
      size: 0,
    };
  }
}
