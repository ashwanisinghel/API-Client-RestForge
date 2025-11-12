import { RequestConfig, HttpMethod } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Parse a cURL command and convert it to a RequestConfig
 */
export function parseCurlCommand(curlCommand: string): RequestConfig {
  const config: RequestConfig = {
    id: uuidv4(),
    name: 'Imported from cURL',
    method: 'GET' as HttpMethod,
    url: '',
    headers: [],
    queryParams: [],
    bodyType: 'none',
    body: '',
    auth: { type: 'none' },
    sslVerify: true,
    followRedirects: true,
  };

  // Clean up the command - handle line breaks and normalize whitespace
  let command = curlCommand
    .trim()
    .replace(/\\\s*\n\s*/g, ' ') // Remove line breaks with backslashes
    .replace(/\s+/g, ' ') // Normalize multiple spaces
    .trim();
  
  // Remove 'curl' from the beginning if present
  command = command.replace(/^curl\s+/i, '');
  
  // Parse URL - handle both --url and direct URL
  let urlMatch = command.match(/--url\s+(['"]?)([^'"\s]+)\1/);
  if (urlMatch) {
    config.url = urlMatch[2];
    command = command.replace(urlMatch[0], '');
  } else {
    // Look for direct URL patterns
    urlMatch = command.match(/(?:^|\s)(['"]?)([^'"\s]+\.[^'"\s]*|https?:\/\/[^'"\s]+)\1/);
    if (urlMatch) {
      config.url = urlMatch[2];
      command = command.replace(urlMatch[0], '');
    }
  }

  // Parse method - handle both -X and --request
  let methodMatch = command.match(/(?:--request|-X)\s+(['"]?)([A-Z]+)\1/i);
  if (methodMatch) {
    config.method = methodMatch[2].toUpperCase() as HttpMethod;
    command = command.replace(methodMatch[0], '');
  }

  // Parse headers - handle both -H and --header
  const headerMatches = command.matchAll(/(?:--header|-H)\s+(['"]?)([^'"]+)\1/g);
  for (const match of headerMatches) {
    const headerValue = match[2];
    const [key, ...valueParts] = headerValue.split(':');
    if (key && valueParts.length > 0) {
      const value = valueParts.join(':').trim();
      
      // Handle authorization headers
      if (key.toLowerCase() === 'authorization') {
        if (value.toLowerCase().startsWith('bearer ')) {
          config.auth = {
            type: 'bearer',
            token: value.substring(7),
          };
        } else if (value.toLowerCase().startsWith('basic ')) {
          config.auth = {
            type: 'basic',
            // Note: Basic auth token would need to be decoded to get username/password
            username: 'decoded_username',
            password: 'decoded_password',
          };
        }
      } else {
        config.headers.push({
          id: uuidv4(),
          key: key.trim(),
          value: value,
          enabled: true,
        });
      }
    }
  }

  // Parse data/body
  const dataMatch = command.match(/(?:-d|--data|--data-raw)\s+(['"]?)([^'"]*)\1/);
  if (dataMatch) {
    config.body = dataMatch[2];
    
    // Try to determine body type
    try {
      JSON.parse(config.body);
      config.bodyType = 'json';
      // Add content-type header if not present
      const hasContentType = config.headers.some(h => h.key.toLowerCase() === 'content-type');
      if (!hasContentType) {
        config.headers.push({
          id: uuidv4(),
          key: 'Content-Type',
          value: 'application/json',
          enabled: true,
        });
      }
    } catch {
      config.bodyType = 'raw';
    }
  }

  // Parse form data
  const formMatch = command.match(/(?:-F|--form)\s+(['"]?)([^'"]*)\1/);
  if (formMatch) {
    config.bodyType = 'form-data';
    config.formData = [];
    
    // Parse form fields (simplified)
    const formFields = formMatch[2].split('&');
    formFields.forEach(field => {
      const [key, value] = field.split('=');
      if (key && value) {
        config.formData!.push({
          id: uuidv4(),
          key: key.trim(),
          value: value.trim(),
          enabled: true,
        });
      }
    });
  }

  // Parse user agent
  const userAgentMatch = command.match(/(?:-A|--user-agent)\s+(['"]?)([^'"]*)\1/);
  if (userAgentMatch) {
    config.headers.push({
      id: uuidv4(),
      key: 'User-Agent',
      value: userAgentMatch[2],
      enabled: true,
    });
  }

  // Parse basic auth
  const userMatch = command.match(/(?:-u|--user)\s+(['"]?)([^'"]*)\1/);
  if (userMatch) {
    const [username, password] = userMatch[2].split(':');
    config.auth = {
      type: 'basic',
      username: username || '',
      password: password || '',
    };
  }

  return config;
}

/**
 * Convert a RequestConfig to a cURL command
 */
export function generateCurlCommand(config: RequestConfig): string {
  const parts: string[] = ['curl'];

  // Add method if not GET
  if (config.method !== 'GET') {
    parts.push(`-X ${config.method}`);
  }

  // Add URL
  parts.push(`'${config.url}'`);

  // Add headers
  config.headers.forEach(header => {
    if (header.enabled && header.key && header.value) {
      parts.push(`-H '${header.key}: ${header.value}'`);
    }
  });

  // Add authentication
  if (config.auth.type === 'bearer' && config.auth.token) {
    parts.push(`-H 'Authorization: Bearer ${config.auth.token}'`);
  } else if (config.auth.type === 'basic' && config.auth.username) {
    const credentials = config.auth.password 
      ? `${config.auth.username}:${config.auth.password}`
      : config.auth.username;
    parts.push(`-u '${credentials}'`);
  } else if (config.auth.type === 'api-key' && config.auth.apiKey) {
    if (config.auth.apiKeyLocation === 'header') {
      parts.push(`-H '${config.auth.apiKeyName || 'X-API-Key'}: ${config.auth.apiKey}'`);
    }
  }

  // Add body data
  if (config.body && config.bodyType !== 'none') {
    if (config.bodyType === 'form-data' && config.formData) {
      config.formData.forEach(field => {
        if (field.enabled && field.key) {
          parts.push(`-F '${field.key}=${field.value}'`);
        }
      });
    } else {
      parts.push(`-d '${config.body}'`);
    }
  }

  // Add query parameters to URL if any
  if (config.queryParams.length > 0) {
    const enabledParams = config.queryParams.filter(p => p.enabled && p.key);
    if (enabledParams.length > 0) {
      const queryString = enabledParams
        .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`)
        .join('&');
      
      // Update the URL in the command
      const urlIndex = parts.findIndex(part => part.includes(config.url));
      if (urlIndex !== -1) {
        const separator = config.url.includes('?') ? '&' : '?';
        parts[urlIndex] = `'${config.url}${separator}${queryString}'`;
      }
    }
  }

  return parts.join(' \\\n  ');
}

/**
 * Validate if a string is a valid cURL command
 */
export function isValidCurlCommand(command: string): boolean {
  const trimmed = command.trim().replace(/\\\s*\n\s*/g, ' ');
  return trimmed.toLowerCase().startsWith('curl') || 
         trimmed.includes('http') || 
         trimmed.includes('-X ') ||
         trimmed.includes('--request ') ||
         trimmed.includes('-H ') ||
         trimmed.includes('--header ') ||
         trimmed.includes('--url ');
}