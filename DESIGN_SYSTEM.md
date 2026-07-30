# ITQAN Friends Design System

## 🎨 Color Palette

| Token Name | Value | Usage |
| :--- | :--- | :--- |
| `--background` | `#020617` | Deep Midnight Slate main background |
| `--surface` | `#0F172A` | Secondary surface background |
| `--primary` | `#0EA5A4` | Teal / Emerald accent for CTAs and highlights |
| `--secondary` | `#1E293B` | Card container & border background |
| `--accent` | `#FBBF24` | Warm Gold accent for badges and star elements |
| `--card` | `rgba(15, 23, 42, 0.65)` | Glassmorphism card fill |
| `--card-border` | `rgba(255, 255, 255, 0.1)` | Subtle glass border |

---

## 📐 Typography & Spacing Scale

### Fonts
- **Headings**: `Outfit` / `Clash Display` fallback system font (`font-sans font-bold`)
- **Body**: `Inter`, system-ui, sans-serif

### Spacing Scale
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

---

## 🎬 Motion Tokens & Principles

```css
--ease-standard: cubic-bezier(0.16, 1, 0.3, 1);
--ease-emphasized: cubic-bezier(0.2, 0, 0, 1);
--ease-linear: linear;

--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 400ms;
```

### Motion Principles
1. **Hover Micro-interactions**: Must be **≤ 200ms** with `--ease-standard`.
2. **Page & Section Transitions**: Must be **≤ 400ms** with `--ease-emphasized`.
3. **Accessibility**: Always respect `@media (prefers-reduced-motion: reduce)`.
4. **Layout Shifts**: Avoid animating layout width/height directly; use CSS transforms (`transform: translate3d/scale`).

---

## ♿ Accessibility Guidelines
- All interactive controls must feature `focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none`.
- Contrast ratio between text and background must meet WCAG AAA standards (min 7:1 for body, 4.5:1 for headings).
- All images must include descriptive `alt` tags.
