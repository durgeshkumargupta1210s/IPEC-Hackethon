# UI Components Quick Reference

## Quick Import

```jsx
import { 
  MetricCard, 
  StatusBadge, 
  SectionContainer, 
  LoadingSkeleton, 
  Button, 
  Card 
} from './components/UI';
```

## Component Examples

### MetricCard - Display Key Metrics

**Purpose:** Show important numbers with context

```jsx
<MetricCard
  icon="📈"                    // Emoji or icon
  title="Risk Level"           // Small label
  value="87.5"                 // Main number
  unit="%"                     // Optional suffix (e.g., %, km²)
  variant="danger"             // primary|success|warning|danger
  size="default"               // small|default|large
  status="Critical"            // Optional status label
  description="High vegetation loss detected" // Explanation
/>
```

**Variants:**
- `primary` - Blue, neutral information
- `success` - Green, positive/healthy status
- `warning` - Orange, caution/attention needed
- `danger` - Red, critical/error status

---

### StatusBadge - Status Indicators

**Purpose:** Show operational status, tags

```jsx
<StatusBadge
  label="Operational"          // Badge text
  variant="success"            // success|warning|danger|primary|neutral
  icon="✓"                     // Optional emoji/icon
  size="default"               // small|default|large
/>
```

**Common Uses:**
```jsx
<StatusBadge label="Healthy" variant="success" icon="✓" />
<StatusBadge label="Warning" variant="warning" icon="⚠️" />
<StatusBadge label="Critical" variant="danger" icon="🚨" />
<StatusBadge label="Data" variant="primary" icon="📊" />
```

---

### SectionContainer - Organize Content

**Purpose:** Group related content with title

```jsx
<SectionContainer
  title="Risk Assessment"       // Section heading
  icon="🎯"                    // Heading icon
  variant="default"            // default|elevated
  className="optional-class"   // Additional CSS
>
  {/* Content goes here */}
</SectionContainer>
```

**Variants:**
- `default` - Standard white background
- `elevated` - Green accent, subtle highlight

---

### LoadingSkeleton - Data Loading States

**Purpose:** Show placeholder while loading

```jsx
<LoadingSkeleton
  count={3}                    // How many skeletons
  variant="card"               // card|text|metric
  height="100px"               // Custom height (for text)
/>
```

**When to Use:**
```jsx
{loading ? (
  <LoadingSkeleton count={3} variant="metric" />
) : (
  <MetricCard ... />
)}
```

---

### Button - Reusable Button

**Purpose:** Consistent button styling throughout

```jsx
<Button
  onClick={handleClick}        // Click handler
  variant="primary"            // primary|secondary|danger|warning|ghost
  size="default"               // small|default|large
  icon="🔍"                    // Optional icon
  loading={false}              // Show spinner
  disabled={false}             // Disable state
  type="button"                // submit|button|reset
  className="optional-class"   // Additional CSS
>
  Click Me
</Button>
```

**Variants:**
```jsx
<Button variant="primary">Run Analysis</Button>        // Green
<Button variant="secondary">Cancel</Button>            // Gray
<Button variant="danger">Delete</Button>               // Red
<Button variant="warning">Confirm</Button>             // Orange
<Button variant="ghost">More Options</Button>          // Outline
```

**With Loading:**
```jsx
<Button loading={isAnalyzing} disabled={isAnalyzing}>
  {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
</Button>
```

---

### Card - Base Card Component

**Purpose:** Flexible card wrapper

```jsx
<Card
  variant="default"            // default|elevated|danger|warning
  header={<h3>Title</h3>}      // Optional header
  footer={<p>Footer</p>}       // Optional footer
  hoverable={true}             // Enable hover effect
  className="custom-class"     // Additional CSS
>
  {/* Card content */}
</Card>
```

**Example:**
```jsx
<Card
  variant="elevated"
  header="Analysis Results"
  footer="Updated 2 minutes ago"
>
  <MetricCard icon="📈" value="87" title="Risk" />
</Card>
```

---

## Color Reference

| Color | Variant | Use Case | Example |
|-------|---------|----------|---------|
| 🟢 | `success` | Healthy, operational, good news | ✓ Vegetation healthy |
| 🟡 | `warning` | Caution, needs monitoring | ⚠️ Medium risk detected |
| 🔴 | `danger` | Critical, errors, bad news | 🚨 High vegetation loss |
| 🔵 | `primary` | Information, neutral, primary action | 📊 Run Analysis |
| ⚫ | `neutral` | Text, backgrounds, muted | Status labels |

---

## Spacing Quick Reference

