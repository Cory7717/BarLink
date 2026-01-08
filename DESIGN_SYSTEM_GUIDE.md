# Design System Maintenance Guide

## Quick Reference

### Adding Glassmorphic Cards to New Components
```tsx
<div className="rounded-xl border border-color-500/30 bg-linear-to-br from-color-500/10 to-color-600/5 backdrop-blur-md p-4 transition-all duration-300 hover:border-color-500/50 hover:shadow-lg hover:shadow-color-500/20 hover:scale-105">
  {/* Content */}
</div>
```

Replace `color` with: `emerald`, `blue`, `purple`, or `amber`

### Color-Coding System
```
Blue (#3b82f6)    → Views, Information, Search
Emerald (#10b981) → Engagement, Actions, Success
Purple (#a855f7)  → Special metrics, Highlights
Amber (#f59e0b)   → Performance, Peak times
Red (#ef4444)     → Favorites, Critical info
```

### Button Patterns
```tsx
// Primary Button
<button className="bg-linear-to-r from-emerald-500 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 rounded-lg px-4 py-2 font-semibold transition-all duration-200">
  Click me
</button>

// Secondary Button
<button className="bg-slate-700 text-white hover:bg-slate-600 active:scale-95 rounded-lg px-4 py-2 font-semibold transition-all duration-200">
  Click me
</button>
```

### Hover Animation Pattern
```tsx
<div className="group relative ... hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-color-500/20">
  {/* Content */}
  <div className="absolute inset-0 rounded-xl bg-linear-to-r from-color-500/0 to-color-500/0 opacity-0 transition-opacity group-hover:opacity-20"></div>
</div>
```

## Common Component Patterns

### Metric Card with Icon
```tsx
<div className="group relative rounded-xl border border-emerald-500/30 bg-linear-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-md p-4 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-105">
  <h3 className="text-sm text-emerald-300">Label</h3>
  <p className="mt-2 text-3xl font-bold text-emerald-100">Value</p>
  <p className="mt-1 text-xs text-emerald-400/70">Subtext</p>
</div>
```

### Card Section with Gradient
```tsx
<section className="rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-md p-6 shadow-lg">
  <h2 className="text-xl font-semibold text-white">Section Title</h2>
  <div className="mt-4 space-y-2">
    {/* Items */}
  </div>
</section>
```

### Text with Color Coding
```tsx
<span className="text-emerald-400">✓</span> Emerald for success
<span className="text-blue-300">i</span> Blue for info
<span className="text-purple-300">•</span> Purple for special
<span className="text-amber-300">!</span> Amber for warning
```

## Tailwind Classes Cheat Sheet

### Borders
- `border-emerald-500/30` → Subtle emerald border
- `border-emerald-500/50` → Prominent emerald border
- `border-slate-700/50` → Subtle gray border

### Backgrounds
- `bg-linear-to-br from-emerald-500/10 to-emerald-600/5` → Glassmorphic card
- `bg-emerald-500/5` → Very subtle background
- `bg-slate-900/40` → Dark overlay

### Text
- `text-emerald-300` → Lighter emerald
- `text-emerald-100` → Very light emerald
- `text-emerald-400/70` → Emerald with 70% opacity

### Shadows
- `shadow-lg` → Large shadow
- `shadow-emerald-500/20` → Color-matched shadow with 20% opacity

### Hover/Active States
- `hover:scale-105` → Grow 5% on hover
- `active:scale-95` → Shrink 5% when clicked
- `hover:border-emerald-500/50` → Border brighten on hover
- `hover:shadow-lg hover:shadow-emerald-500/20` → Enhanced glow

### Transitions
- `transition-all duration-300` → Smooth 300ms transition
- `transition-colors` → Only color transitions
- `transition-transform` → Only movement transitions

## Animation Classes

### Available Animations
```css
/* In globals.css */
.animate-pulse-glow {
  animation: pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
```

### Using Animations
```tsx
<div className="animate-pulse-glow">Pulsing element</div>
<div className="animate-pulse-glow animation-delay-2000">Delayed pulse</div>
```

