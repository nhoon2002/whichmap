# V1 Template Analysis

Comprehensive analysis of the TailwindCSS Pro Next.js template for WhichMap implementation.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Key Findings](#key-findings)

## Project Overview

**Template Name**: Studio (TailwindCSS Pro template)
**Framework**: Next.js 15 (App Router)
**Styling**: Tailwind CSS v4
**Animation**: Framer Motion
**Type**: Agency/Portfolio template

## Tech Stack

### Core Dependencies
- **Next.js**: ^15 (React 19)
- **Tailwind CSS**: ^4.1.12 (CSS-based configuration)
- **Framer Motion**: ^12.23.11 (animations)
- **clsx**: ^2.1.1 (conditional classnames)

### Development Tools
- ESLint + Prettier
- Prettier Tailwind plugin (class sorting)
- Sharp (image optimization)

### Template-Specific (Not needed for WhichMap)
- MDX support (@mdx-js/loader, @next/mdx)
- Shiki (code highlighting)
- Various rehype/remark plugins

## Architecture

### Directory Structure
```
v1/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.jsx    # Root layout
│   │   ├── page.jsx      # Home page
│   │   ├── about/        # About page
│   │   ├── blog/         # Blog section
│   │   ├── contact/      # Contact page
│   │   ├── process/      # Process page
│   │   └── work/         # Work/portfolio section
│   ├── components/       # 23 reusable components
│   ├── styles/           # CSS files
│   │   ├── tailwind.css  # Theme configuration
│   │   ├── base.css      # Font face
│   │   └── typography.css # Typography utilities
│   ├── fonts/            # Mona Sans variable font
│   ├── images/           # Static assets
│   └── lib/              # Utility functions (MDX loader)
├── jsconfig.json         # Path aliases (@/ → src/)
├── next.config.mjs       # Next.js config
├── postcss.config.js     # PostCSS (Tailwind)
└── package.json
```

### Component Organization

**Layout Components**
- `Container` - Max-width content wrapper
- `RootLayout` - Full page layout with header/footer
- `Footer` - Site footer
- `PageIntro` - Page header section
- `SectionIntro` - Section headings

**UI Components**
- `Button` - Primary/secondary buttons
- `Border` - Decorative accent lines
- `FadeIn` / `FadeInStagger` - Animation wrappers
- `GridList` / `GridListItem` - Responsive grid cards
- `StatList` / `StatListItem` - Metric displays
- `List` / `ListItem` - Text lists
- `TagList` - Tag chips

**Form Components** (in contact/page.jsx)
- `TextInput` - Floating label inputs
- `RadioInput` - Custom radio buttons

**Media Components**
- `GrayscaleTransitionImage` - Hover effect images
- `StylizedImage` - Image with decorative frame
- `GridPattern` - Background pattern

**Content Components**
- `Testimonial` - Quote cards
- `Blockquote` - Styled quotes
- `ContactSection` - CTA section
- `Offices` - Location cards
- `SocialMedia` - Social links
- `Logo` - Brand logo
- `PageLinks` - Navigation

## Key Findings

### Design System Characteristics

**Color Palette**
- Primary: Neutral scale (50-950)
- Background: `neutral-950` (very dark)
- Text: `white`, `neutral-300`, `neutral-600`
- Accents: Subtle borders with `neutral-950` and `neutral-950/10`
- No bright colors (professional, minimal aesthetic)

**Typography**
- Font: Mona Sans (variable font, 200-900 weight, 75%-125% width)
- Display font uses `font-variation-settings: 'wdth' 125` (wider)
- Scale: xs (0.75rem) → 7xl (4rem)
- Line heights optimized for readability

**Spacing & Layout**
- Max width: 7xl (80rem)
- Container padding: px-6 on mobile, px-8 on lg
- Vertical spacing: mt-24 (mobile) → mt-32 (tablet) → mt-40 (desktop)
- Rounded corners: rounded-2xl for cards, rounded-4xl (2.5rem) for large sections

**Animation Strategy**
- Scroll-triggered fade-in animations
- Stagger children for sequential reveals
- Respects `prefers-reduced-motion`
- Viewport trigger: `-200px` margin (animates before element visible)
- Duration: 0.5s for fade-in, 0.12-0.2s stagger delay

### Tailwind v4 CSS Configuration

The template uses Tailwind v4's new CSS-based configuration in `tailwind.css`:

```css
@theme {
  --text-xs: 0.75rem;
  --text-xs--line-height: 1rem;
  /* ... more text scales ... */

  --radius-4xl: 2.5rem;

  --font-sans: Mona Sans, ui-sans-serif, ...;
  --font-display: Mona Sans, ...;
  --font-display--font-variation-settings: 'wdth' 125;
}
```

### Responsive Design Patterns

**Breakpoints** (Tailwind defaults)
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1536px

**Common Patterns**
- Grid columns: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Text sizing: `text-base sm:text-lg lg:text-xl`
- Spacing: `mt-16 sm:mt-24 lg:mt-32`
- Layout: Mobile-first, stacks vertically by default

### Components Perfect for WhichMap

1. **Form Inputs** (`contact/page.jsx:13-33`)
   - Beautiful floating labels
   - Grouped with `-space-y-px`
   - Rounded top/bottom
   - **Use for**: Start/destination inputs

2. **StatList** (`StatList.jsx`)
   - Large metric display
   - Left border accent
   - Auto-flow columns
   - **Use for**: ETA display

3. **GridList** (`GridList.jsx`)
   - Responsive card grid
   - Fade-in animations
   - Border accents
   - **Use for**: Provider cards

4. **Button** (`Button.jsx`)
   - Rounded full design
   - Invert prop for themes
   - Works as Link or button
   - **Use for**: Compare action

5. **FadeIn/FadeInStagger** (`FadeIn.jsx`)
   - Smooth animations
   - Accessibility-aware
   - Easy to use
   - **Use for**: All content reveals

### Form Input Pattern (Reference)

The contact page demonstrates an excellent form pattern:

```jsx
<div className="isolate mt-6 -space-y-px rounded-2xl bg-white/50">
  <TextInput label="Name" name="name" autoComplete="name" />
  <TextInput label="Email" type="email" name="email" autoComplete="email" />
  <TextInput label="Company" name="company" autoComplete="organization" />
</div>
```

Key features:
- `-space-y-px` removes gaps between inputs
- `group-first:rounded-t-2xl` rounds top of first input
- `group-last:rounded-b-2xl` rounds bottom of last input
- `isolate` creates stacking context
- `bg-white/50` creates subtle container background

### Performance Patterns

**Image Optimization**
- Next.js Image component with `unoptimized` prop for SVGs
- Sharp for automatic optimization

**Code Splitting**
- `'use client'` directive only where needed (animations, interactivity)
- Server components by default

**Font Loading**
- Variable font (single file for all weights/widths)
- `font-display: block` to prevent FOUT

## Recommendations for WhichMap

### Components to Copy
✅ Already copied:
- Button
- Container
- FadeIn
- Border

📋 Consider copying later:
- StatList (better metric display than current ProviderCard)
- GridPattern (decorative background)
- PageIntro (if adding additional pages)

### Design Tokens to Use

**Colors**
- Background: `bg-neutral-950`
- Cards/forms: `bg-white` or `bg-white/50`
- Text primary: `text-neutral-950` (on light) or `text-white` (on dark)
- Text secondary: `text-neutral-600` or `text-neutral-300`
- Borders: `border-neutral-300` or `border-neutral-950/20`
- Fastest highlight: Add `green-500` for accent

**Spacing**
- Section spacing: `mt-24 sm:mt-32 lg:mt-40`
- Card gaps: `gap-10`
- Form field padding: `px-6 py-4`

**Typography**
- Headings: `font-display text-5xl sm:text-7xl`
- Body: `text-base`
- Labels: `text-sm text-neutral-500`
- Metrics: `text-3xl sm:text-4xl font-display font-semibold`

### Patterns to Avoid

- Complex MDX setup (not needed)
- Multi-page navigation (single page app)
- Blog/CMS features
- Image galleries
- Testimonials

### Next Implementation Steps

1. ✅ Basic structure is done
2. Consider switching ProviderCard to use StatList pattern
3. Add GridPattern background (optional aesthetic improvement)
4. Implement real API integration
5. Add error states beyond simple alert
6. Consider adding animation to loading spinner
