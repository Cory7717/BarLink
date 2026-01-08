# Design System Visual Reference

## Color Palette with Usage

### Primary - Emerald (#10b981)
```
Hex: #10b981
RGB: 16, 185, 129
Tailwind: emerald-500, emerald-600

Usage:
- Primary CTAs and buttons
- Success states
- Active engagement metrics
- Highlights and accents
- Navigation active state

Classes:
- bg-emerald-500       → Button background
- text-emerald-400     → Emphasized text
- text-emerald-300     → Secondary text
- border-emerald-500/30 → Subtle border
- from-emerald-500/10  → Card background
```

### Secondary - Blue (#3b82f6)
```
Hex: #3b82f6
RGB: 59, 130, 246
Tailwind: blue-500, blue-600

Usage:
- Information & details
- Views and impressions
- Search-related metrics
- Alternative CTAs
- Navigation links

Classes:
- bg-blue-500         → Button background (secondary)
- text-blue-300       → Text color
- text-blue-400/70    → Subtext
- border-blue-500/30  → Card border
- from-blue-500/10    → Card background
```

### Accent - Purple (#a855f7)
```
Hex: #a855f7
RGB: 168, 85, 247
Tailwind: purple-500, purple-600

Usage:
- Special metrics
- Highlights
- Premium features
- Search appearances
- Alternative accents

Classes:
- bg-purple-500       → Button background
- text-purple-300     → Text color
- border-purple-500/30 → Card border
- from-purple-500/10  → Card background
```

### Highlight - Amber (#f59e0b)
```
Hex: #f59e0b
RGB: 245, 158, 11
Tailwind: amber-500, amber-600

Usage:
- Best performing metrics
- Warnings and alerts
- Peak performance indicators
- Time-sensitive info
- Warmth accents

Classes:
- bg-amber-500        → Button background
- text-amber-300      → Text color
- text-amber-400/70   → Subtext
- border-amber-500/30 → Card border
- from-amber-500/10   → Card background
```

### Background - Slate
```
bg-slate-950       → Main page background (darkest)
bg-slate-900       → Secondary background
bg-slate-800       → Tertiary background
bg-slate-700/50    → Subtle overlay

text-white         → Primary text
text-slate-300     → Secondary text
text-slate-400     → Tertiary text
text-slate-500     → Muted text
```

## Typography

### Headlines
```
Text: Bold, large size
Color: text-white (primary), color-300 (accents)
Example: <h1 className="text-4xl font-bold">Main Heading</h1>

Sizes:
- h1: text-4xl (36px)
- h2: text-2xl (24px)  
- h3: text-xl (20px)
- h4: text-lg (18px)
```

### Body Text
```
Primary: text-white / text-slate-100
Secondary: text-slate-300
Tertiary: text-slate-400
Muted: text-slate-500

Line height: leading-relaxed (1.625) for readability
Font weight: normal (400) for body
```

### Accent Text
```
Success: text-emerald-400 / text-emerald-300
Info: text-blue-400 / text-blue-300
Special: text-purple-400 / text-purple-300
Warning: text-amber-400 / text-amber-300
```

## Card Designs

### Glassmorphic Card Template
```
Structure:
┌─────────────────────────────────┐
│ 🎨 Header/Icon                  │
├─────────────────────────────────┤
│ Title or Metric                 │
│ Large number or value           │
│ Subtext or description          │
└─────────────────────────────────┘

Properties:
- Border: border-color-500/30 (subtle)
- Background: from-color-500/10 to-color-600/5
- Blur: backdrop-blur-md
- Shadow: shadow-lg (on hover)
- Shadow Glow: shadow-color-500/20
- Rounded: rounded-xl (smaller) or rounded-2xl (larger)
- Padding: p-4 to p-6
- Hover: scale-105, enhanced shadow, border-color-500/50
```

### Example: Emerald Glassmorphic Card
```html
<div class="rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md p-4 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105">
  <h3 class="text-sm text-emerald-300">Label</h3>
  <p class="mt-2 text-3xl font-bold text-emerald-100">123</p>
  <p class="mt-1 text-xs text-emerald-400/70">Supporting text</p>
</div>
```

## Button Styles

