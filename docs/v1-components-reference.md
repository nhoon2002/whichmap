# V1 Components Reference Guide

Complete reference of all components in the v1 template with code examples and usage.

## Table of Contents
- [Layout Components](#layout-components)
- [UI Components](#ui-components)
- [Form Components](#form-components)
- [List Components](#list-components)
- [Media Components](#media-components)
- [Content Components](#content-components)

---

## Layout Components

### Container
**File**: `v1/src/components/Container.jsx`

Responsive max-width wrapper for content.

```jsx
import { Container } from '@/components/Container'

<Container>
  {/* Content is automatically centered with max-width constraints */}
</Container>

<Container as="section" className="mt-24">
  {/* Can be rendered as any HTML element */}
</Container>
```

**Props**:
- `as` - HTML element to render (default: `div`)
- `className` - Additional classes
- `children` - Content

**Classes Applied**:
- `mx-auto max-w-7xl px-6 lg:px-8` - Outer container
- `mx-auto max-w-2xl lg:max-w-none` - Inner container

---

### RootLayout
**File**: `v1/src/components/RootLayout.jsx`

Full page layout with header and footer.

```jsx
import { RootLayout } from '@/components/RootLayout'

export default function Page() {
  return (
    <RootLayout>
      {/* Page content */}
    </RootLayout>
  )
}
```

**Features**:
- Header with navigation
- Footer with links and social media
- Responsive menu
- Consistent spacing

---

### PageIntro
**File**: `v1/src/components/PageIntro.jsx`

Page header section with eyebrow, title, and description.

```jsx
import { PageIntro } from '@/components/PageIntro'

<PageIntro eyebrow="Contact us" title="Let's work together">
  <p>We can't wait to hear from you.</p>
</PageIntro>
```

**Props**:
- `eyebrow` - Small text above title
- `title` - Main heading
- `children` - Description content
- `centered` - Center align (default: false)

---

### SectionIntro
**File**: `v1/src/components/SectionIntro.jsx`

Section heading with title and description.

```jsx
import { SectionIntro } from '@/components/SectionIntro'

<SectionIntro title="Our Process" className="mt-24">
  <p>We follow a proven methodology to deliver results.</p>
</SectionIntro>
```

**Props**:
- `title` - Section heading
- `eyebrow` - Optional small text above
- `children` - Description
- `smaller` - Smaller text size
- `invert` - Light text on dark background
- `className` - Additional classes

---

## UI Components

### Button
**File**: `v1/src/components/Button.jsx` (✅ Copied to main)

Versatile button/link component.

```jsx
import { Button } from '@/components/Button'

{/* As button */}
<Button type="submit">Submit</Button>

{/* As link */}
<Button href="/about">Learn More</Button>

{/* Inverted colors */}
<Button invert>Get Started</Button>
```

**Props**:
- `href` - Makes it a Link (optional)
- `invert` - Light background (default: dark)
- `className` - Additional classes
- All standard button/link props

**Styles**:
- Rounded full (`rounded-full`)
- Padding: `px-4 py-1.5`
- Font: `text-sm font-semibold`
- Smooth transition on hover

---

### Border
**File**: `v1/src/components/Border.jsx` (✅ Copied to main)

Decorative accent line component.

```jsx
import { Border } from '@/components/Border'

{/* Top border (default) */}
<Border>Content with top accent line</Border>

{/* Left border */}
<Border position="left" className="pl-8">
  Content with left accent line
</Border>

{/* Inverted colors */}
<Border invert position="top">
  Light border on dark background
</Border>
```

**Props**:
- `as` - Element type (default: `div`)
- `position` - `'top'` or `'left'` (default: `'top'`)
- `invert` - Light colors (default: dark)
- `className` - Additional classes

**Visual Pattern**:
- Short solid line (6px wide)
- Long faded line extending to edge
- Creates elegant accent effect

---

### FadeIn / FadeInStagger
**File**: `v1/src/components/FadeIn.jsx` (✅ Copied to main)

Scroll-triggered animation components using Framer Motion.

```jsx
import { FadeIn, FadeInStagger } from '@/components/FadeIn'

{/* Single element fade in */}
<FadeIn>
  <h2>This fades in when scrolled into view</h2>
</FadeIn>

{/* Multiple elements with stagger */}
<FadeInStagger>
  <FadeIn>Item 1</FadeIn>
  <FadeIn>Item 2</FadeIn>
  <FadeIn>Item 3</FadeIn>
</FadeInStagger>

{/* Faster stagger timing */}
<FadeInStagger faster>
  {items.map(item => <FadeIn key={item.id}>{item}</FadeIn>)}
</FadeInStagger>
```

**Props**:
- `FadeIn`: Accepts all motion.div props
- `FadeInStagger.faster`: Boolean for quicker stagger (0.12s vs 0.2s)

**Features**:
- Respects `prefers-reduced-motion`
- Triggers 200px before viewport
- Smooth 0.5s fade + upward motion
- Only animates once per element

---

## Form Components

### TextInput
**File**: `v1/src/app/contact/page.jsx:13-33`

Floating label text input with elegant focus states.

```jsx
import { TextInput } from '@/components/TextInput'

<div className="isolate -space-y-px rounded-2xl bg-white/50">
  <TextInput
    label="Starting Location"
    value={start}
    onChange={(e) => setStart(e.target.value)}
  />
  <TextInput
    label="Destination"
    value={end}
    onChange={(e) => setEnd(e.target.value)}
  />
</div>
```

**Props**:
- `label` - Floating label text
- All standard input props (type, value, onChange, etc.)

**Features**:
- Floating label animation
- Focus ring with subtle shadow
- Stacks seamlessly with `-space-y-px`
- Rounds first/last when in group
- Placeholder must be `" "` for CSS to work

**Styling Pattern**:
```
peer - Input element
peer-focus - Activated when input focused
peer-not-placeholder-shown - Activated when input has value
group-first:rounded-t-2xl - First in group gets top rounded
group-last:rounded-b-2xl - Last in group gets bottom rounded
```

---

### RadioInput
**File**: `v1/src/app/contact/page.jsx:35-46`

Custom-styled radio button.

```jsx
<RadioInput
  label="Option A"
  name="choice"
  value="a"
/>
```

**Props**:
- `label` - Radio label text
- Standard radio input props

**Visual**:
- Custom circular appearance
- Fill animation on check
- Focus ring for accessibility

---

## List Components

### GridList / GridListItem
**File**: `v1/src/components/GridList.jsx`

Responsive grid with fade-in animation and border accents.

```jsx
import { GridList, GridListItem } from '@/components/GridList'

<GridList>
  <GridListItem title="Feature 1">
    Description of the first feature
  </GridListItem>
  <GridListItem title="Feature 2">
    Description of the second feature
  </GridListItem>
  <GridListItem title="Feature 3" invert>
    This one uses light colors
  </GridListItem>
</GridList>

{/* Custom grid layout */}
<GridList className="lg:grid-cols-4">
  {/* Items */}
</GridList>
```

**Props**:
- `GridList.children` - GridListItem components
- `GridList.className` - Override grid classes
- `GridListItem.title` - Bold heading text
- `GridListItem.children` - Description
- `GridListItem.invert` - Light theme
- `GridListItem.className` - Additional classes

**Default Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`

**Perfect for**: Feature lists, benefits, service cards

---

### StatList / StatListItem
**File**: `v1/src/components/StatList.jsx`

Display metrics/statistics with large numbers.

```jsx
import { StatList, StatListItem } from '@/components/StatList'

<StatList>
  <StatListItem label="Google Maps" value="25 min" />
  <StatListItem label="Apple Maps" value="23 min" />
  <StatListItem label="Waze" value="27 min" />
</StatList>
```

**Props**:
- `StatList.children` - StatListItem components
- `StatListItem.label` - Small description text
- `StatListItem.value` - Large metric display

**Layout**:
- Mobile: Stacked (1 column)
- Tablet: 2 columns
- Desktop: Auto-flow horizontal columns

**Perfect for**: Metrics, KPIs, comparison data (like travel times!)

---

### List / ListItem
**File**: `v1/src/components/List.jsx`

Simple text list with optional icons.

```jsx
import { List, ListItem } from '@/components/List'

<List>
  <ListItem title="Step 1">Description of first step</ListItem>
  <ListItem title="Step 2">Description of second step</ListItem>
</List>
```

---

### TagList
**File**: `v1/src/components/TagList.jsx`

Horizontal list of tag chips.

```jsx
import { TagList, TagListItem } from '@/components/TagList'

<TagList>
  <TagListItem>JavaScript</TagListItem>
  <TagListItem>React</TagListItem>
  <TagListItem>Next.js</TagListItem>
</TagList>
```

**Visual**: Small rounded pills with light background

---

## Media Components

### GrayscaleTransitionImage
**File**: `v1/src/components/GrayscaleTransitionImage.jsx`

Image that transitions from grayscale to color on hover.

```jsx
import { GrayscaleTransitionImage } from '@/components/GrayscaleTransitionImage'
import image from '@/images/photo.jpg'

<GrayscaleTransitionImage src={image} alt="Description" />
```

**Features**:
- Grayscale filter by default
- Smooth transition to full color on hover/focus
- Accessibility-friendly (respects motion preferences)

---

### StylizedImage
**File**: `v1/src/components/StylizedImage.jsx`

Image with decorative background frame.

```jsx
import { StylizedImage } from '@/components/StylizedImage'

<StylizedImage src={laptop} alt="Laptop" />
```

**Visual**: Adds rounded background shape behind image

---

### GridPattern
**File**: `v1/src/components/GridPattern.jsx`

Decorative grid pattern background.

```jsx
import { GridPattern } from '@/components/GridPattern'

<div className="relative">
  <GridPattern />
  {/* Content appears over pattern */}
</div>
```

**Visual**: Subtle dot grid for visual interest

---

## Content Components

### Testimonial
**File**: `v1/src/components/Testimonial.jsx`

Quote card with author attribution.

```jsx
import { Testimonial } from '@/components/Testimonial'

<Testimonial author={{ name: "John Doe", role: "CEO, Company" }}>
  This product changed our business completely.
</Testimonial>
```

---

### Blockquote
**File**: `v1/src/components/Blockquote.jsx`

Styled quote block.

```jsx
import { Blockquote } from '@/components/Blockquote'

<Blockquote author={{ name: "Jane Smith" }}>
  Quote text here
</Blockquote>
```

---

### ContactSection
**File**: `v1/src/components/ContactSection.jsx`

CTA section with contact prompt.

```jsx
import { ContactSection } from '@/components/ContactSection'

<ContactSection />
```

Displays "Let's work together" message with contact button.

---

## Component Combinations for WhichMap

### Form Section Pattern
```jsx
<FadeIn>
  <form onSubmit={handleSubmit}>
    <div className="isolate -space-y-px rounded-2xl bg-white/50">
      <TextInput label="Starting Location" {...startProps} />
      <TextInput label="Destination" {...endProps} />
    </div>
    <Button type="submit" className="mt-10">
      Compare Routes
    </Button>
  </form>
</FadeIn>
```

### Results Section Pattern
```jsx
<FadeIn>
  <h2 className="font-display text-2xl font-semibold text-white">
    Results
  </h2>
</FadeIn>

<FadeInStagger className="mt-10">
  <StatList>
    <StatListItem label="Google Maps" value="25 min" />
    <StatListItem label="Apple Maps" value="23 min" />
    <StatListItem label="Waze" value="27 min" />
  </StatList>
</FadeInStagger>
```

### Alternative: Grid Cards Pattern
```jsx
<GridList>
  <GridListItem title="Google Maps">
    25 min • 15.2 mi
  </GridListItem>
  <GridListItem title="Apple Maps">
    23 min • 15.1 mi
  </GridListItem>
  <GridListItem title="Waze">
    27 min • 15.3 mi
  </GridListItem>
</GridList>
```

---

## File Paths Quick Reference

**Already in main/**:
- ✅ `src/components/Button.jsx`
- ✅ `src/components/Container.jsx`
- ✅ `src/components/FadeIn.jsx`
- ✅ `src/components/Border.jsx`

**Available to copy from v1/**:
- `v1/src/components/GridList.jsx`
- `v1/src/components/StatList.jsx`
- `v1/src/components/GridPattern.jsx`
- `v1/src/components/PageIntro.jsx`
- `v1/src/components/SectionIntro.jsx`
- `v1/src/components/List.jsx`
- `v1/src/components/TagList.jsx`

**Form components** (extract from contact page):
- TextInput: `v1/src/app/contact/page.jsx:13-33`
- RadioInput: `v1/src/app/contact/page.jsx:35-46`
