# HeroUI Components Documentation

## Overview
HeroUI is the new identity for NextUI, providing the same powerful React component library built on top of Tailwind CSS. It offers beautiful and accessible components out of the box with enhanced features and performance.

## Migration from NextUI
This project has been successfully migrated from NextUI to HeroUI using the official migration tool. All functionality remains the same - only package names and imports have changed.

### Key Changes
- Package name: `@nextui-org/*` → `@heroui/*`
- Provider: `NextUIProvider` → `HeroUIProvider`
- All component APIs remain identical

## Key Components Used

### Navigation Components

#### Navbar
```tsx
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from '@heroui/react'

<Navbar isBordered>
  <NavbarBrand>
    <p className="font-bold text-inherit">Brand Name</p>
  </NavbarBrand>
  <NavbarContent className="hidden sm:flex gap-4" justify="center">
    <NavbarItem>
      <Link color="foreground" href="#">Link</Link>
    </NavbarItem>
  </NavbarContent>
</Navbar>
```

**Features:**
- Responsive design with mobile-friendly behavior
- Built-in border and styling options
- Flexible content positioning

### Layout Components

#### Card
```tsx
import { Card, CardHeader, CardBody } from '@heroui/react'

<Card className="py-4">
  <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
    <p className="text-tiny uppercase font-bold">Title</p>
    <small className="text-default-500">Subtitle</small>
  </CardHeader>
  <CardBody className="overflow-visible py-2">
    Content goes here
  </CardBody>
</Card>
```

**Features:**
- Flexible layout container
- Header and body sections
- Customizable padding and styling

### Form Components

#### Input
```tsx
import { Input } from '@heroui/react'

<Input
  type="email"
  label="Email"
  placeholder="Enter your email"
  size="sm"
/>
```

**Features:**
- Built-in validation states
- Multiple sizes (sm, md, lg)
- Label and placeholder support

#### Button
```tsx
import { Button } from '@heroui/react'

<Button color="primary" variant="solid" size="md">
  Click me
</Button>
```

**Variants:**
- `solid` - Filled background
- `bordered` - Border only
- `light` - Light background
- `flat` - Flat appearance
- `ghost` - Minimal styling

**Colors:**
- `primary`, `secondary`, `success`, `warning`, `danger`

### Feedback Components

#### Progress
```tsx
import { Progress } from '@heroui/react'

<Progress 
  size="sm" 
  value={65} 
  color="success" 
  showValueLabel={true}
/>
```

**Features:**
- Animated progress indication
- Multiple color themes
- Optional value labels

#### Chip
```tsx
import { Chip } from '@heroui/react'

<Chip color="primary" variant="flat">
  Tag Label
</Chip>
```

**Features:**
- Small status indicators
- Multiple variants and colors
- Closable option available

### Interactive Components

#### Switch
```tsx
import { Switch } from '@heroui/react'

<Switch
  isSelected={isDark}
  onValueChange={toggleTheme}
  size="sm"
>
  Dark Mode
</Switch>
```

**Features:**
- Toggle functionality
- Controlled and uncontrolled modes
- Custom labels

#### Modal
```tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react'

const { isOpen, onOpen, onOpenChange } = useDisclosure()

<Modal isOpen={isOpen} onOpenChange={onOpenChange}>
  <ModalContent>
    {(onClose) => (
      <>
        <ModalHeader>Title</ModalHeader>
        <ModalBody>Content</ModalBody>
        <ModalFooter>
          <Button onPress={onClose}>Close</Button>
        </ModalFooter>
      </>
    )}
  </ModalContent>
</Modal>
```

**Features:**
- Accessible modal dialogs
- Built-in backdrop and focus management
- Customizable content sections

#### Dropdown
```tsx
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react'

<Dropdown placement="bottom-end">
  <DropdownTrigger>
    <Button>Open Menu</Button>
  </DropdownTrigger>
  <DropdownMenu aria-label="Actions">
    <DropdownItem key="edit">Edit</DropdownItem>
    <DropdownItem key="delete" color="danger">Delete</DropdownItem>
  </DropdownMenu>
</Dropdown>
```

**Features:**
- Flexible positioning
- Keyboard navigation
- Action handling

### Display Components

#### Avatar
```tsx
import { Avatar } from '@heroui/react'

<Avatar
  isBordered
  color="secondary"
  name="User Name"
  size="sm"
  src="https://example.com/avatar.jpg"
/>
```

**Features:**
- Image or initials display
- Multiple sizes and colors
- Border options

## Theming and Customization

### Dark Mode Support
HeroUI components automatically support dark mode when the `dark` class is applied to the document:

```tsx
// Toggle dark mode
document.documentElement.classList.toggle('dark')
```

### Custom Styling with Tailwind v4
Components can be customized using the latest Tailwind CSS v4 classes:

```tsx
<Button className="bg-gradient-to-r from-purple-500 to-pink-500">
  Custom Button
</Button>
```

## Best Practices

1. **Provider Setup**: Always wrap your app with `HeroUIProvider`
2. **Accessibility**: Components come with built-in accessibility features
3. **Responsive Design**: Use responsive Tailwind classes for mobile-first design
4. **Type Safety**: Import component types for better TypeScript support
5. **Performance**: Components are tree-shakeable for optimal bundle size
6. **Migration**: Use the official codemod for seamless NextUI to HeroUI migration

## Common Patterns

### Form Handling
```tsx
const [formData, setFormData] = useState({ email: '', password: '' })

<form onSubmit={handleSubmit}>
  <Input
    value={formData.email}
    onChange={(e) => setFormData({...formData, email: e.target.value})}
    label="Email"
    type="email"
  />
  <Button type="submit" color="primary">Submit</Button>
</form>
```

### Loading States
```tsx
const [isLoading, setIsLoading] = useState(false)

<Button 
  color="primary" 
  isLoading={isLoading}
  onPress={() => setIsLoading(true)}
>
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

## Migration Resources

- [Official HeroUI Documentation](https://www.heroui.com/)
- [NextUI to HeroUI Migration Guide](https://www.heroui.com/docs/guide/nextui-to-heroui)
- [HeroUI GitHub Repository](https://github.com/heroui-inc/heroui)
- [Migration Codemod](https://www.npmjs.com/package/@heroui/codemod)

## What's New in HeroUI

- Enhanced performance and bundle size optimization
- Improved TypeScript support
- Better accessibility features
- New components and variants
- Enhanced theming capabilities
- Seamless migration from NextUI 