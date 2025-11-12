import { RequestConfig, KeyValuePair } from '@/types';

export function createEmptyRequest(): RequestConfig {
  return {
    id: crypto.randomUUID(),
    name: 'New Request',
    method: 'GET',
    url: '',
    headers: [],
    queryParams: [],
    bodyType: 'none',
    body: '',
    auth: { type: 'none' },
    sslVerify: true,
    followRedirects: true,
  };
}

export function createKeyValuePair(key = '', value = '', enabled = true): KeyValuePair {
  return {
    id: crypto.randomUUID(),
    key,
    value,
    enabled,
  };
}

export function replaceVariables(text: string, variables: KeyValuePair[]): string {
  let result = text;
  variables.forEach((variable) => {
    if (variable.enabled) {
      const pattern = new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g');
      result = result.replace(pattern, variable.value);
    }
  });
  return result;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
  if (status >= 300 && status < 400) return 'text-yellow-600 dark:text-yellow-400';
  if (status >= 400 && status < 500) return 'text-orange-600 dark:text-orange-400';
  if (status >= 500) return 'text-red-600 dark:text-red-400';
  return 'text-muted-foreground';
}

export function tryFormatJson(text: string): string {
  try {
    const parsed = JSON.parse(text);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return text;
  }
}

export function isValidJson(text: string): boolean {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}
