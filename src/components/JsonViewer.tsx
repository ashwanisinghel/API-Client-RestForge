import React from 'react';

interface JsonViewerProps {
  json: string;
  className?: string;
}

export default function JsonViewer({ json, className = '' }: JsonViewerProps) {
  const highlightJson = (jsonString: string): JSX.Element[] => {
    const tokens: JSX.Element[] = [];
    let index = 0;

    // Simple JSON tokenizer and highlighter with theme-matched colors
    const addToken = (text: string, type: 'key' | 'string' | 'number' | 'boolean' | 'null' | 'punctuation' | 'whitespace') => {
      const key = `${type}-${index++}`;
      
      switch (type) {
        case 'key':
          // Use elegant indigo color from app theme
          tokens.push(<span key={key} className="text-indigo-600 dark:text-indigo-400 font-semibold">{text}</span>);
          break;
        case 'string':
          // Use elegant teal that complements indigo
          tokens.push(<span key={key} className="text-teal-600 dark:text-teal-400">{text}</span>);
          break;
        case 'number':
          // Use purple from the elegant gradient theme
          tokens.push(<span key={key} className="text-purple-600 dark:text-purple-400 font-medium">{text}</span>);
          break;
        case 'boolean':
          // Use elegant indigo-purple blend
          tokens.push(<span key={key} className="text-indigo-700 dark:text-indigo-500 font-semibold">{text}</span>);
          break;
        case 'null':
          // Use muted red that fits elegant theme
          tokens.push(<span key={key} className="text-red-500 dark:text-red-400 font-semibold opacity-75">{text}</span>);
          break;
        case 'punctuation':
          // Use muted foreground color
          tokens.push(<span key={key} className="text-muted-foreground/50 dark:text-muted-foreground/40">{text}</span>);
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
      <div className="rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50 p-4 overflow-x-auto">
        <pre className={`text-sm font-mono whitespace-pre-wrap break-words code-editor ${className}`}>
          {highlighted}
        </pre>
      </div>
    );
  } catch (error) {
    // If not valid JSON, display as plain text
    return (
      <div className="rounded-lg bg-muted/30 dark:bg-muted/20 border border-border/50 p-4 overflow-x-auto">
        <pre className={`text-sm font-mono whitespace-pre-wrap break-words code-editor ${className}`}>
          {json}
        </pre>
      </div>
    );
  }
}