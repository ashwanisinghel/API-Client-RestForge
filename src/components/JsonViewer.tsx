import React from 'react';

interface JsonViewerProps {
  json: string;
  className?: string;
}

export default function JsonViewer({ json, className = '' }: JsonViewerProps) {
  const highlightJson = (jsonString: string): JSX.Element[] => {
    const tokens: JSX.Element[] = [];
    let index = 0;

    // Simple JSON tokenizer and highlighter
    const addToken = (text: string, type: 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'whitespace') => {
      const key = `${type}-${index++}`;
      
      switch (type) {
        case 'key':
          tokens.push(<span key={key} className="text-blue-600 dark:text-blue-400">{text}</span>);
          break;
        case 'string':
          tokens.push(<span key={key} className="text-green-600 dark:text-green-400">{text}</span>);
          break;
        case 'number':
          tokens.push(<span key={key} className="text-orange-600 dark:text-orange-400">{text}</span>);
          break;
        case 'boolean':
          tokens.push(<span key={key} className="text-purple-600 dark:text-purple-400">{text}</span>);
          break;
        case 'null':
          tokens.push(<span key={key} className="text-red-600 dark:text-red-400">{text}</span>);
          break;
        case 'punctuation':
          tokens.push(<span key={key} className="text-muted-foreground">{text}</span>);
          break;
        case 'whitespace':
          tokens.push(<span key={key}>{text}</span>);
          break;
      }
    };

    let i = 0;
    let inString = false;
    let isKey = false;
    let current = '';

    while (i < jsonString.length) {
      const char = jsonString[i];
      const nextChar = jsonString[i + 1];

      if (char === '"' && (i === 0 || jsonString[i - 1] !== '\\')) {
        if (inString) {
          // End of string
          current += char;
          if (isKey) {
            addToken(current, 'key');
            isKey = false;
          } else {
            addToken(current, 'string');
          }
          current = '';
          inString = false;
        } else {
          // Start of string
          if (current.trim()) {
            addToken(current, 'whitespace');
            current = '';
          }
          current += char;
          inString = true;
          
          // Check if this is a key (followed by colon after closing quote)
          let j = i + 1;
          let foundColon = false;
          while (j < jsonString.length) {
            if (jsonString[j] === '"' && jsonString[j - 1] !== '\\') {
              j++;
              while (j < jsonString.length && /\s/.test(jsonString[j])) j++;
              if (j < jsonString.length && jsonString[j] === ':') {
                foundColon = true;
              }
              break;
            }
            j++;
          }
          isKey = foundColon;
        }
      } else if (inString) {
        current += char;
      } else if (/\s/.test(char)) {
        if (current.trim()) {
          // Check token type
          if (/^-?\d+\.?\d*$/.test(current.trim())) {
            addToken(current, 'number');
          } else if (current.trim() === 'true' || current.trim() === 'false') {
            addToken(current, 'boolean');
          } else if (current.trim() === 'null') {
            addToken(current, 'null');
          } else {
            addToken(current, 'whitespace');
          }
          current = '';
        }
        current += char;
      } else if ('{}[],:'.includes(char)) {
        if (current.trim()) {
          // Check token type
          if (/^-?\d+\.?\d*$/.test(current.trim())) {
            addToken(current, 'number');
          } else if (current.trim() === 'true' || current.trim() === 'false') {
            addToken(current, 'boolean');
          } else if (current.trim() === 'null') {
            addToken(current, 'null');
          } else {
            addToken(current, 'whitespace');
          }
          current = '';
        }
        addToken(char, 'punctuation');
      } else {
        current += char;
      }

      i++;
    }

    // Handle remaining content
    if (current.trim()) {
      if (/^-?\d+\.?\d*$/.test(current.trim())) {
        addToken(current, 'number');
      } else if (current.trim() === 'true' || current.trim() === 'false') {
        addToken(current, 'boolean');
      } else if (current.trim() === 'null') {
        addToken(current, 'null');
      } else {
        addToken(current, 'whitespace');
      }
    }

    return tokens;
  };

  try {
    // Try to parse and validate JSON
    JSON.parse(json);
    const highlighted = highlightJson(json);
    
    return (
      <div className="rounded-md bg-muted/30 border border-border p-3 overflow-x-auto">
        <pre className={`text-xs font-mono whitespace-pre-wrap break-words leading-relaxed ${className}`}>
          {highlighted}
        </pre>
      </div>
    );
  } catch (error) {
    // If not valid JSON, display as plain text
    return (
      <div className="rounded-md bg-muted/30 border border-border p-3 overflow-x-auto">
        <pre className={`text-xs font-mono whitespace-pre-wrap break-words leading-relaxed ${className}`}>
          {json}
        </pre>
      </div>
    );
  }
}