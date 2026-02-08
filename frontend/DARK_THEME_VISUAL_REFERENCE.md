# 🎨 Dark Glassmorphism - Visual Reference & Development Guide

## Quick Visual Guide

### Color Palette At A Glance

```
BACKGROUND
┌─────────────────────────────────────────┐
│ Base: #020617 (Deep Slate-Black)       │
│ + Emerald Glow (top-right, blur-120px) │
│ + Blue Glow (bottom-left, blur-120px)  │
└─────────────────────────────────────────┘

PRIMARY BRAND COLOR
┌─────────────────────────────────────────┐
│ Emerald-500: #22c55e (Success/Primary) │
│ • Glow: 0 0 20px rgba(34, 197, 94, 0.3)│
│ • Shade 600: #16a34a (hover state)     │
│ • Shade 700: #15803d (active state)    │
└─────────────────────────────────────────┘

SECONDARY COLORS
┌─────────────────────────────────────────┐
│ Blue-500: #3b82f6 (Info/Secondary)     │
│ • Glow: 0 0 32px rgba(59, 130, 246, 0.1)
│
│ Red-500: #ef4444 (Critical/Error)      │
│ • Glow: 0 0 32px rgba(239, 68, 68, 0.1)
│
│ Orange-500: #f97316 (Warning)          │
└─────────────────────────────────────────┘

TRANSPARENCY SCALE
┌─────────────────────────────────────────┐
│ Faint:     rgba(255, 255, 255, 0.05)   │ (Glass background)
│ Subtle:    rgba(255, 255, 255, 0.10)   │ (Borders)
│ Enhanced:  rgba(255, 255, 255, 0.15)   │ (Strong borders)
│ Active:    rgba(255, 255, 255, 0.20)   │ (Interactive)
└─────────────────────────────────────────┘
```

---

## Component Library Showcase

### Glass Cards

#### Standard Glass Card
```
┌─────────────────────────────┐
│ background: rgba(255,255,   │  • backdrop-filter: blur(20px)
│ 255, 0.05)                  │  • border-white/10
│ border-radius: 2rem         │  • Smooth transition
│ padding: 1.5rem             │  • Hover lifts 2px
│                             │
│ Content here...             │
└─────────────────────────────┘
```

#### Elevated Glass Card
```
┌─────────────────────────────┐
│ background: rgba(255,255,   │  • opacity increased (0.08)
│ 255, 0.08)                  │  • stronger border (0.15)
│ backdrop-filter: blur(30px) │  • box-shadow: 0 8px 32px
│ border-radius: 2rem         │  • More prominent
│ padding: 1.5rem             │  • Premium feel
│                             │
│ Content here...             │
└─────────────────────────────┘
```

#### Color-Tinted Variants
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ EMERALD TINT     │  │ BLUE TINT        │  │ RED TINT         │
│ #22c55e accent   │  │ #3b82f6 accent   │  │ #ef4444 accent   │
│ border: emerald  │  │ border: blue     │  │ border: red      │
│ glow: green      │  │ glow: blue       │  │ glow: red        │
│ bg: green/10     │  │ bg: blue/10      │  │ bg: red/10       │
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

---

### Status Badges

#### Operational Badge (Pulsating)
```
┌────────────────────────────────┐
│ ●●● Operational               │  • Green dot (pulsate animation)
│  bg: rgba(34, 197, 94, 0.1)   │  • Text: #22c55e
│  border: emerald-300          │  • 2-second pulsate cycle
│  border-radius: 0.5rem        │  • Ring expands/contracts
└────────────────────────────────┘
```

#### Warning Badge
```
┌────────────────────────────────┐
│ ● Warning                       │  • Orange dot (static)
│  bg: rgba(249, 115, 22, 0.1)  │  • Text: #fb923c
│  border: orange-300            │  • Alert style
│  border-radius: 0.5rem        │
└────────────────────────────────┘
```

#### Critical Badge
```
┌────────────────────────────────┐
│ ● Critical                      │  • Red dot (static)
│  bg: rgba(239, 68, 68, 0.1)   │  • Text: #fca5a5
│  border: red-300               │  • Error style
│  border-radius: 0.5rem        │
└────────────────────────────────┘
```

---

### Progress Bars

#### Glowing Progress Bar
```
┌─────────────────────────────────────────┐
│ ▬▬▬▬▬▬▬▬▬ ░░░░░░░░░░░░░░            │
│  ^^^^^^^                                │  • Gradient: emerald-400 → 500
│  Glow: 0 0 16px rgba(34,197,94,0.6)  │  • Shimmer on right edge
│  Color: #22c55e → #16a34a              │  • Smooth width animation
│  Width: dynamic (0-100%)                │  • Technical precision feel
└─────────────────────────────────────────┘
```

---

### Buttons

#### Primary CTA Button
```
┌──────────────────────────────┐
│    ⚡ RUN ANALYSIS           │  • Gradient: #22c55e → #16a34a
│  background: linear-gradient │  • box-shadow: glow (20px blur)
│  text: white (bold)          │  • Hover: translateY(-2px)
│  padding: 0.75rem 1.5rem    │  • Enhanced shadow on hover
│  border-radius: 0.5rem      │  • Sharp Lucide icon
└──────────────────────────────┘
```

