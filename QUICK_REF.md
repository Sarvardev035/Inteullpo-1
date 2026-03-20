# Quick Reference - Finly UI Components

## 📦 Import Path
```jsx
import { StatCard, TransactionItem, EmptyState, ProgressBar, Button, Input } from '@/components/ui';
```

## 🎨 Component Cheat Sheet

### StatCard
```jsx
<StatCard
  label="Total Balance"
  value={45230}
  change={8.5}
  changeType="increase"
  prefix="$"
  loading={false}
/>
```
**Best for:** KPIs, dashboard stats, summary cards

---

### TransactionItem
```jsx
<TransactionItem transaction={{
  category: 'FOOD',
  type: 'EXPENSE',
  amount: 25000,
  date: '2024-03-20',
  currency: 'UZS'
}} />
```
**Best for:** Transaction lists, activity feeds

---

### EmptyState
```jsx
<EmptyState
  icon={Plus}
  title="No Data"
  description="Create your first item"
  actionLabel="Add New"
  onAction={() => {}}
/>
```
**Best for:** Empty states, initial load states, no results

---

### ProgressBar
```jsx
<ProgressBar
  percent={65}
  animate={true}
/>
```
**Best for:** Budget tracking, progress indication, health meters

---

### Button
```jsx
{/* Primary */}
<Button variant="primary" size="md" onClick={save}>
  Save
</Button>

{/* With loading */}
<Button isLoading={isSaving} variant="primary">
  Save Changes
</Button>

{/* Danger */}
<Button variant="danger" onClick={delete}>
  Delete
</Button>

{/* Ghost */}
<Button variant="ghost">Cancel</Button>
```
**Variants:** primary, secondary, danger, ghost  
**Sizes:** sm, md, lg

---

### Input
```jsx
<Input
  label="Email"
  type="email"
  icon={Mail}
  placeholder="you@example.com"
  required={true}
  error={emailError}
  onChange={(e) => setEmail(e.target.value)}
/>
```
**Best for:** Form fields, search inputs

---

## 🎯 Design System

### Colors (CSS Variables)
- `--blue`: Primary
- `--green`: Success/Income
- `--red`: Danger/Expense
- `--amber`: Warning/Caution

### Spacing Grid
- All components use 8px base unit
- Padding: 16px (md), 20px (lg), 32px (xl)
- Gaps: 8px, 12px, 16px

### Radius
- `--radius-lg`: 16px (components)
- `--radius-xl`: 24px (cards)

---

## 📱 Responsive

All components are fully responsive. No additional media queries needed in most cases.

---

## ♿ Accessibility

- Semantic HTML
- Keyboard navigation
- Focus visible states
- Error messages
- ARIA labels

---

## 🚀 Animation

Components automatically animate with Framer Motion. Use `animate` prop to control.

---

## ✨ Tips

1. **StatCard with Skeleton:** Use `loading={true}` while fetching
2. **Button with Spinner:** Use `isLoading={true}` for async operations
3. **Input Validation:** Show errors with `error` prop
4. **ProgressBar Colors:** Auto-calculated based on percent value
5. **EmptyState:** Always include an icon for visual appeal

---

## 📚 Full Documentation

See `UI_COMPONENTS.md` for complete API reference
