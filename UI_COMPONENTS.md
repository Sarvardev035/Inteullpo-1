# Finly UI Components Documentation

All reusable UI components are located in `src/components/ui/` and can be imported from `src/components/ui/index.js`.

## Components Overview

### 1. StatCard
Display key statistics with animated CountUp values and trend indicators.

**Props:**
- `label` (string) - Stat label/title
- `value` (number) - Value to display with CountUp animation
- `change` (number) - Percentage change for the badge
- `changeType` (string) - 'increase' or 'decrease' for the trend direction
- `prefix` (string) - Prefix for value (e.g., '$')
- `suffix` (string) - Suffix for value (e.g., '%')
- `loading` (boolean) - Shows skeleton when true
- `color` (string) - Color variant (currently uses CSS variables)

**Styling:**
- White card with `rounded-xl` corners
- 20px padding with `shadow-sm`
- CSS variables for all colors from design system
- Uses `cardVariants` animation from utils/animations.js

**Example Usage:**
```jsx
<StatCard
  label="Total Expenses"
  value={15420}
  change={12}
  changeType="increase"
  prefix="$"
  suffix=""
/>
```

---

### 2. TransactionItem
Display individual transaction with category icon, name, date, and amount.

**Props:**
- `transaction` (object) - Transaction object containing:
  - `category` (string) - Category key (FOOD, TRANSPORT, etc.)
  - `type` (string) - 'EXPENSE' or 'INCOME'
  - `amount` (number) - Transaction amount
  - `date` (string) - ISO date string
  - `currency` (string) - Currency code (default: UZS)

**Features:**
- Category emoji and colored background from `getCategoryMeta()`
- Smart date formatting (Today, Yesterday, or formatted)
- Responsive layout with proper truncation
- Color-coded amount display (red for expenses, green for income)

**Example Usage:**
```jsx
<TransactionItem
  transaction={{
    category: 'FOOD',
    type: 'EXPENSE',
    amount: 250000,
    date: '2024-03-20',
    currency: 'UZS'
  }}
/>
```

---

### 3. EmptyState
Centered card with icon, title, description, and optional action button.

**Props:**
- `icon` (React Component) - Lucide icon component
- `title` (string) - Empty state title
- `description` (string) - Description text
- `actionLabel` (string) - Button text (optional)
- `onAction` (function) - Callback when button is clicked

**Styling:**
- Centered flex layout on white card
- Icon in blue-soft background circle
- Responsive text sizing
- Fade-in animation on mount

**Example Usage:**
```jsx
<EmptyState
  icon={Wallet}
  title="No Transactions Yet"
  description="Start adding transactions to track your spending."
  actionLabel="Add Transaction"
  onAction={() => openTransactionModal()}
/>
```

---

### 4. ProgressBar
Animated progress bar with health-based color changes.

**Props:**
- `percent` (number) - Progress percentage (0-100)
- `color` (string) - Color variant (currently auto-determined by percent)
- `animate` (boolean) - Enable/disable initial animation

**Color Rules:**
- Green < 75%
- Amber 75-90%
- Red > 90%

**Styling:**
- Height: 8px
- Full width container
- Rounded corners
- Smooth animation with easeOut timing

**Example Usage:**
```jsx
<ProgressBar percent={65} animate={true} />
```

---

### 5. Button
Versatile button component with multiple variants and sizes.

**Props:**
- `variant` (string) - 'primary' | 'secondary' | 'danger' | 'ghost'
- `size` (string) - 'sm' | 'md' | 'lg'
- `children` (React node) - Button content
- `isLoading` (boolean) - Shows spinner, disables button
- `disabled` (boolean) - Disabled state
- `className` (string) - Additional Tailwind classes
- `...props` - Standard button attributes

**Variants:**
- **primary**: Blue background, white text (main action)
- **secondary**: Gray background, dark text
- **danger**: Red background, white text (destructive actions)
- **ghost**: Transparent, blue text (secondary action)

**Animation:**
- Hover: scale 1.02
- Tap: scale 0.98
- Loading spinner animation

**Example Usage:**
```jsx
<Button variant="primary" size="md" onClick={handleSave}>
  Save Changes
</Button>

<Button variant="danger" isLoading={isDeleting}>
  Delete Account
</Button>
```

---

### 6. Input
Form input with label, error message, and icon support.

**Props:**
- `label` (string) - Input label
- `error` (string) - Error message (shows in red)
- `icon` (React Component) - Lucide icon to display
- `type` (string) - Input type (default: 'text')
- `disabled` (boolean) - Disable input
- `required` (boolean) - Show required indicator
- `className` (string) - Additional Tailwind classes
- `...props` - Standard input attributes

**Features:**
- Built-in label with required indicator
- Icon positioning with proper padding
- Error state styling (red border and text)
- Focus animations with Framer Motion
- Responsive sizing

**Styling:**
- Uses CSS variables for colors
- Border-based design
- Focus ring with blue color
- Disabled state styling

**Example Usage:**
```jsx
<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  icon={Mail}
  required={true}
  error={errors.email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

## Design System Integration

All components use CSS variables defined in `src/index.css`:

**Colors:**
- `--blue`: #3b82f6
- `--blue-dark`: #1d4ed8
- `--blue-soft`: #eff6ff
- `--green`: #10b981
- `--green-soft`: #ecfdf5
- `--red`: #f43f5e
- `--red-soft`: #fff1f2
- `--amber`: #f59e0b
- `--amber-soft`: #fffbeb

**Typography:**
- Font: 'Inter' (body), 'Space Grotesk' (headings)

**Spacing:**
- Base unit: 8px (Tailwind grid)

**Border Radius:**
- `--radius-sm`: 8px
- `--radius-md`: 12px
- `--radius-lg`: 16px
- `--radius-xl`: 24px

**Shadows:**
- `--shadow-sm`: 0 1px 2px rgba(0, 0, 0, 0.05)
- `--shadow-md`: 0 4px 16px rgba(0, 0, 0, 0.08)
- `--shadow-lg`: 0 12px 40px rgba(0, 0, 0, 0.12)

---

## Animation Support

Components use Framer Motion variants from `src/utils/animations.js`:
- `cardVariants` - Scale and fade entrance
- `itemVariants` - Slide up entrance with stagger support
- `fadeInVariants` - Simple opacity fade
- `pageVariants` - Full page transitions

---

## Responsive Design

All components are fully responsive:
- Use Tailwind's responsive prefixes (sm:, md:, lg:)
- Flex layouts adapt to screen size
- Touch-friendly sizing (min 44px touch target)

---

## Accessibility

- Semantic HTML elements
- ARIA labels where applicable
- Keyboard navigation support
- Focus states for all interactive elements
- Error messaging for form inputs

---

## Import Examples

```jsx
import {
  StatCard,
  TransactionItem,
  EmptyState,
  ProgressBar,
  Button,
  Input
} from '@/components/ui';

// Or individual imports:
import StatCard from '@/components/ui/StatCard';
```

---

## Integration Notes

- All components work with existing hooks and utilities
- `getCategoryMeta()` for category styling
- `formatMoney()` for currency formatting
- `toReadableDate()` for date formatting
- Animation variants from existing animation system

**Dependencies:**
- framer-motion
- react-countup
- lucide-react
- clsx