#### Secondary Button
```
┌──────────────────────────────┐
│    CANCEL                     │  • Transparent background
│  background: transparent      │  • border: white/20
│  border: 1px solid white/20  │  • Hover: bg white/10
│  text: white                  │  • Subtle elevation
│  padding: 0.75rem 1.5rem    │
└──────────────────────────────┘
```

#### Icon Button
```
┌──────┐
│  ⚙️  │  • 40px × 40px
│      │  • bg: white/5
│      │  • border: white/10
│      │  • Hover: bg white/10
└──────┘
```

---

## Typography Showcase

### Font Hierarchy

```
H1 - PAGE TITLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Geospatial Intelligence Platform
32px, weight 800, gradient effect

H2 - SECTION HEADER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOREST MONITORING
24px, weight 700, uppercase, spacing 0.05em

H3 - METRIC VALUE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
95%
2.5rem, weight 800, numeric

BODY TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Real-time satellite surveillance
16px, weight 400, mixed case

LABEL (Technical)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RISK ASSESSMENT
12px, weight 600, uppercase, spacing 0.08em, opacity 70%

SECONDARY TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Data quality score
13px, weight 400, opacity 70%

TERTIARY TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Last updated 2 hours ago
12px, weight 400, opacity 50%
```

---

## Layout Grid System

### 12-Column Bento Grid

```
DESKTOP (1200px+)
┌──────────────────────────────────────────────────────────────────┐
│ HEADER (Sticky, full width)                                      │
├──────────────────────────────────────────────────────────────────┤
│ NAVIGATION TABS (Sticky, full width)                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────┐  ┌─────────────────┐   │
│  │                                    │  │                 │   │
│  │      MAIN AREA (8 columns)         │  │  SIDEBAR        │   │
│  │                                    │  │  (4 columns)    │   │
│  │  • Forest Map                      │  │  • System Status│   │
│  │  • Analysis Controls               │  │  • Risk Score   │   │
│  │  • Analysis Results                │  │  • NDVI Health  │   │
│  │  • Loading State                   │  │  • Recent       │   │
│  │                                    │  │  • CTA Button   │   │
│  └────────────────────────────────────┘  │                 │   │
│                                          │  (Sticky)       │   │
│                                          └─────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

TABLET (768-1199px)
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
├──────────────────────────────────────────────────────────────────┤
│ NAVIGATION TABS                                                  │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  ┌──────────┐            │
│  │   MAIN (9 cols)                  │  │SIDEBAR   │            │
│  │                                  │  │(3 cols)  │            │
│  └──────────────────────────────────┘  │          │            │
│                                        │(Compact) │            │
│                                        └──────────┘            │
└──────────────────────────────────────────────────────────────────┘

MOBILE (<768px)
┌──────────────────────────────────────────────────────────────────┐
│ HEADER                                                           │
├──────────────────────────────────────────────────────────────────┤
│ NAVIGATION TABS (Horizontal scroll)                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      MAIN (Full width, stacked)                        │    │
│  │  • Forest Map                                          │    │
│  │  • Analysis Controls                                   │    │
│  │  • Analysis Results                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │      SIDEBAR (Full width, below main)                  │    │
│  │  • System Status                                       │    │
│  │  • Risk Score                                          │    │
│  │  • NDVI Health                                         │    │
│  │  • Recent                                              │    │
│  │  • CTA Button                                          │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Animation Reference

### Pulsate Animation (Status Dot)
```
Time: 0s    50%    100%
Pulse Scale: ●  →  ◯  →  ●
Opacity:  1.0 → 0.7 → 1.0
Ring:     0px →  8px → 0px
Duration: 2 seconds (infinite)
Timing: ease-in-out
```

### Glow Animation (Text Effect)
```
Time: 0s    50%    100%
Glow Level: 10px → 20px → 10px
Duration: 2 seconds (infinite)
Timing: ease-in-out
```

### Shimmer Animation (Loading)
```
Time: 0s    50%    100%
Position: -1000px → 0px → 1000px
Duration: 1 second (looping)
Effect: Creates wave effect on skeleton loaders
```

### Float-In Animation (Entry)
```
Start State:
• opacity: 0
• transform: translateY(20px)

End State:
• opacity: 1
• transform: translateY(0)

Duration: 0.5 seconds
Timing: ease-out
```

---

## Color Application Matrix

| Component | Color | Hover | Active | Notes |
|-----------|-------|-------|--------|-------|
| **Primary Button** | Emerald-500 | Emerald-600 | Emerald-700 | Gradient, glow |
| **Success Card** | Emerald-5 tint | Emerald-8 tint | — | Green border |
| **Risk Progress** | Emerald-400→500 | — | — | Glowing bar |
| **Warning Card** | Orange-5 tint | Orange-8 tint | — | Orange border |
| **Error Card** | Red-5 tint | Red-8 tint | — | Red border |
| **Info Card** | Blue-5 tint | Blue-8 tint | — | Blue border |
| **Text (Primary)** | White | White | White | 100% opacity |
| **Text (Secondary)** | White | White | White | 70% opacity |
| **Text (Tertiary)** | White | White | White | 50% opacity |
| **Labels** | White | White | White | 60% opacity, caps |
| **Background** | #020617 | — | — | Deep base |
| **Cards** | White-5 | White-8 | — | Glass effect |

---

## Responsive Typography Adjustments

```
DESKTOP (1200px+)
Title: 32px
Section Header: 24px
Metric: 2.5rem (40px)
Body: 16px
Label: 12px

