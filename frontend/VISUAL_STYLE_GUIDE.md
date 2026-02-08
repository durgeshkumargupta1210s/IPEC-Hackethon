# Visual Style Guide - Satellite Monitoring Dashboard

## 🎨 Design System Overview

This document provides a comprehensive visual reference for the refactored dashboard UI.

---

## Color Palette

### Primary Colors

#### Green - Success/Healthy
```
--color-success-500: #22c55e (Primary Green)
--color-success-600: #16a34a (Dark Green)
--color-success-700: #15803d (Darker Green)
--color-success-50:  #f0fdf4 (Light Green)
```
**Uses:** Operational status, healthy vegetation, positive metrics
**Example:** "✓ Vegetation healthy" badge, positive risk assessments

#### Red - Danger/Critical
```
--color-danger-500: #ef4444 (Primary Red)
--color-danger-600: #dc2626 (Dark Red)
--color-danger-700: #b91c1c (Darker Red)
--color-danger-50:  #fef2f2 (Light Red)
```
**Uses:** Critical alerts, high risk, errors, vegetation loss
**Example:** "🚨 High vegetation loss" cards, critical warnings

#### Orange - Warning/Caution
```
--color-warning-500: #f97316 (Primary Orange)
--color-warning-600: #ea580c (Dark Orange)
--color-warning-700: #c2410c (Darker Orange)
--color-warning-50:  #fefce8 (Light Orange)
```
**Uses:** Medium risk, caution, attention needed
**Example:** "⚠️ Moderate vegetation changes" status badges

#### Blue - Primary/Information
```
--color-primary-500: #3b82f6 (Primary Blue)
--color-primary-600: #2563eb (Dark Blue)
--color-primary-700: #1d4ed8 (Darker Blue)
--color-primary-50:  #eff6ff (Light Blue)
```
**Uses:** Primary actions, information, neutral content
**Example:** "Run Analysis" button, informational cards

#### Gray - Neutral
```
--color-neutral-50:   #f9fafb (Almost white)
--color-neutral-100:  #f3f4f6 (Light gray bg)
--color-neutral-200:  #e5e7eb (Light borders)
--color-neutral-300:  #d1d5db (Gray borders)
--color-neutral-400:  #9ca3af (Medium gray)
--color-neutral-500:  #6b7280 (Text secondary)
--color-neutral-600:  #4b5563 (Text darker)
--color-neutral-700:  #374151 (Text dark)
--color-neutral-800:  #1f2937 (Text darker)
--color-neutral-900:  #111827 (Almost black)
```
**Uses:** Text, backgrounds, disabled states, borders
**Example:** Form inputs, secondary text, card backgrounds

---

## Shadow System

Three levels of elevation with subtle shadows:

### Shadow Sizes

```css
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  /* Slight depth for interactive elements */

--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  /* Default for cards, small lift */

--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  /* Hover state, moderate elevation */

--shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
  /* Modal, high elevation, strong focus */

--shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.12);
  /* Dropdowns, absolute highest elevation */
```

### When to Use Each

| Level | Component | Context |
|-------|-----------|---------|
| xs | Subtle dividers | Minimal depth needed |
| sm | Cards at rest | Default state |
| md | Card hover state | Interactive feedback |
| lg | Dropdowns, modals | Floating content |
| xl | Deep modals | Maximum focus |

**Example Progression:**
```
Card at rest (sm) → Hover (md) → Click (lg)
```

---

## Typography Hierarchy

### Scale

```
H1: 32px   700 weight   -0.5px tracking   (App title)
H2: 18px   700 weight   -0.3px tracking   (Section titles)
H3: 15px   700 weight    0.0px tracking   (Card titles)
H4: 14px   600 weight    0.3px tracking   (Button text)

Body:       14px   400 weight    0.0px tracking   (Default text)
Small:      13px   400 weight    0.0px tracking   (Description)
Label:      12px   700 weight    0.5px uppercase  (Status, labels)
Tiny:       11px   700 weight    0.5px uppercase  (Hints)
```

### Usage Examples

