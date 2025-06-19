# Project Setup Documentation

## Overview
This project is a modern React application built with Vite and HeroUI components, providing a beautiful and responsive user interface with dark mode support.

## Tech Stack
- **Vite**: Fast build tool and development server
- **React 18**: Modern React with hooks and TypeScript
- **TypeScript**: Type-safe JavaScript development
- **HeroUI**: Beautiful React component library (migrated from NextUI)
- **Tailwind CSS v4**: Next-generation utility-first CSS framework
- **Framer Motion**: Animation library (included with HeroUI)

## Project Structure
```
nomad-lux/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # React entry point with HeroUI provider
│   └── index.css        # Tailwind CSS imports (v4 format)
├── docs/                # Documentation files
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration with Tailwind v4 plugin
├── tsconfig.json        # TypeScript configuration
├── tailwind.config.js   # Tailwind CSS configuration with HeroUI
└── postcss.config.js    # PostCSS configuration
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm, yarn, or pnpm

### Installation Steps
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

4. Preview production build:
   ```bash
   npm run preview
   ```

## Key Features
- **Responsive Design**: Mobile-first approach with responsive grid layouts
- **Dark Mode**: Toggle between light and dark themes
- **Component Showcase**: Demonstrates various HeroUI components
- **TypeScript Support**: Full type safety and IntelliSense
- **Modern Development**: Hot module replacement and fast refresh
- **Tailwind v4**: Latest Tailwind CSS with improved performance

## Migration History

### HeroUI Migration
This project was successfully migrated from NextUI to HeroUI using the official codemod:
```bash
npx @heroui/codemod migrate .
```

The migration automatically updated:
- Package names from `@nextui-org/*` to `@heroui/*`
- Component imports and references
- Provider components (`NextUIProvider` → `HeroUIProvider`)
- Tailwind CSS configuration

### Tailwind v4 Upgrade
Upgraded to Tailwind CSS v4 with:
- New Vite plugin: `@tailwindcss/vite`
- Simplified CSS imports: `@import "tailwindcss"`
- Enhanced performance and features

## Configuration Details

### HeroUI Provider
The app is wrapped with `HeroUIProvider` in `src/main.tsx` to enable HeroUI components and theming:

```tsx
import { HeroUIProvider } from '@heroui/react'

<HeroUIProvider>
  <App />
</HeroUIProvider>
```

### Tailwind v4 Configuration
- Uses the new Vite plugin for better integration
- Configured to work with HeroUI components
- Dark mode support enabled with class strategy
- Simplified CSS import syntax

### Vite Configuration
Updated to include Tailwind v4 plugin:
```ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ...
})
```

### TypeScript Configuration
- Path mapping configured for `@/*` imports
- Strict mode enabled for better type checking
- Separate configurations for app and Node.js files

## Development Workflow
1. Components are imported from `@heroui/react`
2. Styling uses Tailwind CSS v4 classes
3. Dark mode is handled via CSS classes and React state
4. TypeScript provides compile-time type checking

## References
- [HeroUI Documentation](https://www.heroui.com/)
- [NextUI to HeroUI Migration Guide](https://www.heroui.com/docs/guide/nextui-to-heroui)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs) 