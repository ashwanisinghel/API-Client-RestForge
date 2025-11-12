# RestForge

A standalone API testing tool built with Tauri and React - lightweight, fast, and portable.

## Features

### Core Capabilities
- ✅ All HTTP methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- ✅ Request configuration: Headers, Query Parameters, Request Body (JSON, XML, Form Data, Raw)
- ✅ Authentication: Bearer Token, Basic Auth, API Key
- ✅ Response viewing: Formatted/Raw JSON, Status codes, Headers, Timing, Size
- ✅ Request History: Auto-save all sent requests
- ✅ Collections: Organize requests into folders
- ✅ Environment Variables: Use {{variable}} syntax in requests
- ✅ Multiple Tabs: Work on multiple requests simultaneously
- ✅ **cURL Import/Export**: Import requests from cURL commands and export requests as cURL
- ✅ Dark/Light Theme: Automatic system theme detection
- ✅ Keyboard Shortcuts: Ctrl+T (new tab), Ctrl+Enter (send request)

### Technical Highlights
- 🚀 Built with Tauri for minimal executable size (~5-10MB)
- ⚡ Fast native performance
- 💾 Local storage - fully offline capable
- 🔒 No cloud dependencies, no data collection
- 🎨 Modern, clean UI with Tailwind CSS

## Prerequisites

- **Node.js** (v18 or higher)
- **Rust** (latest stable version)
- **Windows**: Visual Studio Build Tools or Visual Studio with C++ development tools

### Installing Rust

```bash
# Windows
# Download and run: https://rustup.rs/

# Verify installation
rustc --version
cargo --version
```

## Development Setup

1. **Clone/Navigate to the repository**
   ```bash
   cd D:\App Devlopment\RestForge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri:dev
   ```

## Building for Production

### Build Windows Executable

```bash
npm run tauri:build
```

The executable will be generated in:
- `src-tauri/target/release/restforge.exe` (unsigned executable)
- `src-tauri/target/release/bundle/msi/` (MSI installer)
- `src-tauri/target/release/bundle/nsis/` (NSIS installer)

### Build Configuration

The build is optimized for size and performance:
- LTO (Link Time Optimization) enabled
- Strip debug symbols
- Optimized for size (`opt-level = "z"`)
- Single-file executable with all dependencies bundled

## Usage

### Making a Request

1. **Enter URL**: Type or paste the API endpoint URL
2. **Select Method**: Choose HTTP method from dropdown (GET, POST, etc.)
3. **Configure Request**:
   - **Params**: Add query parameters
   - **Headers**: Add custom headers
   - **Body**: Choose body type and enter data
   - **Auth**: Select authentication method and enter credentials
4. **Send**: Click Send button or press Ctrl+Enter
5. **View Response**: See formatted response with status, headers, timing

### cURL Import/Export

**Import from cURL:**
1. Click "Import cURL" button in the request panel or sidebar
2. Paste your cURL command in the dialog
3. Click "Import" to convert it to a RestForge request

**Export as cURL:**
1. Configure your request in RestForge
2. Click "Export cURL" button in the request panel
3. Copy the generated cURL command or download as a file

**Supported cURL features:**
- HTTP methods (`-X GET/POST/PUT/DELETE`)
- Headers (`-H "Content-Type: application/json"`)
- Request body (`-d "data"` or `--data`)
- Form data (`-F "key=value"`)
- Basic authentication (`-u username:password`)
- Bearer tokens (`-H "Authorization: Bearer token"`)
- Custom user agents (`-A "User-Agent"`)

**Example cURL import:**
```bash
curl -X POST 'https://api.example.com/users' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your-token' \
  -d '{"name": "John Doe", "email": "john@example.com"}'
```

### Using Environment Variables

1. Create an environment in the sidebar
2. Add variables with key-value pairs
3. Use in requests with `{{variableName}}` syntax
4. Variables are replaced at request time

### Keyboard Shortcuts

- `Ctrl+T`: New tab
- `Ctrl+Enter`: Send request
- `Ctrl+W`: Close current tab

### Collections

1. Click "Collections" in sidebar
2. Create a new collection
3. Save requests to collections for reuse
4. Export/import collections as JSON

## Project Structure

```
RestForge/
├── src/                      # React frontend source
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # React entry point
│   └── index.css           # Global styles
├── src-tauri/               # Tauri backend
│   ├── src/                # Rust source code
│   ├── icons/              # Application icons
│   ├── Cargo.toml          # Rust dependencies
│   └── tauri.conf.json     # Tauri configuration
├── index.html              # HTML entry point
├── package.json            # Node.js dependencies
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
└── vite.config.ts          # Vite bundler config
```

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Backend**: Tauri 1.5 (Rust)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Icons**: Lucide React
- **Build Tool**: Vite
- **HTTP Client**: Tauri HTTP API

## Troubleshooting

### Build Fails

1. Ensure Rust is installed: `rustc --version`
2. Ensure Node.js is installed: `node --version`
3. Clear cache and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```

### App Won't Start

1. Check console for errors
2. Ensure all dependencies are installed
3. Try clearing browser cache (localStorage)

### Request Fails

1. Check URL is correct and includes protocol (http:// or https://)
2. Verify network connection
3. Check if SSL verification needs to be disabled
4. Review request headers and authentication

## Contributing

This is a standalone project. Feel free to fork and customize for your needs.

## License

This project is provided as-is for personal and commercial use.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.

---

Built with ❤️ by Ashwani Singh
