# Code Style & Conventions

## Formatting
- **Prettier** with `prettier-plugin-tailwindcss` for consistent formatting
- Configuration in `.prettierrc`

## TypeScript Configuration
- Uses WXT's base TypeScript configuration
- Path alias: `@/*` maps to `./src/*`
- JSX: `react-jsx` mode
- Allows importing `.ts` extensions

## Component Patterns
- **shadcn/ui style**: "new-york" variant with CSS variables
- **Functional components**: React function components with TypeScript
- **Provider pattern**: Context providers for theme, auth, and state management
- **Custom hooks pattern**: Following React patterns

## Styling Conventions
- **Tailwind CSS v4**: Utility-first approach
- **CSS Variables**: Used for theming (light/dark mode)
- **OKLCH Color Space**: Modern color specification
- **Component variants**: Using class-variance-authority for component variants
- **No custom CSS classes**: Prefer Tailwind utilities

## File Naming
- **React components**: PascalCase (e.g., `App.tsx`, `Header.tsx`)
- **Utility files**: camelCase (e.g., `utils.ts`, `storage.ts`)
- **Types**: `index.ts` for type definitions

## Import Conventions
- Path alias `@/` for src imports
- External library imports first, then internal imports
- React imports implicit (React 19 JSX transform)