```css
/* Use CSS variable or pixel equivalents */
var(--space-1)  = 4px      (small gap)
var(--space-2)  = 8px      (standard gap)
var(--space-3)  = 12px     (medium gap)
var(--space-4)  = 16px     (large gap)
var(--space-5)  = 20px     (larger gap)
var(--space-6)  = 24px     (section gap)
var(--space-8)  = 32px     (big gap)
```

---

## Typography Reference

```css
/* Page/App Title */
font-size: 32px; font-weight: 700;

/* Section Title */
font-size: 18px; font-weight: 700;

/* Card/Component Title */
font-size: 15px; font-weight: 700;

/* Metric Value */
font-size: 28px; font-weight: 700;

/* Body Text */
font-size: 14px; font-weight: 400;

/* Description/Secondary */
font-size: 13px; font-weight: 400;

/* Label/Status */
font-size: 12px; font-weight: 700; text-transform: uppercase;
```

---

## Common Patterns

### Risk Level Display

```jsx
{/* Header with Risk Badge */}
<SectionContainer title="Analysis Results" icon="📊">
  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
    <MetricCard
      icon="🎯"
      title="Risk Level"
      value="HIGH"
      variant="danger"
    />
    <StatusBadge 
      label="Requires Action" 
      variant="danger" 
      icon="⚠️" 
    />
  </div>
</SectionContainer>
```

### System Status Panel

```jsx
<SectionContainer title="System Status" icon="📊">
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
    <MetricCard icon="✅" title="Operational" value="100%" variant="success" />
    <MetricCard icon="📈" title="Analyses" value="42" variant="primary" />
    <MetricCard icon="⏱️" title="Avg Time" value="2.4s" variant="primary" />
  </div>
</SectionContainer>
```

### Data Loading

```jsx
{/* Show skeleton while loading */}
{loading ? (
  <SectionContainer title="Analyzing...">
    <LoadingSkeleton count={3} variant="metric" />
  </SectionContainer>
) : (
  <SectionContainer title="Results">
    {/* Actual content */}
  </SectionContainer>
)}
```

### Form Actions

```jsx
<div style={{ display: 'flex', gap: '12px' }}>
  <Button 
    variant="primary" 
    onClick={handleSubmit}
    icon="✓"
  >
    Save Changes
  </Button>
  <Button 
    variant="secondary" 
    onClick={handleCancel}
  >
    Cancel
  </Button>
</div>
```

---

## CSS Classes Reference

### Card Classes
- `.metric-card` - Metric display
- `.status-badge` - Status indicator
- `.section-container` - Section wrapper
- `.card` - Base card

### State Classes
- `.loading-skeleton` - Loading placeholder
- `.btn-primary` - Primary button
- `.active` - Active state (tabs, buttons)

### Utility Classes
- `.animate-slide-up` - Slide up animation
- `.animate-fade-in` - Fade in animation

---

## Responsive Breakpoints

```css
/* Desktop */
@media (min-width: 1200px) {
  /* Full features, optimized spacing */
}

/* Tablet */
@media (max-width: 1199px) and (min-width: 768px) {
  /* 2-col → 1-col, adjusted padding */
}

/* Mobile */
@media (max-width: 767px) {
  /* Single column, touch-friendly */
}
```

---

## Common Use Cases

### Risk Assessment Card

```jsx
<MetricCard
  icon="🎯"
  title="Risk Assessment"
  value={riskLevel}
  variant={getRiskVariant(riskLevel)} // danger|warning|success
  description={getRiskDescription(riskLevel)}
/>
```

### Vegetation Health Metric

```jsx
<MetricCard
  icon="🌿"
  title="Vegetation Health"
  value={ndviScore}
  unit="NDVI"
  variant={ndviScore > 0.5 ? "success" : "warning"}
  description="NDVI vegetation index score"
/>
```

### Analysis Status

```jsx
<StatusBadge
  label={statusText}
  variant={statusVariant}
  icon={statusIcon}
/>
```

### Loading State

```jsx
{isAnalyzing && (
  <LoadingSkeleton count={1} variant="card" />
)}
```

---

## Tips & Best Practices

✅ **Do:**
- Use semantic variants (success, warning, danger)
- Keep descriptions concise and helpful
- Use icons consistently across similar components
- Combine components (Card + MetricCard together)
- Test on mobile before committing

❌ **Don't:**
- Mix color schemes (stick to semantic system)
- Use custom colors (use variants instead)
- Add excessive spacing (use 8px multiples)
- Nest too many components (keep it simple)
- Ignore responsive design

---

## Need More Help?

📖 Full documentation: See `REFACTORING_GUIDE.md`
💻 Component source: `/src/components/UI/`
📋 Styling reference: `/src/components/UI/UI.css`
🎨 Design system: CSS variables in `/src/styles/modern.css`

---

*Keep this handy while developing! Quick reference for the modern UI system.*
