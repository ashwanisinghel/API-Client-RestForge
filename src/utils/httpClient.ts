import { fetch as tauriFetch, ResponseType, Body } from '@tauri-apps/api/http';
import { RequestConfig, ResponseData, KeyValuePair } from '@/types';
import { replaceVariables } from './requestUtils';

interface ExecuteRequestOptions {
  request: RequestConfig;
  variables?: KeyValuePair[];
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
    let body: Body | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD' && request.bodyType !== 'none') {
      if (request.bodyType === 'json') {
        const bodyText = replaceVariables(request.body, variables);
        body = Body.json(JSON.parse(bodyText));
        if (!headers['Content-Type']) {
          headers['Content-Type'] = 'application/json';
        }
      } else if (request.bodyType === 'form-data' && request.formData) {
        const formData: Record<string, string> = {};
        request.formData
          .filter((f) => f.enabled && f.key)
          .forEach((field) => {
            formData[field.key] = replaceVariables(field.value, variables);
          });
        body = Body.form(formData);
      } else if (request.bodyType === 'x-www-form-urlencoded' && request.formData) {
        const formData: Record<string, string> = {};
        request.formData
          .filter((f) => f.enabled && f.key)
          .forEach((field) => {
            formData[field.key] = replaceVariables(field.value, variables);
          });
        body = Body.form(formData);
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      } else if (request.bodyType === 'raw' || request.bodyType === 'xml') {
        const bodyText = replaceVariables(request.body, variables);
        body = Body.text(bodyText);
        if (request.bodyType === 'xml' && !headers['Content-Type']) {
          headers['Content-Type'] = 'application/xml';
        }
      }
    }

    // Execute request
    const method = request.method === 'CUSTOM' ? request.customMethod || 'GET' : request.method;
    
    const response = await tauriFetch(url, {
      method,
      headers,
      body,
      responseType: ResponseType.Text,
    });

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
