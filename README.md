# Nomad Lux

A modern React application built with Vite and HeroUI components, featuring beautiful and responsive UI with dark mode support.

## ✨ Features

- ⚡ **Vite** - Fast build tool and development server
- ⚛️ **React 18** - Modern React with hooks and TypeScript
- 🎨 **HeroUI** - Beautiful React component library (migrated from NextUI)
- 🎯 **TypeScript** - Type-safe development
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Mobile-first approach
- 🎭 **Framer Motion** - Smooth animations
- 🚀 **Tailwind CSS v4** - Next-generation utility-first CSS framework

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open your browser and visit `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔄 Migration History

### HeroUI Migration
Successfully migrated from NextUI to HeroUI using the official codemod:
```bash
npx @heroui/codemod migrate .
```

### Tailwind v4 Upgrade
Upgraded to Tailwind CSS v4 with enhanced performance and new features.

## 📚 Documentation

Detailed documentation is available in the `docs/` folder:

- [Project Setup](./docs/ProjectSetupREADME.md) - Installation, configuration, and migration guide
- [HeroUI Components](./docs/HeroUIComponentsREADME.md) - Component usage and examples

## 🎨 Component Showcase

The application demonstrates various HeroUI components:
- **Navigation**: Responsive navbar with dropdown menu
- **Cards**: Information cards with headers and content
- **Forms**: Input fields with validation
- **Buttons**: Multiple variants and colors
- **Progress**: Animated progress bars
- **Modal**: Accessible dialog components
- **Switch**: Toggle components for settings
- **Avatar**: User profile images
- **Chips**: Status and tag indicators

## 🌙 Dark Mode

Built-in dark mode toggle that:
- Switches between light and dark themes
- Applies to all HeroUI components automatically
- Uses Tailwind CSS v4 dark mode classes

## 🛠️ Tech Stack

- **Frontend**: Vite + React + TypeScript
- **UI Library**: HeroUI (formerly NextUI)
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Build Tool**: Vite with Tailwind v4 plugin

## 📁 Project Structure

```
nomad-lux/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # React entry point with HeroUI provider
│   └── index.css        # Tailwind CSS v4 imports
├── docs/                # Documentation files
├── public/              # Static assets
└── config files         # Vite, TypeScript, Tailwind configurations
```

## 🔗 References

- [HeroUI Documentation](https://www.heroui.com/) - Official HeroUI docs
- [Migration Guide](https://www.heroui.com/docs/guide/nextui-to-heroui) - NextUI to HeroUI migration
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Latest Tailwind documentation 