```
Page Title:
  "🌍 Satellite Monitoring System"
  → 32px, 700, letter-spacing: -0.5px

Section Title:
  "Risk Assessment"
  → 18px, 700, letter-spacing: -0.3px

Card Title:
  "Risk Level"
  → 15px, 700

Metric Value:
  "87.5"
  → 28px, 700 (special case)

Description Text:
  "How severe the forest degradation is..."
  → 13px, 400, line-height: 1.5

Status Label:
  "CRITICAL"
  → 12px, 700, UPPERCASE
```

---

## Component Dimensions

### Card Heights

```
MetricCard:        
  Small:   80px
  Default: 120px
  Large:   160px

StatusBadge:
  Small:   24px (height)
  Default: 32px (height)
  Large:   40px (height)

Button:
  Small:   28px (height)
  Default: 36px (height)
  Large:   44px (height)

Input:
  Default: 36px (height)
```

### Icon Sizes

```
MetricCard:        24px
SectionTitle:      20px
Card Header:       20px
StatusBadge:       14px
Button Icon:       16px
```

---

## Spacing Scale

8px-based spacing system for mathematical consistency:

```
1 unit  =  4px   (--space-1)
1 unit  =  8px   (--space-2)   ← Base unit
1.5u    = 12px   (--space-3)
2 units = 16px   (--space-4)
2.5u    = 20px   (--space-5)
3 units = 24px   (--space-6)
4 units = 32px   (--space-8)
5 units = 40px   (--space-10)
6 units = 48px   (--space-12)
```

### Application

```
Component padding:      16px (2 units)
Element gap:            12px (1.5 units)
Section margin:         24px (3 units)
Card padding:           16px (2 units)
Input padding:          8px h, 12px v (1.5 units)
Button padding:         12px h, 8px v (1 unit)
```

---

## Border Radius

```
--radius-sm:  4px    (Small inputs, tight elements)
--radius-md:  8px    (Standard buttons, form fields)
--radius-lg: 12px    (Cards, sections, large elements)
--radius-full: 9999px (Badges, fully rounded)
```

### Usage

```
Buttons:           8px
Cards:             12px
Sections:          12px
Form Inputs:       8px
Badges:            9999px (pill-shaped)
Small Icons:       8px
```

---

## Animations

### Duration

```
--transition-fast:  150ms ease-in-out
--transition-base:  200ms ease-in-out (default)
--transition-slow:  300ms ease-in-out
```

### Common Animations

```
slideUp:
  From: opacity 0, translateY(8px)
  To:   opacity 1, translateY(0)
  Use:  Elements entering the page

fadeIn:
  From: opacity 0
  To:   opacity 1
  Use:  Modals, overlays

hover:
  Effect: translateY(-2px) + shadow increase
  Use:    Cards, buttons

shimmer:
  Duration: 2s infinite
  Use:     Loading skeletons
```

### Timing Examples

```
Page load:        slideUp 300ms ease-out
Card hover:       shadow 200ms ease-in-out
Button click:     scale 150ms ease-out
Modal enter:      fadeIn 200ms ease-out
Loading skeleton: shimmer 2s infinite
```

---

## Hover & Active States

### Card Hover

```
Border:   neutral-200 → neutral-300
Shadow:   sm → md
Transform: translateY(-2px)
Duration:  200ms
```

### Button Hover

```
Background: base → darker variant
Shadow:     sm → md
Transform:  translateY(-1px)
Duration:   200ms
```

### Button Active

```
Transform: translateY(0)
Feedback:  Pressed visual
Duration:  Instant
```

### Input Focus

```
Border:       neutral-300 → primary-500
Outline:      3px primary-500 with 0.1 opacity
Background:   neutral-50 → primary-50
Duration:     200ms
```

---

## Focus States

### Keyboard Navigation

```
Outline: 3px solid with 0.1 opacity of primary color
Offset:  2px from element border
Color:   Primary blue (#3b82f6)
Duration: 200ms transition
```

### Visual Examples

