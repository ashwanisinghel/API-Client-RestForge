export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'CUSTOM';

export type BodyType = 'none' | 'json' | 'xml' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'binary';

export type AuthType = 'none' | 'bearer' | 'basic' | 'api-key' | 'custom';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface AuthConfig {
  type: AuthType;
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyLocation?: 'header' | 'query';
  apiKeyName?: string;
  customHeaders?: KeyValuePair[];
}

export interface RequestConfig {
  id: string;
  name: string;
  method: HttpMethod;
  customMethod?: string;
  url: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  bodyType: BodyType;
  body: string;
  formData?: KeyValuePair[];
  auth: AuthConfig;
  sslVerify: boolean;
  followRedirects: boolean;
}

export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export interface RequestHistoryItem {
  id: string;
  request: RequestConfig;
  response?: ResponseData;
  timestamp: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  requests: RequestConfig[];
  folders?: Collection[];
}

export interface Environment {
  id: string;
  name: string;
  variables: KeyValuePair[];
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  activeEnvironment?: string;
  sslVerifyDefault: boolean;
  followRedirectsDefault: boolean;
}

export interface Tab {
  id: string;
  request: RequestConfig;
  response?: ResponseData;
  isLoading: boolean;
}
