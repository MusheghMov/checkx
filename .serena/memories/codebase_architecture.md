# Codebase Architecture

## Project Structure
```
src/
├── entrypoints/          # Extension entry points
│   ├── background.ts     # Service worker for context menus & keyboard commands
│   ├── content.ts        # Content script (runs on Twitter/X pages)
│   └── popup/           # Popup UI (React app)
│       ├── App.tsx      # Main popup component
│       ├── main.tsx     # Entry point
│       └── index.html   # Popup HTML
├── components/          # Reusable React components
│   ├── ui/             # shadcn/ui components
│   └── [other components]
├── providers/          # React context providers
├── lib/               # Utility functions
├── utils/             # Extension-specific utilities (storage)
├── types/             # TypeScript type definitions
└── assets/            # Static assets (CSS, etc.)
```

## Key Architecture Patterns
- **Extension Structure**: Background script + Content script + Popup UI
- **React Architecture**: Provider pattern (Theme → Clerk → QueryClient)
- **Routing**: Wouter-based client-side routing in popup
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Path Aliases**: `@/` maps to `src/` directory

## Extension Permissions
- `contextMenus` - Right-click menu integration
- `activeTab` - Access to current tab information
- `storage` - Local data persistence
- `cookies` - Authentication cookie management
- `notifications` - User notifications
- `scripting` - Content script injection
- Host permissions for Clerk authentication URLs