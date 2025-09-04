# ESLint + Prettier Translation Compliance Configuration

## Overview
This document describes the ESLint and Prettier configuration setup to enforce translation compliance and prevent hardcoded strings in the Nomad Lux project.

## Configuration Files

### 1. ESLint Configuration (`.eslintrc.cjs`)
- **File**: `.eslintrc.cjs`
- **Purpose**: Enforce code quality and translation compliance rules
- **Key Features**:
  - Prevents direct import of `react-i18next`
  - Disallows hardcoded strings in JSX files
  - Detects unused imports
  - Enforces Tailwind CSS best practices
  - Limits function length for maintainability

### 2. Prettier Configuration (`.prettierrc`)
- **File**: `.prettierrc`
- **Purpose**: Consistent code formatting
- **Settings**:
  - Semi-colons: enabled
  - Single quotes: enabled
  - Print width: 100 characters
  - Tab width: 2 spaces
  - Trailing comma: ES5

### 3. Ignore Files
- **`.eslintignore`**: Excludes files/directories from ESLint checking
- **`.prettierignore`**: Excludes files/directories from Prettier formatting

## Key Rules

### Translation Compliance
1. **No direct react-i18next imports**: Forces use of custom translation store
2. **No hardcoded strings in JSX**: All text must use translation keys
3. **Unused imports detection**: Automatically removes unused imports

### Code Quality
1. **Function length limit**: Maximum 500 lines per function
2. **Tailwind CSS optimization**: Suggests shorthand classes and proper ordering
3. **TypeScript strict rules**: Prevents `any` types and enforces proper typing

## Pre-commit Hooks

### Husky Configuration
- **File**: `.husky/pre-commit`
- **Purpose**: Run lint-staged before each commit
- **Commands**: ESLint fix + Prettier formatting

### Lint-staged Configuration
- **Location**: `package.json`
- **Purpose**: Run linting only on staged files
- **Commands**:
  ```json
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
  ```

## Available Scripts

### Package.json Scripts
- `npm run lint`: Check for linting errors
- `npm run lint:fix`: Fix auto-fixable linting errors
- `npm run format`: Format code with Prettier

## Installation

### Dependencies
```bash
npm install --save-dev eslint-plugin-react eslint-plugin-tailwindcss eslint-plugin-unused-imports eslint-config-prettier prettier husky lint-staged
```

### Setup Commands
```bash
# Initialize Husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

## Usage

### Development Workflow
1. **Write code**: Follow translation compliance rules
2. **Pre-commit**: Automatic linting and formatting
3. **Manual checks**: Use `npm run lint` to check for issues
4. **Auto-fix**: Use `npm run lint:fix` to fix auto-fixable issues

### Translation Compliance
- All text in JSX must use translation keys
- Use the custom translation store instead of react-i18next directly
- Example:
  ```tsx
  // ❌ Wrong
  <h1>Welcome to Nomad Lux</h1>
  
  // ✅ Correct
  <h1>{t('welcome.title')}</h1>
  ```

## Common Issues and Solutions

### 1. Hardcoded Strings
**Error**: `Strings not allowed in JSX files`
**Solution**: Replace with translation keys

### 2. Unused Imports
**Error**: `'Component' is defined but never used`
**Solution**: Remove unused imports or use them

### 3. React Import Issues
**Error**: `'React' must be in scope when using JSX`
**Solution**: Add `import React from 'react'` or use JSX transform

### 4. Tailwind CSS Issues
**Warning**: `Classnames 'w-4, h-4' could be replaced by the 'size-4' shorthand`
**Solution**: Use shorthand classes when possible

## Benefits

1. **Translation Compliance**: Ensures all text is translatable
2. **Code Quality**: Maintains consistent code style and structure
3. **Performance**: Removes unused imports and optimizes code
4. **Team Collaboration**: Consistent formatting across the team
5. **Automation**: Pre-commit hooks ensure compliance before commits

## Troubleshooting

### ESLint Configuration Issues
- Ensure `.eslintrc.cjs` exists (not `.eslintrc.js` for ES modules)
- Check that all required plugins are installed
- Verify TypeScript parser configuration

### Pre-commit Hook Issues
- Ensure Husky is properly initialized
- Check that lint-staged is configured in package.json
- Verify file permissions on `.husky/pre-commit`

### Performance Issues
- Use `.eslintignore` to exclude unnecessary files
- Consider using `--cache` flag for faster subsequent runs
- Limit linting to specific directories when needed



