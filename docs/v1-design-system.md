# V1 Design System Reference

Complete design system documentation including colors, typography, spacing, and CSS patterns.

## Table of Contents
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Border Radius](#border-radius)
- [Shadows & Effects](#shadows--effects)
- [Animations](#animations)
- [Responsive Breakpoints](#responsive-breakpoints)
- [Common Patterns](#common-patterns)

---

## Color Palette

The template uses a **neutral-based** color scheme with no bright accent colors.

### Background Colors
```css
bg-neutral-950   /* Main dark background (almost black) */
bg-neutral-900   /* Slightly lighter dark */
bg-neutral-800   /* Hover state for dark buttons */
bg-white         /* Light sections, cards */
bg-white/50      /* Semi-transparent cards (50% opacity) */
bg-white/10      /* Very subtle light overlay */
```

### Text Colors
```css
/* On dark backgrounds */
text-white              /* Primary text on dark */
text-neutral-300        /* Secondary text on dark */
text-neutral-200        /* Lighter secondary */

/* On light backgrounds */
text-neutral-950        /* Primary text on light */
text-neutral-600        /* Secondary text on light */
text-neutral-500        /* Tertiary/labels */
text-neutral-400        /* Disabled text */
```

### Border Colors
```css
border-neutral-950      /* Dark borders */
border-neutral-950/20   /* Subtle dark borders (20% opacity) */
border-neutral-800      /* Divider lines on dark */
border-neutral-300      /* Light borders */
border-neutral-200      /* Subtle light borders */
```

### Accent/Decorative Colors
```css
/* The Border component uses these */
before:bg-neutral-950   /* Solid accent line */
after:bg-neutral-950/10 /* Faded accent line */

/* Inverted (on dark backgrounds) */
before:bg-white         /* Light accent line */
after:bg-white/10       /* Faded light accent */
```

### Hover States
```css
hover:bg-neutral-800    /* Dark button hover */
hover:bg-neutral-200    /* Light button hover */
hover:text-neutral-950  /* Link hover on light */
hover:text-neutral-700  /* Link hover (slightly less contrast) */
```

### Focus States
```css
focus:border-neutral-950          /* Focus border */
focus:ring-neutral-950/5          /* Subtle focus ring */
focus-visible:ring-1              /* Visible focus ring */
focus-visible:ring-neutral-950    /* Ring color */
focus-visible:ring-offset-2       /* Ring offset */
```

### Colors for WhichMap
Since the template doesn't include green, you'll need to add for "fastest" highlighting:

```css
/* Add to your palette */
border-green-500        /* Fastest indicator border */
text-green-600          /* "Fastest" badge text */
bg-green-500/10         /* Subtle green background */
```

---

## Typography

### Font Family
**Mona Sans** - Variable font supporting:
- Weight: 200-900
- Width: 75%-125%

```css
font-sans     /* Body text: Mona Sans, system fallback */
font-display  /* Headings: Mona Sans with 125% width variation */
```

### Text Sizes & Line Heights

Defined in `v1/src/styles/tailwind.css` @theme block:

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem (12px) | 1rem (16px) | Fine print |
| `text-sm` | 0.875rem (14px) | 1.5rem (24px) | Small labels, buttons |
| `text-base` | 1rem (16px) | 1.75rem (28px) | Body text (default) |
| `text-lg` | 1.125rem (18px) | 1.75rem (28px) | Large body |
| `text-xl` | 1.25rem (20px) | 2rem (32px) | Subheadings |
| `text-2xl` | 1.5rem (24px) | 2.25rem (36px) | Section headings |
| `text-3xl` | 1.75rem (28px) | 2.25rem (36px) | Large headings |
| `text-4xl` | 2rem (32px) | 2.5rem (40px) | Major headings |
| `text-5xl` | 2.5rem (40px) | 3rem (48px) | Page titles |
| `text-6xl` | 3rem (48px) | 3.5rem (56px) | Hero headings |
| `text-7xl` | 4rem (64px) | 4.5rem (72px) | Massive headlines |

### Font Weights
```css
font-normal      /* 400 - body text */
font-medium      /* 500 - slightly emphasized */
font-semibold    /* 600 - headings, labels */
font-bold        /* 700 - strong emphasis */
```

### Typography Patterns

**Page Headings**
```jsx
<h1 className="font-display text-5xl font-medium tracking-tight text-white sm:text-7xl">
  WhichMap
</h1>
```

**Section Headings**
```jsx
<h2 className="font-display text-2xl font-semibold text-neutral-950">
  Results
</h2>
```

**Body Text**
```jsx
<p className="text-base text-neutral-600">
  Regular paragraph text
</p>
```

**Labels/Small Text**
```jsx
<span className="text-sm text-neutral-500">
  Field label or helper text
</span>
```

**Large Metrics** (like ETAs)
```jsx
<dd className="font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
  25 min
</dd>
```

**Eyebrow Text** (small text above headings)
```jsx
<p className="text-sm font-semibold tracking-wider text-neutral-500">
  SECTION LABEL
</p>
```

### Text Utilities
```css
tracking-tight    /* Tighter letter spacing for large headings */
tracking-wider    /* Wider spacing for small caps/eyebrows */
antialiased       /* Smooth font rendering (applied to <html>) */
leading-relaxed   /* Looser line height for readability */
```

---

## Spacing & Layout

### Vertical Spacing Pattern

The template uses a **progressive spacing scale**:

```css
/* Mobile → Tablet → Desktop */
mt-16 sm:mt-24 lg:mt-32    /* Between major sections */
mt-10 sm:mt-16 lg:mt-20    /* Between subsections */
mt-6 sm:mt-8               /* Between related elements */
mt-4                       /* Between tightly related items */
mt-2                       /* Minimal spacing */
```

**Common Section Spacing**
```jsx
<section className="mt-24 sm:mt-32 lg:mt-40">
  {/* Large top margin for major sections */}
</section>
```

### Container Padding
```css
px-6 lg:px-8              /* Horizontal padding on containers */
py-20 sm:py-32            /* Vertical padding on sections */
py-8                      /* Padding on smaller containers */
```

### Grid Gaps
```css
gap-8                     /* Standard grid gap */
gap-10                    /* Larger gap for cards */
gap-x-8 gap-y-10         /* Different horizontal/vertical gaps */
gap-y-24                  /* Large vertical gap */
```

### Max Widths
```css
max-w-7xl                 /* Main container: 80rem (1280px) */
max-w-2xl                 /* Content column: 42rem (672px) */
max-w-none                /* Remove constraint (for wider layouts) */
```

### Layout Pattern: Two-Column
```jsx
<Container>
  <div className="mx-auto max-w-7xl px-6 lg:px-8">
    <div className="mx-auto max-w-2xl lg:max-w-none">
      <div className="grid grid-cols-1 gap-x-8 gap-y-24 lg:grid-cols-2">
        {/* Left column */}
        {/* Right column */}
      </div>
    </div>
  </div>
</Container>
```

---

## Border Radius

```css
rounded-full      /* Fully rounded (pills, buttons) */
rounded-2xl       /* Large: 1rem (16px) - cards, inputs */
rounded-4xl       /* Extra large: 2.5rem (40px) - sections */
rounded-lg        /* Medium: 0.5rem (8px) */
rounded           /* Small: 0.25rem (4px) */
```

**Usage Examples**
```css
/* Button */
className="rounded-full px-4 py-1.5"

/* Card/Form group */
className="rounded-2xl bg-white/50"

/* Large section background */
className="rounded-4xl bg-neutral-950 py-20"
```

### Conditional Rounding (Form Inputs)
```css
group-first:rounded-t-2xl    /* Only round top of first item */
group-last:rounded-b-2xl     /* Only round bottom of last item */
```

---

## Shadows & Effects

### Focus Rings
```css
ring-4 ring-transparent                /* Default state */
focus:ring-neutral-950/5               /* Subtle focus ring */
focus-visible:ring-1 ring-offset-2     /* Visible keyboard focus */
```

### Opacity
```css
bg-white/50      /* 50% opacity */
bg-white/10      /* 10% opacity */
border-neutral-950/20   /* 20% opacity border */
```

### Backdrop Effects
```css
bg-white/50      /* Semi-transparent backgrounds */
backdrop-blur    /* Blur effect (not heavily used) */
```

---

## Animations

### Duration & Easing
```css
transition                 /* Default: all 150ms */
transition-all             /* Transition all properties */
duration-200               /* 200ms */
duration-500               /* 500ms (used in FadeIn) */
```

### Framer Motion Variants (FadeIn)
```javascript
variants={{
  hidden: { opacity: 0, y: 24 },      // Start: invisible, 24px down
  visible: { opacity: 1, y: 0 },      // End: visible, normal position
}}
transition={{ duration: 0.5 }}        // 500ms animation
```

### Stagger Timing
```javascript
// FadeInStagger
staggerChildren: 0.2      // Default: 200ms delay between children
staggerChildren: 0.12     // Faster: 120ms delay
```

### Viewport Trigger
```javascript
viewport={{ once: true, margin: '0px 0px -200px' }}
```
- Triggers 200px before element enters viewport
- Only animates once (`once: true`)

### Loading Spinner
```css
animate-spin              /* Continuous rotation */
border-r-transparent      /* Creates spinner effect with border */
```

Example:
```jsx
<div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
```

### Hover Transitions
```css
transition hover:bg-neutral-800           /* Button hover */
transition hover:text-neutral-950         /* Link hover */
```

---

## Responsive Breakpoints

Tailwind's default breakpoints (mobile-first):

| Prefix | Min Width | Pixels | Description |
|--------|-----------|--------|-------------|
| (none) | 0px | - | Mobile (default) |
| `sm:` | 640px | - | Small tablets |
| `md:` | 768px | - | Tablets |
| `lg:` | 1024px | - | Laptops |
| `xl:` | 1280px | - | Desktops |
| `2xl:` | 1536px | - | Large desktops |

### Common Responsive Patterns

**Grid Columns**
```css
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
```
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

**Text Sizing**
```css
text-5xl sm:text-6xl lg:text-7xl
```
Progressively larger on bigger screens

**Spacing**
```css
mt-24 sm:mt-32 lg:mt-40
px-6 lg:px-8
```
Increases with screen size

**Layout Changes**
```css
flex-col lg:flex-row          /* Stack on mobile, row on desktop */
hidden lg:block               /* Hide on mobile, show on desktop */
```

---

## Common Patterns

### Negative Space Trick (Stacked Inputs)
```css
-space-y-px    /* Removes gaps between children (-1px) */
```
Combined with:
```css
group-first:rounded-t-2xl    /* First child rounded top */
group-last:rounded-b-2xl     /* Last child rounded bottom */
```

Creates seamless stacked form inputs.

### Isolate Pattern
```css
isolate                  /* Creates new stacking context */
relative z-0             /* Base z-index */
focus-within:z-10        /* Lift focused item above siblings */
```

Prevents focus rings from being clipped by adjacent elements.

### Peer Pattern (Floating Labels)
```css
peer                                    /* Input element */
peer-focus:...                          /* Style when input focused */
peer-not-placeholder-shown:...          /* Style when input has value */
```

Enables CSS-only floating label animation.

### Outline Hidden
```css
outline-hidden    /* Removes default browser outline */
```
Use with custom `focus-visible:ring` for better accessibility.

### Before/After Pseudo-elements
```css
before:absolute before:bg-neutral-950 before:w-6 before:h-px
after:absolute after:bg-neutral-950/10 after:h-px
```

Creates the Border component's two-tone line effect.

---

## CSS Custom Properties

From `v1/src/styles/tailwind.css`:

```css
@theme {
  /* Text sizes with line heights */
  --text-base: 1rem;
  --text-base--line-height: 1.75rem;

  /* Border radius */
  --radius-4xl: 2.5rem;

  /* Font families */
  --font-sans: Mona Sans, ui-sans-serif, system-ui, sans-serif;
  --font-display: Mona Sans, ui-sans-serif, system-ui, sans-serif;

  /* Font variations */
  --font-display--font-variation-settings: 'wdth' 125;
}
```

---

## WhichMap-Specific Additions

For the WhichMap app, consider these additions to the design system:

### Success/Fastest State
```css
/* Add these to your color palette */
border-green-500
text-green-600
bg-green-500/10

/* Usage in ProviderCard */
before:!bg-green-500      /* Override border color */
after:!bg-green-500/10    /* Faded accent */
```

### Error States
```css
bg-red-50
text-red-800
border-red-300
```

### Loading States
```css
animate-pulse              /* Pulsing effect */
animate-spin              /* Spinner rotation */
opacity-50                /* Disabled state */
```

### Card Hover (Optional Enhancement)
```css
hover:shadow-lg transition-shadow
hover:scale-105 transition-transform
```

---

## Quick Copy-Paste Patterns

### Dark Background Section
```jsx
<section className="mt-24 rounded-4xl bg-neutral-950 py-20 sm:mt-32 sm:py-32">
  <Container>
    {/* Light text content */}
  </Container>
</section>
```

### Light Card
```jsx
<div className="rounded-2xl bg-white p-8 shadow-sm">
  {/* Card content */}
</div>
```

### Responsive Grid
```jsx
<div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
  {/* Grid items */}
</div>
```

### Stacked Form Inputs
```jsx
<div className="isolate -space-y-px rounded-2xl bg-white/50">
  <TextInput label="Field 1" />
  <TextInput label="Field 2" />
  <TextInput label="Field 3" />
</div>
```

### Two-Column Layout
```jsx
<div className="grid grid-cols-1 gap-x-8 gap-y-24 lg:grid-cols-2">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```