### Primary Button (CTA)
```
Background: gradient-to-r from-emerald-500 to-emerald-600
Text: text-slate-950 font-semibold
Hover: from-emerald-400 to-emerald-500, shadow-lg shadow-emerald-500/30
Active: scale-95
Disabled: opacity-50 cursor-not-allowed

Full class:
bg-linear-to-r from-emerald-500 to-emerald-600 text-slate-950 
hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg 
hover:shadow-emerald-500/30 active:scale-95 rounded-lg 
px-4 py-3 font-semibold transition-all duration-200 disabled:opacity-50
```

### Secondary Button
```
Background: bg-slate-700
Text: text-white font-semibold
Hover: bg-slate-600
Active: scale-95
Disabled: opacity-50 cursor-not-allowed

Full class:
bg-slate-700 text-white hover:bg-slate-600 active:scale-95 
rounded-lg px-4 py-3 font-semibold transition-all duration-200 
disabled:opacity-50
```

## Metric Cards with Colors

### 4-Column Metric Layout
```
Column 1: Blue (Views/Info)
├─ border-blue-500/30
├─ bg-linear-to-br from-blue-500/10 to-blue-600/5
├─ text-blue-300 (label)
└─ text-blue-100 (value)

Column 2: Emerald (Engagement)
├─ border-emerald-500/30
├─ bg-linear-to-br from-emerald-500/10 to-emerald-600/5
├─ text-emerald-300 (label)
└─ text-emerald-100 (value)

Column 3: Purple (Special)
├─ border-purple-500/30
├─ bg-linear-to-br from-purple-500/10 to-purple-600/5
├─ text-purple-300 (label)
└─ text-purple-100 (value)

Column 4: Amber (Performance)
├─ border-amber-500/30
├─ bg-linear-to-br from-amber-500/10 to-amber-600/5
├─ text-amber-300 (label)
└─ text-amber-100 (value)
```

## Spacing System

```
Padding:
- p-4   → 16px (cards)
- p-6   → 24px (sections)
- p-8   → 32px (large sections)

Gap:
- gap-2  → 8px (tight)
- gap-4  → 16px (standard)
- gap-6  → 24px (relaxed)

Margin:
- mt-2   → 8px (minimal)
- mt-4   → 16px (standard)
- mt-6   → 24px (generous)
- mt-8   → 32px (large space)

Grid:
- sm:grid-cols-2  → 2 columns on tablet+
- md:grid-cols-2  → 2 columns on desktop
- lg:grid-cols-4  → 4 columns on large
- grid-cols-7     → 7 columns (for days)
```

## Rounded Corners

```
Small:   rounded-lg     (8px) - Input fields, small buttons
Medium:  rounded-xl     (12px) - Cards, medium buttons
Large:   rounded-2xl    (16px) - Sections, major cards
Full:    rounded-full   (50%) - Badges, avatars
```

## Transitions

### Standard Transition
```
transition-all duration-300

Duration options:
- duration-200 → 200ms (quick)
- duration-300 → 300ms (standard)
- duration-500 → 500ms (slow)

Types:
- transition-all       → All properties
- transition-colors    → Only colors
- transition-transform → Only transforms
```

### Easing Functions
```
ease-in-out → Smooth, natural (default)
ease-in     → Starts slow
ease-out    → Ends slow
ease-linear → Constant speed
cubic-bezier(0.4, 0, 0.6, 1) → Custom smooth
```

## Animation Timings

```
Quick interactions:  200-300ms
Standard actions:    300-500ms
Transitions:         500-800ms
Long sequences:      1-2s per element
Full page load:      2-3s total

Stagger delays:
- 0s   → First element (immediate)
- 2s   → Second wave
- 4s   → Third wave
- 6s+  → Additional waves
```

## Hover State Patterns

### Card Hover
```
Scale:  hover:scale-105          (5% larger)
Shadow: hover:shadow-lg          (enhanced shadow)
Glow:   hover:shadow-color-500/20 (color-matched glow)
Border: hover:border-color-500/50 (brighter border)

Combined:
class="... hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300"
```

### Button Hover
```
Background: hover:bg-color-400
Shadow:     hover:shadow-lg
Glow:       hover:shadow-color-500/30
Scale:      hover:scale-105 or no scale

Active:
Scale:      active:scale-95 (pressed effect)
```

## Opacity Scale

```
Fully opaque:    (no opacity modifier)
90% opacity:     /90
80% opacity:     /80
70% opacity:     /70
60% opacity:     /60
50% opacity:     /50
40% opacity:     /40
30% opacity:     /30
20% opacity:     /20
10% opacity:     /10
5% opacity:      /5
```

## Grid Layouts

