# Atomic Design Structure

## Overview
The EduGate frontend now follows **Atomic Design methodology** for organizing React components. This provides better reusability, maintainability, and scalability.

## Structure

```
src/components/
├── atoms/           # Basic building blocks
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Card.jsx
│   ├── Badge.jsx
│   ├── Avatar.jsx
│   ├── Label.jsx
│   └── index.js    # Barrel exports
├── molecules/       # Combinations of atoms
│   ├── SearchBar.jsx
│   ├── FormField.jsx
│   ├── Modal.jsx
│   ├── Table.jsx
│   └── index.js    # Barrel exports
├── organisms/       # Complex components
│   ├── Sidebar.jsx
│   └── index.js    # Barrel exports
└── templates/       # Page layouts (to be added)
```

## Component Hierarchy

### **Atoms** (Basic UI Elements)
Smallest, indivisible components. Cannot be broken down further.

#### Button
```jsx
import { Button } from '../components/atoms';

<Button variant="primary" icon={Plus}>
  Add Parent
</Button>
```
Props: `variant`, `icon`, `className`, `type`, `...props`

#### Input
```jsx
import { Input } from '../components/atoms';

<Input 
  placeholder="Enter name" 
  fullWidth 
  type="text"
/>
```
Props: `fullWidth`, `className`, `...props`

#### Card
```jsx
import { Card } from '../components/atoms';

<Card className="custom-class">
  Content here
</Card>
```
Props: `className`, `...props`

#### Badge
```jsx
import { Badge } from '../components/atoms';

<Badge bg="#F0FDF4" color="#166534" icon={Baby}>
  Student Name
</Badge>
```
Props: `icon`, `color`, `bg`, `...props`

#### Avatar
```jsx
import { Avatar } from '../components/atoms';

<Avatar name="John Doe" size={44} />
```
Props: `name`, `size`, `...props`

#### Label
```jsx
import { Label } from '../components/atoms';

<Label required>Full Name</Label>
```
Props: `required`, `children`, `...props`

---

### **Molecules** (Combinations of Atoms)
Simple groups of UI elements functioning together.

#### SearchBar
```jsx
import { SearchBar } from '../components/molecules';

<SearchBar 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search..."
/>
```
Props: `value`, `onChange`, `placeholder`, `...props`

#### FormField
```jsx
import { FormField } from '../components/molecules';

<FormField
  label="Email Address"
  type="email"
  required
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>
```
Props: `label`, `required`, `error`, `...inputProps`

#### Modal
```jsx
import { Modal } from '../components/molecules';

<Modal 
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Add New Parent"
  width="600px"
>
  <form>...</form>
</Modal>
```
Props: `isOpen`, `onClose`, `children`, `title`, `width`

#### Table (Compound Component)
```jsx
import { Table } from '../components/molecules';

<Table>
  <Table.Head>
    <Table.Row>
      <Table.Header>Name</Table.Header>
      <Table.Header align="right">Actions</Table.Header>
    </Table.Row>
  </Table.Head>
  <Table.Body>
    <Table.Row>
      <Table.Cell>John Doe</Table.Cell>
      <Table.Cell align="right">...</Table.Cell>
    </Table.Row>
  </Table.Body>
</Table>
```
Sub-components: `Table.Head`, `Table.Body`, `Table.Row`, `Table.Header`, `Table.Cell`

---

### **Organisms** (Complex Components)
Complex UI components composed of molecules and atoms.

#### Sidebar
```jsx
import { Sidebar } from '../components/organisms';

<Sidebar />
```
A fully functional navigation sidebar with role-based menu items.

---

## Migration Guide

### Before (Non-Atomic)
```jsx
<div className="card" style={{ padding: '24px' }}>
  <input 
    type="text" 
    className="search-input"
    style={{ width: '100%' }}
  />
  <button className="btn btn-primary">
    <Plus size={18} />
    Add
  </button>
</div>
```

### After (Atomic Design)
```jsx
import { Card, Input, Button } from '../components/atoms';

<Card>
  <Input fullWidth />
  <Button icon={Plus}>Add</Button>
</Card>
```

## Benefits

1. **Reusability**: Components can be easily reused across pages
2. **Consistency**: Ensures UI consistency throughout the app
3. **Maintainability**: Changes to base components propagate automatically
4. **Developer Experience**: Cleaner imports with barrel exports
5. **Testing**: Easier to test isolated components
6. **Scalability**: New features can be built faster using existing components

## Best Practices

1. **Use barrel exports** for cleaner imports:
   ```jsx
   // ✅ Good
   import { Button, Input, Card } from '../components/atoms';
   
   // ❌ Avoid
   import Button from '../components/atoms/Button';
   import Input from '../components/atoms/Input';
   ```

2. **Keep atoms simple** - no business logic, just UI
3. **Molecules should be reusable** - avoid page-specific logic
4. **Organisms can be complex** - domain-specific components
5. **Always use TypeScript/PropTypes** (future enhancement)

## Next Steps

- [ ] Refactor remaining pages (Teachers, Students, etc.)
- [ ] Create template components for page layouts  
- [ ] Add TypeScript for better type safety
- [ ] Create Storybook documentation
- [ ] Add unit tests for atoms and molecules