## Responsive Design Pattern

All cards and sections follow this pattern:
```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {/* Items automatically stack on mobile, 2 columns on tablet, 4 on desktop */}
</div>
```

## Dark Mode Compatibility
All components use dark theme:
- Background: `bg-slate-950` or `bg-slate-900`
- Text: `text-white` for primary, `text-slate-300` for secondary
- Borders: `border-slate-700/50` or color-specific borders
- Accents: Color-specific (emerald, blue, purple, amber)

## Performance Tips
1. **Avoid excessive blur**: Limit `backdrop-blur` to key cards
2. **Use transform over position**: Scale and translate are GPU-accelerated
3. **Batch animations**: Use stagger delays instead of sequential
4. **Simplify gradients**: 2-3 colors max per gradient
5. **Test on mobile**: Animations can be taxing on older devices

## Accessibility Checklist
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Focus states visible on all interactive elements
- [ ] Animations respect `prefers-reduced-motion`
- [ ] Button text is descriptive (not just "Click")
- [ ] Images have alt text
- [ ] Form inputs have labels
- [ ] Keyboard navigation works
- [ ] Touch targets are at least 44x44px

### Adding Reduced Motion Support
```tsx
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Common Issues & Solutions

### Issue: Glassmorphism effect not visible
**Solution**: Ensure parent has a background, increase opacity of backgrounds (`/5` → `/10`)

### Issue: Text not readable on colored backgrounds
**Solution**: Use lighter text colors (`text-color-200/300` instead of `text-color-400`)

### Issue: Animations feel choppy
**Solution**: Check performance, reduce blur amount, use `will-change: transform`

### Issue: Hover effects not working on mobile
**Solution**: Animations work, but `hover` doesn't. Use JavaScript or `@media (hover: hover)`

## Updating Color Scheme
To change primary color from emerald to another color:
1. Find all `emerald-500` → Replace with new color
2. Find all `emerald-600` → Replace with new color
3. Find all `text-emerald-*` → Update text colors
4. Test on all pages
5. Verify contrast ratios

Example: Emerald to Teal
```
emerald-500 → teal-500
emerald-600 → teal-600
emerald-300 → teal-300
```

## File Organization
- **Page Styles**: Keep in page.tsx files
- **Component Styles**: Keep in component files
- **Global Styles**: Use globals.css
- **Reusable Classes**: Add to globals.css (like `.animate-pulse-glow`)
- **Tailwind Config**: Extend in tailwind.config.ts if needed

## Testing Design Changes
1. **Visual Testing**: Check all pages in browser
2. **Responsive Testing**: Test on mobile (375px), tablet (768px), desktop (1024px)
3. **Animation Testing**: Verify smooth playback at 60fps
4. **Contrast Testing**: Use WebAIM contrast checker
5. **Accessibility Testing**: Run axe DevTools extension

## Extending the Design System

### Adding a New Color Accent
1. Choose Tailwind color (e.g., `rose-500`)
2. Create card variant:
```tsx
// Rose variant
<div className="border border-rose-500/30 bg-linear-to-br from-rose-500/10 to-rose-600/5 text-rose-300">
  {/* Content */}
</div>
```
3. Update color-coding documentation
4. Test across all pages

### Adding a New Animation
1. Define in `globals.css`:
```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-slide-in {
  animation: fadeSlideIn 0.5s ease-out;
}
```
2. Use in components: `className="animate-fade-slide-in"`
3. Document in this guide

## Documentation Standards
When adding new components:
1. Add comment explaining color usage
2. Include example of all states (hover, active, disabled)
3. Note accessibility considerations
4. Document responsive breakpoints
5. Add to this guide

## Version History
- **v1.0** (Current): Initial glassmorphic design with color-coded metrics
  - Navigation with gradient
  - Hero section with animations
  - Pricing cards with glassmorphism
  - Analytics dashboard with color-coded metrics
  - Consistent button styling

## Support & Questions
For design questions:
1. Check this guide first
2. Review similar components in codebase
3. Test variations in browser
4. Verify color contrast and accessibility
