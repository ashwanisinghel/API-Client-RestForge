# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

RestForge is a standalone API testing tool (similar to Postman/Insomnia) built with Tauri and React. It's designed to be lightweight (~5-10MB), fast, offline-capable, and privacy-focused with local storage only.

## Development Commands

### Setup
```powershell
npm install
```

### Development
```powershell
npm run tauri:dev          # Run in development mode (opens desktop app)
npm run dev                # Run only frontend (for testing React components)
```

### Building
```powershell
npm run tauri:build        # Build production executable
npm run build              # Build only frontend assets
```

Build outputs:
- `src-tauri/target/release/restforge.exe` - Unsigned executable
- `src-tauri/target/release/bundle/msi/` - MSI installer
- `src-tauri/target/release/bundle/nsis/` - NSIS installer

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Tauri 1.5 (Rust runtime)
- **State Management**: Zustand stores (not Context API)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **HTTP Client**: Tauri HTTP API (not Axios in production)

### State Management with Zustand

RestForge uses **Zustand** for all state management. There are 5 main stores:

1. **`tabsStore`** (`src/stores/tabsStore.ts`)
   - Manages multiple request tabs
   - Each tab contains: request config, response data, loading state
   - Operations: add, close, duplicate tabs, update request/response

2. **`collectionsStore`** (`src/stores/collectionsStore.ts`)
   - Manages request collections and folders
   - Persists to localStorage under `restforge_collections`
   - Supports nested folder structure

3. **`environmentsStore`** (`src/stores/environmentsStore.ts`)
   - Manages environment variables
   - Variables use `{{variableName}}` syntax in requests
   - Persists to localStorage under `restforge_environments`

4. **`historyStore`** (`src/stores/historyStore.ts`)
   - Auto-saves all sent requests with timestamps
   - Persists to localStorage under `restforge_history`

5. **`settingsStore`** (`src/stores/settingsStore.ts`)
   - Theme (light/dark/system), SSL verification, redirects
   - Persists to localStorage under `restforge_settings`

**Important**: When working with state, always use Zustand hooks. Don't introduce React Context or other state solutions.

### Request Flow

1. User configures request in `RequestPanel` component
2. Request stored in active tab via `tabsStore.updateTabRequest()`
3. On send: `executeRequest()` from `src/utils/httpClient.ts`
   - Replaces `{{variables}}` with environment values
   - Builds headers (including auth)
   - Constructs body based on `bodyType`
   - Executes via Tauri's `fetch()` API
4. Response captured and stored via `tabsStore.updateTabResponse()`
5. Response rendered in `ResponseViewer` component
6. Request automatically saved to history via `historyStore.addHistoryItem()`

### Component Structure

- **`Layout.tsx`**: Main layout with sidebar + tab bar + request panel
- **`Sidebar.tsx`**: Collections, history, environments navigation
- **`TabBar.tsx`**: Horizontal tab bar for multiple requests
- **`RequestPanel.tsx`**: Main request configuration (URL, method, headers, body, auth)
- **`ResponseViewer.tsx`**: Displays response with formatted JSON, headers, timing
- **`KeyValueEditor.tsx`**: Reusable component for editing headers/params/form data

### Key Type Definitions

Located in `src/types/index.ts`:
- `RequestConfig`: Complete request configuration (method, URL, headers, body, auth)
- `ResponseData`: Response with status, headers, body, timing, size
- `Tab`: Represents a request tab with request, response, loading state
- `Collection`: Request collection with nested folders
- `Environment`: Set of key-value variables
- `AuthType`: 'bearer' | 'basic' | 'api-key' | 'none'
- `BodyType`: 'json' | 'xml' | 'form-data' | 'x-www-form-urlencoded' | 'raw' | 'none'

### Tauri Integration

RestForge uses minimal Rust code. The Tauri backend (`src-tauri/src/main.rs`) is mostly boilerplate - the app relies on Tauri's built-in APIs:
- `@tauri-apps/api/http` for HTTP requests
- `@tauri-apps/api/fs` for file operations (import/export)
- `@tauri-apps/api/dialog` for file dialogs

**Important**: HTTP requests must use Tauri's fetch API (`@tauri-apps/api/http`), not browser fetch or axios, to avoid CORS issues in the desktop app.

## Coding Guidelines

### TypeScript
- Use strict mode (already enabled in `tsconfig.json`)
- All components should have proper TypeScript types
- No `any` types unless absolutely necessary
- Use `@/` alias for imports from `src/` directory

### React Patterns
- Functional components only (no class components)
- Use hooks for all side effects
- Zustand hooks for state management
- Keep components focused and single-responsibility

### Styling
- Use Tailwind utility classes
- Follow existing dark/light theme patterns with `dark:` prefix
- Color scheme uses CSS custom properties (defined in `index.css`)
- Maintain consistent spacing and layout with existing components

### Variable Replacement
When implementing features that use environment variables:
- Use `{{variableName}}` syntax in UI
- Call `replaceVariables(text, variables)` from `requestUtils.ts` before sending
- Variables are replaced in: URL, headers, query params, auth tokens, body

### Data Persistence
All user data is stored in browser localStorage:
- Always save after mutations (see stores for examples)
- Always load on app initialization (see `Layout.tsx`)
- Use consistent key prefixes: `restforge_*`

## Common Patterns

### Adding a New Request Feature
1. Update `RequestConfig` type in `src/types/index.ts`
2. Update `createEmptyRequest()` in `src/utils/requestUtils.ts`
3. Add UI controls in `RequestPanel.tsx`
4. Update `executeRequest()` in `src/utils/httpClient.ts` to handle the new feature
5. Test with `npm run tauri:dev`

### Adding a New Store
1. Create store file in `src/stores/` following existing pattern
2. Define state interface with actions
3. Use `create<StateInterface>()` from zustand
4. Add localStorage persistence if needed (load/save methods)
5. Initialize in `Layout.tsx` useEffect

### Keyboard Shortcuts
Current shortcuts (see `RequestPanel.tsx` and `TabBar.tsx`):
- `Ctrl+T`: New tab
- `Ctrl+Enter`: Send request
- `Ctrl+W`: Close current tab

To add new shortcuts, use event listeners in component useEffect hooks.

## Windows-Specific Notes

This project is primarily developed on Windows. When working with paths or platform-specific features:
- Use Tauri's path APIs for cross-platform compatibility
- Be aware of Windows-specific build requirements (Visual Studio Build Tools)
- Release build is optimized for size with LTO and strip enabled (see `Cargo.toml`)