### 3-Column Card Layout
```
Grid: gap-6 md:grid-cols-3
- Mobile: 1 column, full width
- Tablet: 2 columns
- Desktop: 3 columns

Useful for: Pricing cards, feature cards, pricing tiers
```

### 4-Column Metric Layout
```
Grid: gap-4 sm:grid-cols-2 lg:grid-cols-4
- Mobile: 1 column
- Small device: 2 columns
- Large: 4 columns

Useful for: Dashboard metrics, stats, KPIs
```

### 7-Column Day Layout
```
Grid: gap-4 sm:grid-cols-7
- Mobile: 1 column
- Tablet+: 7 columns (one per day)

Useful for: Weekly analytics, day of week breakdown
```

## Interactive Element States

### Button States
```
Default:   bg-emerald-500
Hover:     bg-emerald-400 + shadow
Active:    scale-95 (pressed)
Disabled:  opacity-50 + cursor-not-allowed
Focus:     ring-2 ring-emerald-400 (for accessibility)
```

### Link States
```
Default:   text-emerald-300
Hover:     text-emerald-200
Active:    text-emerald-100
Disabled:  text-slate-500
```

## Shadow Depths

```
No shadow:       (shadow-none)
Light shadow:    shadow-sm (0 1px 2px 0)
Standard shadow: shadow (0 1px 3px 0)
Medium shadow:   shadow-md (0 4px 6px -1px)
Large shadow:    shadow-lg (0 10px 15px -3px)
X-Large shadow:  shadow-xl (0 20px 25px -5px)
2X-Large shadow: shadow-2xl (0 25px 50px -12px)

Color-matched:
shadow-emerald-500/20    → Emerald glow at 20% opacity
shadow-color-500/30      → Color at 30% opacity
```

## Common Component Combinations

### Stat Card with Percentage
```html
<div class="rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md p-4">
  <div class="flex items-center justify-between">
    <h3 class="text-sm text-emerald-300">Growth</h3>
    <span class="text-xs font-semibold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded-full">+12%</span>
  </div>
  <p class="mt-2 text-3xl font-bold text-emerald-100">1,234</p>
</div>
```

### Section with Title and Grid
```html
<section class="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6">
  <h2 class="text-xl font-semibold text-white">Section Title</h2>
  <div class="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
    {/* Items go here */}
  </div>
</section>
```

### Ranked List Item
```html
<div class="flex items-center justify-between rounded-lg border border-blue-500/20 bg-linear-to-r from-blue-500/5 to-transparent p-4">
  <div class="flex items-center gap-3">
    <span class="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-blue-600 text-xs font-semibold text-white">1</span>
    <span class="text-slate-200">Item name</span>
  </div>
  <span class="text-sm font-semibold text-blue-300">Value</span>
</div>
```

## Accessibility Considerations

### Text Contrast (WCAG AA)
```
✓ White on emerald-500:     Contrast 4.5:1 ✓
✓ slate-300 on slate-900:   Contrast 7.3:1 ✓
✓ emerald-100 on emerald-500/10: Contrast 8.2:1 ✓
⚠ emerald-500 on emerald-500/10: Poor contrast ✗
```

### Focus States
```
Always include:
outline: 2px solid color
outline-offset: 2px

Example:
focus:outline-2 focus:outline-emerald-400
```

### Color Alone
```
Never use color alone to convey meaning.
Always pair with icons, text, or patterns:
- ✓ "Success (green) + checkmark"
- ✗ "Just green"
```

## Performance Optimization

### What to Avoid
```
- Excessive backdrop-blur (apply only to key elements)
- Complex shadow cascades (2 shadows max per element)
- Rapid scale animations on many elements
- Animated gradients (use static gradients instead)
- Blur on every card (only on featured cards)
```

### Optimized Approach
```
✓ Use transform: scale() for animations (GPU-accelerated)
✓ Use opacity changes instead of visibility toggles
✓ Limit blur to 2-3 key elements
✓ Use simple 2-color gradients
✓ Batch animations with stagger delays
✓ Test animations at 60fps on mobile
```

## Implementation Checklist

- [ ] All cards use glassmorphic design
- [ ] Hover states scale to 105%
- [ ] Buttons use gradient backgrounds
- [ ] Metrics are color-coded
- [ ] Animations are smooth and purposeful
- [ ] Text has adequate contrast
- [ ] Spacing is consistent
- [ ] Responsive design is tested
- [ ] Mobile layout is clean
- [ ] Focus states are visible