```
Button focus:    Blue 3px outline + 2px offset
Input focus:     Blue 3px outline + background tint
Link focus:      Blue underline + outline
Card focus:      Blue outline (keyboard nav)
```

---

## Responsive Adjustments

### Typography Scale

**Desktop (1200px+):**
```
H1: 32px
H2: 18px
Body: 14px
```

**Tablet (768px-1199px):**
```
H1: 28px
H2: 16px
Body: 13px
```

**Mobile (<768px):**
```
H1: 24px
H2: 14px
Body: 12px
```

### Spacing Scale

**Desktop:** Full spacing system (8px multiples)

**Tablet:** 90% of desktop spacing

**Mobile:** 75% of desktop spacing, minimum 8px

### Card Grid

**Desktop:**
```
4-column: 4 cards per row
3-column: 3 cards per row
2-column: 2 cards per row
```

**Tablet:**
```
4-column → 2-column
3-column → 2-column
2-column → 1-column
```

**Mobile:**
```
All grids → 1-column
Full width with 8px padding
```

---

## Color Combinations (Approved)

### Text on Background

✅ **Approved Combinations:**
- Dark text (neutral-900) on light backgrounds
- White text on dark backgrounds (primary-600+)
- Semantic color text on white
- Muted text (neutral-500) on neutral-50

❌ **Avoid:**
- Light text on light backgrounds
- Low contrast combinations
- More than 2 colors per section

### Card Styling

```
Success Card:
  Background: white
  Border: green
  Text: green-700 for values
  Description bg: green-50

Danger Card:
  Background: white
  Border: red
  Text: red-700 for values
  Description bg: red-50

Warning Card:
  Background: white
  Border: orange
  Text: orange-700 for values
  Description bg: orange-50
```

---

## Component States

### Loading

```
Opacity: 0.6
Pointer-events: none
Cursor: not-allowed
Show: Loading skeleton
Spinner: 14px blue
```

### Disabled

```
Opacity: 0.5
Pointer-events: none
Cursor: not-allowed
Color: neutral-400
```

### Error

```
Border: red-600
Background: red-50
Text: red-700
Icon: 🚨 or ❌
```

### Success

```
Border: green-600
Background: green-50
Text: green-700
Icon: ✓ or ✅
```

### Warning

```
Border: orange-600
Background: orange-50
Text: orange-700
Icon: ⚠️ or ⛔
```

---

## Consistency Checklist

✅ **Before Committing:**

- [ ] All cards use shadow-md on hover
- [ ] All text uses one of 6 approved sizes
- [ ] All spacing uses 8px multiples
- [ ] All colors from approved palette
- [ ] Border radius matches (8px or 12px)
- [ ] Icons are consistent style/size
- [ ] Animations use approved durations
- [ ] Buttons follow variant system
- [ ] Forms have focus states
- [ ] Mobile layout tested

---

## Quick Reference Card

**Copy & paste this for reference:**

```
Colors:     Green(success), Red(danger), Orange(warn), Blue(primary)
Spacing:    8px base, use multiples (8, 16, 24, 32, 40px)
Typography: H1(32px), H2(18px), Body(14px), Label(12px)
Shadows:    sm(default), md(hover), lg(modal)
Radius:     8px(buttons), 12px(cards)
Duration:   200ms default, 150ms fast, 300ms slow
States:     Hover(-2px, shadow↑), Focus(outline), Active(scale↓)
Mobile:     <768px: 1col, 75% spacing, smaller fonts
```

---

## Resources

📁 **Files:**
- Colors: `/src/styles/modern.css` (CSS variables)
- Components: `/src/components/UI/UI.css`
- App Layout: `/src/styles/modern.css`

📄 **Documentation:**
- Full Guide: `REFACTORING_GUIDE.md`
- Quick Ref: `UI_COMPONENTS_QUICK_REF.md`
- This File: `VISUAL_STYLE_GUIDE.md`

🎨 **Tools:**
- Inspector: Browser DevTools
- Colors: Color picker from screenshot
- Measurements: DevTools measurement tools

---

*Keep this guide handy for consistent, professional design across the entire dashboard!*