TABLET (768px)
Title: 28px
Section Header: 20px
Metric: 1.875rem (30px)
Body: 15px
Label: 11px

MOBILE (<768px)
Title: 24px
Section Header: 18px
Metric: 1.5rem (24px)
Body: 14px
Label: 11px
```

---

## Shadow System

```
LEVEL 1 (xs): 
0 1px 2px 0 rgba(0, 0, 0, 0.05)

LEVEL 2 (sm):
0 1px 3px 0 rgba(0, 0, 0, 0.1)

LEVEL 3 (md):
0 4px 6px -1px rgba(0, 0, 0, 0.1),
0 2px 4px -1px rgba(0, 0, 0, 0.06)

LEVEL 4 (lg):
0 8px 32px rgba(0, 0, 0, 0.3)

LEVEL 5 (xl):
0 12px 48px rgba(0, 0, 0, 0.2)
```

---

## Border Radius System

```
SMALL: 0.5rem (8px) - Small buttons, input fields
MEDIUM: 1rem (16px) - Standard components
LARGE: 2rem (32px) - Cards, major sections
```

---

## Spacing System (8px Base Unit)

```
4px   = 1 unit (px-1)
8px   = 2 units (px-2)
12px  = 1.5 units (px-3)
16px  = 2 units (px-4)
20px  = 2.5 units
24px  = 3 units (px-6)
32px  = 4 units (px-8)
40px  = 5 units
48px  = 6 units
```

---

## Quick CSS Variable Reference

```css
/* Colors */
--emerald-500: #22c55e;
--blue-500: #3b82f6;
--red-500: #ef4444;
--orange-500: #f97316;

/* Typography */
--font-sans: 'Inter', system fonts;
--font-size-xl: 32px;
--font-size-lg: 24px;
--font-size-md: 16px;
--font-size-sm: 14px;
--font-size-xs: 12px;

/* Spacing */
--gap-xs: 4px;
--gap-sm: 8px;
--gap-md: 12px;
--gap-lg: 16px;
--gap-xl: 24px;
--gap-2xl: 32px;

/* Radius */
--radius-lg: 2rem;
--radius-md: 1rem;
--radius-sm: 0.5rem;
```

---

## When to Use Each Card Variant

| Variant | Use Case | Example |
|---------|----------|---------|
| `.glass-card` | Standard content | Neutral information |
| `.glass-card-elevated` | Important sections | Header cards, featured |
| `.glass-card-emerald` | Success/Positive | Healthy metrics, success messages |
| `.glass-card-blue` | Information | Quick analysis, control panel |
| `.glass-card-red` | Critical/Warning | Risk scores, alerts |

---

## Browser DevTools Tips

### Inspect Glassmorphism
```javascript
// Chrome/Edge DevTools Console
element.style.backdropFilter;  // Should show: blur(20px) or blur(30px)
```

### Test Animations
```javascript
// Disable animations in DevTools
// Settings > Preferences > Rendering > Disable animations
```

### Check Contrast
```
Chrome DevTools > Elements > Styles > Color picker
Verify WCAG AA (minimum 4.5:1 for text)
```

---

## Common Implementation Patterns

### Creating a New Card Section
```jsx
<div className="glass-card glass-card-elevated">
  <h2 className="text-section-header">Metrics Dashboard</h2>
  <div className="metric-grid">
    <div>
      <div className="text-metric">95%</div>
      <div className="text-label">Coverage</div>
    </div>
    <div>
      <div className="text-metric">4</div>
      <div className="text-label">Satellites</div>
    </div>
  </div>
</div>
```

### Creating a Status Indicator
```jsx
<div className="status-badge operational">
  <div className="status-dot"></div>
  System Operational
</div>
```

### Creating a Metric Display
```jsx
<div className="glass-card glass-card-emerald">
  <h3 className="text-label">Vegetation Health</h3>
  <p className="text-metric" style={{color: '#22c55e'}}>
    0.87
  </p>
  <p className="text-secondary">NDVI Index Score</p>
</div>
```

---

## Performance Considerations

✅ **Optimizations Included:**
- GPU-accelerated animations (using `transform`)
- CSS variables for dynamic theming
- Optimized backdrop-filter (not on every element)
- Efficient media queries
- Minified CSS (25.99 kB gzip)
- No layout thrashing

⚠️ **Best Practices:**
- Don't use `blur()` on too many elements (performance impact)
- Prefer `transform` over `position` changes
- Use `will-change` sparingly
- Batch DOM updates
- Test on devices (not just desktop)

---

**This guide covers all visual aspects of the dark glassmorphism theme. Use it for consistency when extending the design.** ✨
