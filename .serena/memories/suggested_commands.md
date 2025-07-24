# Suggested Commands

## Development Commands
- `pnpm dev` - Start development server for Chrome (port 3001)
- `pnpm dev:firefox` - Start development server for Firefox
- `pnpm build` - Build extension for Chrome
- `pnpm build:firefox` - Build extension for Firefox
- `pnpm zip` - Create distributable zip for Chrome
- `pnpm zip:firefox` - Create distributable zip for Firefox
- `pnpm compile` - TypeScript type checking without emitting files
- `pnpm postinstall` - Prepare WXT (runs automatically after install)

## Code Quality
- **Formatting**: `prettier --write .` (uses Prettier with Tailwind plugin)
- **No linting setup currently** - project uses only Prettier for code formatting

## Testing
- **No testing framework currently set up**

## Environment Setup
Required environment variables (see .env.example):
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_CLERK_SYNC_HOST`
- `VITE_CLERK_FRONTEND_API`
- `VITE_CLERK_SECRET_KEY`
- `VITE_BACKEND_URL`
- `VITE_CRX_PUBLIC_KEY`