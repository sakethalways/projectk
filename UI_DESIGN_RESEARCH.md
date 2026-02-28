# GUIDO - UI Design & Consistency Research

**Date:** February 26, 2026  
**Brand:** GUIDO - Tour Guide Booking Platform  
**Status:** Pre-Implementation Research Only

---

## Executive Summary

This document establishes design consistency guidelines for GUIDO across all dashboards (Tourist, Guide, Admin), devices (Mobile, Tablet, Desktop), and user experiences. It covers: color systems, typography, component sizing, responsive breakpoints, spacing, animations, and accessibility standards based on industry best practices from platforms like Airbnb, Viator, Klook, and Booking.com.

**Key Focus Areas:**
- Three-user system consistency (Tourist ↔ Guide ↔ Admin)
- Mobile-first responsive design
- Brand color selection and psychology
- Component library standardization
- Interactive states and feedback systems

---

## Part 1: Brand Identity & Color Theory

### 1.1 GUIDO Brand Analysis

**Platform Purpose:** Connect travelers with authentic local guides
**User Base:** 
- Tourists (travelers seeking authentic experiences)
- Guides (local experts wanting to earn)
- Admins (platform moderators/managers)

**Brand Personality:** Adventure, Trust, Local Authenticity, Accessibility

### 1.2 Color Scheme Analysis

#### Option A: Electric Blue + Neon Yellow
**Psychology:**
- Electric Blue: Trust, technology, reliability, energy
- Neon Yellow: Optimism, energy, attention-grabbing
- Overall Feel: High-energy, modern, tech-forward

**Use Cases:**
- Tourist dashboard (exploration, discovery)
- Action buttons and CTAs
- Alerts and notifications
- Risk: Too energetic for premium positioning, may feel overwhelming

**Accessibility:** Yellow on white = poor contrast. Requires careful pairing.

**Recommended For:** Youth-focused market, adventure-heavy positioning

---

#### Option B: Emerald Green + Cream
**Psychology:**
- Emerald Green: Growth, nature, premium quality, calm belonging
- Cream: Warmth, approachability, natural, clean
- Overall Feel: Eco-conscious, premium yet accessible, trustworthy

**Use Cases:**
- Aligns with "sustainable local travel"
- Appeals to eco-conscious travelers
- Good for backgrounds and secondary elements
- Premium positioning without coldness

**Accessibility:** Excellent contrast ratio, easy to read

**Recommended For:** Wellness-conscious travelers, eco-tourism focus

---

#### Option C: Dark Mode + Magenta/Teal
**Psychology:**
- Dark Mode: Premium, modern, eye-comfort, sophisticated
- Magenta: Creativity, boldness, luxury
- Teal: Calm, balance, trust, innovation
- Overall Feel: Sleek, premium, forward-thinking

**Use Cases:**
- Guide/Admin dashboards (work environment)
- Booking confirmation screens
- Premium booking flows
- Evening usage/eyes comfort
- Asian market appeal (premium association)

**Accessibility:** OLED-friendly, reduces eye strain

**Recommended For:** Premium positioning, late-night bookings, admin work

---

### 1.3 Recommended Choice for GUIDO

**Primary Recommendation: Emerald Green + Cream with Dark Mode Variant**

**Reasoning:**
1. Differentiates from competitors (Airbnb=Red, Booking=Blue)
2. Aligns with local + sustainable + authentic brand message
3. Excellent accessibility across all devices
4. Works across tourist/guide/admin seamlessly
5. Enables premium positioning without losing approachability
6. Scalable to dark mode for late-night usage

**Color Specifications:**

```
PRIMARY PALETTE (Emerald + Cream)
├─ Primary Green: #10B981 (Emerald - main CTA, headers)
├─ Secondary Green: #34D399 (Light emerald - hover states)
├─ Dark Green: #047857 (Deep emerald - dark mode primary)
├─ Cream Background: #F9F7F4 (warm, natural)
├─ Text Dark: #1F2937 (charcoal, not pure black)
└─ Text Light: #F3F4F6 (light gray, not pure white)

ACCENT PALETTE
├─ Success: #059669 (shade of green)
├─ Warning: #D97706 (amber/warm)
├─ Error: #DC2626 (red, universal)
├─ Info: #0891B2 (teal, secondary action)
└─ Link: #0891B2 (teal for differentiation)

DARK MODE PALETTE
├─ Background: #0F172A (navy-black)
├─ Surface: #1E293B (card background)
├─ Text: #F1F5F9 (soft white)
├─ Primary: #6EE7B7 (bright emerald for dark mode)
├─ Accent Magenta: #EC4899 (premium accent)
└─ Accent Teal: #06B6D4 (balance accent)
```

---

## Part 2: Responsive Design Breakpoints

### 2.1 Device Classification (Industry Standard)

```
Mobile (xs):    0px - 374px   → iPhone SE, older phones
Mobile (sm):    375px - 639px → iPhone 12, 13, most phones  
Tablet (md):    640px - 1023px → iPad, medium tablets
Laptop (lg):    1024px - 1279px → MacBook Air, desktop
Desktop (xl):   1280px - 1535px → Large monitors
Desktop (2xl):  1536px+       → 4K monitors, TVs
```

**GUIDO Primary Targets:**
- Mobile: 375px - 639px (70% of traffic)
- Tablet: 640px - 1023px (15% of traffic)
- Desktop: 1024px+ (15% of traffic)

### 2.2 Mobile-First Development Strategy

**Start Design from 375px (iPhone 12) → Scale Up**

**Why Mobile-First:**
1. 70% of travel planning happens on mobile
2. Challenges of responsive design solved early
3. Better performance on low-end devices
4. Touch-friendly by default

**Viewport Meta Tag:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=no">
```

---

## Part 3: Typography System

### 3.1 Font Stack (Industry Standard)

**Recommended Font Sistema:**
- **Headlines:** Inter Bold (geometric, modern, high legibility)
- **Body:** Inter Regular (proven on small screens)
- **Monospace:** JetBrains Mono (code, technical info)

**Why Inter:**
- Designed for screens (high x-height)
- Free on Google Fonts
- Excellent legibility at small sizes
- Used by: Stripe, Figma, Linear, Vercel

### 3.2 Type Scale (Consistent Sizing)

```
Mobile Sizes:
├─ H1 (Page Title): 28px / 32px
├─ H2 (Section): 24px / 28px
├─ H3 (Subsection): 20px / 24px
├─ H4 (Card Title): 18px / 22px
├─ Body Large: 16px / 24px (Primary text)
├─ Body Normal: 14px / 20px (Regular content)
├─ Body Small: 12px / 16px (Captions, metadata)
├─ Label: 12px / 14px (Form labels, tags)
├─ Caption: 11px / 14px (Small helper text)
└─ Overline: 10px / 12px (All-caps metadata)

Desktop Sizes (1024px+):
├─ H1: 48px / 56px
├─ H2: 36px / 44px
├─ H3: 28px / 32px
├─ H4: 24px / 28px
├─ Body Large: 18px / 28px
├─ Body Normal: 16px / 24px
├─ Body Small: 14px / 20px
└─ Label: 12px / 16px
```

**Line Height Principle:**
- Headlines: 1.2 (tight spacing)
- Body: 1.5 (breathing room)
- Small text: 1.4 (scannable)

### 3.3 Font Weight Consistency

```
Weight 400: Regular text (body copy)
Weight 500: Medium (emphasis, nav items)
Weight 600: Semibold (card titles, labels)
Weight 700: Bold (main headlines)
Weight 800: Extra Bold (hero headlines only - rare)
```

**Usage Rule:** Never skip weight levels. Don't go 400→700, go 400→500→600→700

---

## Part 4: Spacing System (8px Grid)

### 4.1 Base Unit Grid

**All spacing must be multiples of 8px:**

```
8px   = xs  (tight spacing, mobile elements)
16px  = sm  (default padding, card spacing)
24px  = md  (section spacing)
32px  = lg  (large section gaps)
40px  = xl  (between major sections)
48px  = 2xl (page-level spacing)
64px  = 3xl (hero spacing)
80px  = 4xl (maximum spacing
```

**Why 8px Grid:**
- Natural for 1x and 2x pixel densities
- Scales linearly across devices
- Easier to code (margin: 16px)
- Creates visual harmony

### 4.2 Mobile Spacing Hierarchy

```
Mobile (375px):
├─ Page padding: 16px (both sides)
├─ Section margin: 24px (between sections)
├─ Card padding: 16px (inside cards)
├─ Element gap: 8px (items in list)
├─ Button height: 44px (min for touch)
└─ Input height: 44px (min for touch)

Desktop (1024px+):
├─ Page padding: 32px
├─ Section margin: 48px
├─ Card padding: 24px
├─ Element gap: 12px
├─ Button height: 40px (can be smaller)
└─ Input height: 40px (can be smaller)
```

---

## Part 5: Component Sizing Guide

### 5.1 Touch-Friendly Minimums (Mobile)

```
Button:       44px × 44px (tap target - Apple HIG)
Input Field:  44px height, 16px internal padding
Icon Button:  44px × 44px
Card:         Full width - 16px padding
Tabs:         44px height, tap-friendly spacing
Checkbox:     24px × 24px (larger than text)
Radio:        24px × 24px
Toggle:       44px width, 24px height
```

**Why 44px?**
- Apple Human Interface Guidelines standard
- Accessible for elderly users (larger fingers)
- Prevents mis-taps
- Looks intentional, not cramped

### 5.2 Desktop Component Sizing

```
Button:       40px × auto (padding 12px 24px)
Input Field:  40px height
Icon Button:  32px × 32px
Card:         Max 400px (in layouts)
- Sidebar:     280px width
- Main column: 640px width
- Sidebar (2): 280px width
Tabs:         32px height
```

### 5.3 Component Density Comparison

```
MOBILE LAYOUT (375px):
┌─────────────────────────────┐
│ Guide Card                  │  ← Full width, 16px padding
├─────────────────────────────┤
│ [  Profile Image  ]         │  ← 280px width
│                             │
│ Guide Name                  │
│ Location, Rating (⭐4.8)    │
│ Price: ₹2000/day           │
│                             │
│ [BOOK NOW] (44px height)    │  ← Full-width button
└─────────────────────────────┘

DESKTOP LAYOUT (1280px):
┌──────────────────────────────────────────────────────┐
│ Guide Card  │ Guide Card  │ Guide Card               │
│ (310px)     │ (310px)     │ (310px)                  │
│ 16px gap    │ 16px gap    │                          │
├──────────────────────────────────────────────────────┤
│ [BOOK]      │ [BOOK]      │ [BOOK]                   │
│ 40px height │ 40px height │ 40px height             │
└──────────────────────────────────────────────────────┘
```

---

## Part 6: Mobile vs Desktop Presentation

### 6.1 Navigation Pattern

**Mobile (375px):**
```
Top: Header [≡ Menu] [🔔 Bell] [👤 Profile]
Bottom: Bottom Navigation Bar (5 icons max)
  └─ Explore | Bookings | Saved | Messages | Profile

Layout: Single column, vertical scrolling
```

**Tablet (640px - 1023px):**
```
Top: Header [Full Menu]
Sidebar (collapsed): [Icon representations]
Main Content: 2-column layout max
```

**Desktop (1024px+):**
```
Top: Header [Menu Items] [Search] [Icons]
Sidebar (240px): Full text navigation
Main Content: 3-column grid layout possible
```

### 6.2 Search Experience

**Mobile:**
```
+————————————————————+
| [Search] [Filter] |
|                   |
| Results (vertical)|
| stacked cards     |
+————————————————————+
```

**Desktop:**
```
+———————————————+ +——————+ +——————+
| [Search Bar] | [Filter| [Sort  |
+———————————————+ +——————+ +——————+
| Card Grid (3 across)          |
| Card Grid (3 across) - 240px  |
| Card Grid (3 across) gap 16px |
+———————————————————————————————————+
```

### 6.3 Modal/Dialog Sizes

**Mobile:**
- Full-width minus 16px padding each side = 343px
- Max height: 90vh (screen height)
- Bottom sheet preferred for some interactions

**Tablet:**
- 500px width
- Centered with padding

**Desktop:**
- 600px - 800px width (depending on content)
- Centered on screen

---

## Part 7: GUIDO's Three Dashboards - Consistency Framework

### 7.1 Tourist Dashboard

**Purpose:** Browse guides, book tours, manage bookings, leave reviews  
**Primary Color Usage:** Emerald green for CTAs (Book Now, Confirm)  
**Layout:** Content-first (guides at top)  
**Emotion:** Discovery, excitement, easy-to-understand

**Key Sections:**
```
1. Header + Navigation
2. Search/Filter Bar
3. Guide Cards Grid (responsive)
4. My Bookings
5. Saved Guides
6. Profile/Reviews
```

**Consistency Standards:**
- Guide card size: Mobile 100%, Desktop 3-column grid
- Button primary: Emerald green (#10B981)
- Hover state: Light green (#34D399)
- Card padding: 16px mobile, 24px desktop
- Border radius: 12px all cards

---

### 7.2 Guide Dashboard

**Purpose:** Manage bookings, view earnings, set availability, respond to requests  
**Primary Color Usage:** Emerald for acceptance actions, Orange for rejection  
**Layout:** Data-first (dashboard metrics at top)  
**Emotion:** Control, clarity, professionalism

**Key Sections:**
```
1. Header + Navigation
2. Key Metrics (Earnings, Trips, Rating)
3. Booking Requests (urgent first)
4. Confirmed Bookings
5. Past Trips
6. Availability Settings
7. Financial Dashboard
```

**Consistency Standards:**
- Metric cards: 4-column on desktop, 2-column mobile
- Action buttons: 44px mobile, 40px desktop (consistent heights)
- Status badges: Success=Green, Pending=Yellow, Rejected=Red
- Data table: Horizontal scroll on mobile, full view on desktop
- Icons: 20px mobile labels, 24px desktop

---

### 7.3 Admin Dashboard

**Purpose:** Monitor platform, approve guides, resolve issues, view analytics  
**Primary Color Usage:** Dark background, Emerald accents, Red for warnings  
**Layout:** Data-heavy (charts, tables, metrics)  
**Emotion:** Authority, control, clarity

**Key Sections:**
```
1. Header + Navigation
2. Key Analytics (User count, Revenue, Tours)
3. Pending Guide Approvals
4. Active Bookings
5. User Management
6. Reports & Analytics
7. System Settings
```

**Consistency Standards:**
- Layout: Side navigation (240px desktop, collapsed mobile)
- Charts: Responsive, stack on mobile
- Tables: Scrollable on mobile, full on desktop
- Status colors: Consistent across all dashboards
- Admin-only color: Dark mode primary (#0F172A background)

---

## Part 8: Consistency Across All Three Dashboards

### 8.1 Unified Component Library

**Every component must exist in 3 variants:**

```
Button Component:
├─ Tourist Dashboard Variant (Emerald, lighter)
├─ Guide Dashboard Variant (Emerald, medium)
└─ Admin Dashboard Variant (Dark mode, brighter green accent)

Card Component:
├─ Tourist: Light background, high contrast images
├─ Guide: Data-focused, metric emphasis
└─ Admin: Minimal, text-heavy

Navigation Component:
├─ Tourist: Bottom tabs + top header (mobile)
├─ Guide: Side + top nav (can be collapsed)
└─ Admin: Full side nav + top (left-aligned always)
```

### 8.2 Shared Design Tokens

```
All Dashboards Share:
├─ Typography: Inter (same font family)
├─ Spacing: 8px grid (same grid)
├─ Border Radius: 12px default
├─ Box Shadow: Same elevation system
├─ Colors: Same palette base
├─ Breakpoints: Same responsive grid
├─ Touch targets: 44px minimum mobile
└─ State indicators: Same hover/active/disabled patterns
```

### 8.3 Differentiation (Dashboard-Specific)

```
Tourist Dashboard:
├─ Visual: Bright, exploration-focused
├─ Layout: Card-heavy, image-first
├─ CTA Color: Emerald (#10B981)
└─ Tone: Friendly, adventure-oriented

Guide Dashboard:
├─ Visual: Professional, data-focused
├─ Layout: Table-heavy, metric-focused
├─ CTA Color: Emerald (#047857 - darker for seriousness)
└─ Tone: Professional, action-oriented

Admin Dashboard:
├─ Visual: Minimal, information-dense
├─ Layout: Chart-heavy, text-based
├─ CTA Color: Teal (#06B6D4 - technical, precise)
└─ Tone: Authoritative, analytical
```

---

## Part 9: Interactive States & Consistency

### 9.1 Button States (All Dashboards)

```
DEFAULT STATE:
├─ Background: #10B981 (Emerald)
├─ Text: White
├─ Font: 500, 16px
├─ Height: 44px mobile, 40px desktop
└─ Padding: 12px 24px

HOVER STATE:
├─ Background: #34D399 (Light emerald)
├─ Text: White
├─ Transition: 150ms ease-in-out
└─ Cursor: pointer

ACTIVE STATE:
├─ Background: #047857 (Dark emerald)
├─ Text: White
└─ Scale: 0.98 (subtle press effect)

DISABLED STATE:
├─ Background: #D1D5DB (Gray)
├─ Text: #9CA3AF (Lighter gray)
├─ Opacity: 0.6
└─ Cursor: not-allowed

LOADING STATE:
├─ Background: #10B981
├─ Spinner: White
├─ Animation: 3s infinite rotation
└─ Text: Hidden (replaced with spinner)
```

### 9.2 Form Input States

```
DEFAULT:
├─ Border: 1px #D1D5DB (light gray)
├─ Background: White
├─ Height: 44px mobile
├─ Padding: 12px 16px
└─ Font: 16px (prevent iOS zoom)

FOCUS:
├─ Border: 2px #10B981 (emerald)
├─ Background: #F9F7F4 (cream, very light)
├─ Box Shadow: 0 0 0 3px rgba(16, 185, 129, 0.1)
└─ Transition: 100ms

FILLED (has value):
├─ Border: 1px #10B981 (emerald)
├─ Background: White
└─ Label: Moved up, smaller

ERROR:
├─ Border: 2px #DC2626 (red)
├─ Background: #FEE2E2 (light red)
├─ Error text: 12px red, below input
└─ Icon: ⚠️ red

SUCCESS:
├─ Border: 1px #059669 (dark green)
├─ Background: White
├─ Checkmark icon: Green
└─ Success text: Optional feedback

DISABLED:
├─ Background: #F3F4F6 (light gray)
├─ Text: #9CA3AF (gray)
├─ Border: 1px #E5E7EB (lighter gray)
└─ Cursor: not-allowed
```

### 9.3 Card States

```
DEFAULT:
├─ Background: White
├─ Border: 1px #E5E7EB (light gray)
├─ Border Radius: 12px
├─ Padding: 16px mobile, 24px desktop
├─ Box Shadow: 0 1px 3px rgba(0,0,0,0.1)
└─ Transition: all 150ms

HOVER (if interactive):
├─ Border: 1px #10B981 (emerald)
├─ Box Shadow: 0 4px 12px rgba(16, 185, 129, 0.15)
├─ Transform: translateY(-2px) (slight lift)
└─ Cursor: pointer

SELECTED:
├─ Border: 2px #10B981 (emerald)
├─ Background: #F0FFFE (very light emerald tint)
├─ Box Shadow: 0 4px 12px rgba(16, 185, 129, 0.2)
└─ Checkmark indicator: Top-right corner

DISABLED:
├─ Opacity: 0.5
├─ Cursor: not-allowed
└─ Border: 1px #D1D5DB (gray)
```

---

## Part 10: Animation & Motion Principles

### 10.1 Animation Duration Standards

```
Micro interactions:   100ms (button feedback)
Transitions:          150ms (color change)
Navigation:           300ms (page slide)
Modal entrance:       350ms (scale + fade)
Loading states:       2000ms-3000ms (loop)
Scroll animations:    Instant (desktop), 200ms (mobile)
```

**Easing Functions:**
```
Quick feedback:    ease-in-out (150ms)
Page navigation:   cubic-bezier(0.33, 0.66, 0.66, 1) - smooth
Scale transforms:  cubic-bezier(0.25, 0.46, 0.45, 0.94)
Loading spinner:   linear
Fade in/out:       ease-in-out
```

### 10.2 Interaction Animations (Consistency)

**Button Click:**
- Scale: 1.0 → 0.98 → 1.0 (100ms)
- Fade: Optional loader (100ms fade in)

**Card Hover (Desktop):**
- Translate Y: 0 → -2px (150ms)
- Shadow increase: subtle (150ms)

**Page Transition:**
- Fade: Outgoing -100% opacity (300ms)
- Slide: Incoming translateX +100% (300ms)

**Modal Entrance:**
- Background: Fade 0 → 0.5 opacity (350ms)
- Modal: Scale 0.9 → 1.0, Fade 0 → 1 (350ms)

### 10.3 No Animation Rules (Consistency)

```
❌ Animations to AVOID:
├─ Flashing/rapid blink (accessibility issue)
├─ Auto-rotate carousels on mobile (confusing)
├─ Animations >500ms without purpose
├─ Motion without user interaction
├─ Animations on form inputs (confusing focus)
└─ Cascading animations (add visual noise)

✅ Keep animations:
├─ Purpose-driven (indicate state change)
├─ Fast (<300ms for micro interactions)
├─ Consistent timing across app
├─ Respect prefers-reduced-motion setting
└─ Improve UX, not distract
```

---

## Part 11: Accessibility & Consistency

### 11.1 Color Contrast Requirements

```
WCAG AA Standard (minimum):
├─ Large text (18px+):      3:1 ratio
├─ Normal text & UI:        4.5:1 ratio
├─ Graphics & components:   3:1 ratio

WCAG AAA Standard (recommended):
├─ Large text:              4.5:1 ratio
├─ Normal text & UI:        7:1 ratio
└─ Graphics:                4.5:1 ratio

GUIDO Targets:
├─ All text:                Minimum 4.5:1
├─ Status colors:           Check against text & background
├─ Icon strokes:            Minimum 3:1 ratio
└─ Off-brand colors:        Never used without testing
```

**Testing Tool:** WebAIM Contrast Checker

### 11.2 Touch Target Sizing

```
Minimum 44px × 44px (Apple HIG standard)

All interactive elements:
├─ Buttons:        44px × 44px minimum
├─ Links:          No minimum, but preferably in touch-friendly context
├─ Form controls:  44px × 44px minimum
├─ Tab targets:    44px height minimum
├─ Checkboxes:     24px × 24px minimum (enlarged from 16px)
└─ Spacing between: 8px minimum between touch targets
```

### 11.3 Accessibility Best Practices (Consistency)

```
All Dashboards Must Have:
├─ Proper heading hierarchy (H1→H2→H3, never skip)
├─ Alt text on all images (descriptive, not generic)
├─ ARIA labels on icon-only buttons
├─ Keyboard navigation (tab, enter, escape)
├─ Focus indicators (visible outline, not hidden)
├─ Color not as only differentiator
├─ Form labels associated with inputs
├─ Loading states announced to screen readers
└─ Error messages clear and associated with fields
```

---

## Part 12: Mobile-Specific Considerations

### 12.1 Mobile Input Best Practices

```
Text Inputs:
├─ Font size: 16px minimum (prevents iOS auto-zoom)
├─ Padding: 12px 16px (spacious touch target)
├─ Height: 44px minimum
├─ Type attribute: Correct (email, tel, date, etc.)
└─ Autocomplete attribute: Enabled where possible

Select Dropdowns:
├─ Native <select> on mobile preferred
├─ Custom dropdowns: 44px minimum height
├─ Options: Large, easy to tap
└─ No nested dropdowns (hard to navigate)

Date Pickers:
├─ Use native date picker on mobile
├─ Custom picker: Large numbers, wide spacing
├─ Avoid: Small sliders, spinners
└─ Clear format: DD/MM/YYYY

Keyboards:
├─ Email field: type="email" (shows @ key)
├─ Phone field: type="tel" (shows number pad)
├─ Number field: type="number" (spinners or numeric pad)
└─ URL field: type="url" (shows .com key)
```

### 12.2 Mobile Navigation Pattern (GUIDO Specific)

**Current Structure - INCONSISTENCY ISSUE:**
```
Tourist Dashboard: Top header (inconsistent with admin)
Guide Dashboard: Top + side nav (confusing on mobile)
Admin Dashboard: Side nav only (collapsed on mobile)

PROPOSED CONSISTENCY:
All dashboards mobile:
├─ Top header: Logo + burger menu + notification bell
├─ Main content: Full width
└─ Bottom nav bar: 5 core sections (consistent routing)

All dashboards desktop:
├─ Side nav: 240px (consistent width)
├─ Header: Matches mobile header style
└─ Main content: Responsive grid
```

### 12.3 Mobile Performance Considerations

```
Load Time Targets:
├─ First Contentful Paint: <1.5s
├─ Largest Contentful Paint: <2.5s
├─ Cumulative Layout Shift: <0.1
└─ Time to Interactive: <3.5s

Image Optimization:
├─ Guide avatars: 80px @2x (use srcset)
├─ Guide cover images: 375px width mobile, 600px desktop
├─ Thumbnail previews: 120px max
├─ Format: WebP with JPEG fallback
└─ Lazy load: True for images >viewport

Code Splitting:
├─ Dashboard routes: Separate bundles
├─ Modal components: Lazy load
├─ Heavy libraries: Only on needed pages
└─ Bundle target: <180KB main, <50KB per route
```

---

## Part 13: Desktop/Laptop Optimization

### 13.1 Wide Screen Layout (1280px+)

```
OPTIMAL LAYOUT:
┌────────────────────────────────────────┐
│ HEADER (fixed/sticky)                  │
├────┬─────────────────────────────────┤
│    │                                 │
│ S  │  Main Content Area              │ ← 960px max width
│ I  │  (3-column grid, 300px each)    │   (comfortable reading)
│ D  │                                 │
│ E  │  Guide Cards / Data Tables      │
│ B  │                                 │
│ A  │  Pagination / Load More         │
│ R  │                                 │
└────┴─────────────────────────────────┘
 240px
```

**Content Width Rules:**
- Max width for reading: 960px
- Never make text wider than 960px (eye travel distance)
- Use whitespace generously on sides

### 13.2 Multi-Column Grids (Desktop)

**Tourist Dashboard - Guides:**
```
Desktop (1920px, after side nav):
3 cards × (300px width + 16px gap) = 932px
Then side padding: 32px each side
= 996px total, easily fits in 1280px screen
Result: 3-column grid, comfortable spacing

Desktop (1280px):
Still 3 columns: (1280-240nav-64padding) / 3 ≈ 325px each
Result: Slightly larger cards, still comfortable
```

**Guide Dashboard - Bookings:**
```
Data table preferred on desktop
Columns: Status | Tourist Name | Date | Amount | Action
Let each column breathe: min 120px width
Horizontal scroll available if >1000px of content
```

**Admin Dashboard - Analytics:**
```
2-3 cards per row
Charts: Full width but max 600px (readability)
Tables: Scrollable to right on smaller laptops
Sidebar: Always visible (not collapsing until 768px)
```

### 13.3 Sidebar Navigation Details

```
Desktop Sidebar (240px):
├─ Header: Logo (32×32px) + Text (GUIDO)
├─ User Profile: Avatar (40px) + Name
├─ Main Navigation: 
│  └─ Dark background, hover state lighter
├─ Nav Item Height: 44px
├─ Font: 14px Regular
└─ Icon + Label format

Collapsed State (Tablet):
├─ Width: 64px
├─ Icons only (20×20px)
├─ Tooltips on hover
└─ Toggle button: Top-right

Mobile:
├─ Hidden by default
├─ Slide in from left (360px max)
├─ Full viewport height
├─ Dark overlay behind
└─ Close button: X or black overlay
```

---

## Part 14: Form & Input Consistency

### 14.1 Form Layout Standards

**Mobile Form:**
```
┌─────────────────┐
│ Form Title      │
├─────────────────┤
│ [Field Label]   │
│ [Input Field]   │ ← 44px height
│ Helper Text     │ ← 12px gray
│                 │
│ [Field Label]   │
│ [Input Field]   │ ← 44px height
│ Error msg       │ ← 12px red (if error)
│                 │
│ [Submit Button] │ ← Full width, 44px
│                 │
│ [Cancel Link]   │ ← Centered, optional
└─────────────────┘
```

**Desktop Form:**
```
Form Title

[Field Label]        [Field Label]
[Input Field]        [Input Field]
Helper Text          Helper Text

[Field Label]
[Text Area]
Helper Text (small italic)

[Submit Button] [Cancel Button]
```

**Spacing Rules:**
```
Mobile:
├─ Between fields: 24px
├─ Label to input: 8px
├─ Input to helper: 4px
├─ Form to buttons: 32px
└─ Field padding: 16px sides, 12px vertical

Desktop:
├─ Between fields: 32px
├─ Label to input: 8px
├─ Input to helper: 4px
├─ Form to buttons: 40px
└─ Field padding: 16px sides, 12px vertical
```

### 14.2 Validation & Error States (Consistency)

```
BEFORE SUBMISSION:
└─ No red borders (don't shame user pre-submit)

ON SUBMIT (if errors):
├─ Red border: 2px #DC2626
├─ Error text: 12px red, below input
├─ Error icon: ⚠️ small, inside field right
├─ Field focus: Auto-focus first error
└─ Error summary: Optional top of form

AFTER CORRECTION:
├─ Border: Back to normal (1px gray)
├─ Green checkmark: Optional, in field right
├─ Error text: Disappears/fades
└─ Helper text: Reappears

SUCCESS SUBMISSION:
├─ Toast: "Booking created successfully"
├─ Navigation: Redirect to confirmation
└─ Animation: Fade out form, fade in success page
```

---

## Part 15: Status & Badge Consistency

### 15.1 Unified Status Colors

```
Booking Status (All Dashboards):
├─ Pending:    Yellow/Amber (#F59E0B)
│  Used for: Awaiting guide response, pending payment
│  
├─ Accepted/Confirmed: Green (#10B981)
│  Used for: Guide accepted, payment confirmed
│  
├─ Rejected:   Red (#DC2626)
│  Used for: Guide rejected, booking failed
│  
├─ Cancelled:  Gray (#6B7280)
│  Used for: Tourist cancelled, expired
│  
└─ Completed:  Teal (#0891B2)
   Used for: Tour finished, review available

Guide Status (Admin only):
├─ Pending:    Yellow (#F59E0B) - awaiting approval
├─ Approved:   Green (#10B981) - active
├─ Rejected:   Red (#DC2626) - not approved
└─ Inactive:   Gray (#6B7280) - deactivated by guide

User Status (Admin only):
├─ Active:     Green (#10B981)
├─ Inactive:   Gray (#6B7280)
└─ Suspended:  Red (#DC2626)
```

### 15.2 Badge Styling (Consistency)

```
BADGE SPECIFICATIONS:
Background:  Lighter shade of color
Text:        Darker shade of color
Border:      Optional, matches text
Height:      24px (for readability)
Padding:     4px 8px
Border Radius: 6px
Font Size:   12px, weight 500

EXAMPLE - Green Badge:
├─ Background: #D1FAE5 (light green)
├─ Text: #047857 (dark green)
├─ Border: 1px #A7F3D0 (medium green)
└─ Usage: "Approved", "Completed"

EXAMPLE - Yellow Badge:
├─ Background: #FEF3C7 (light yellow)
├─ Text: #92400E (dark brown)
├─ Border: 1px #FCD34D (medium yellow)
└─ Usage: "Pending", "Awaiting"
```

---

## Part 16: Notification & Alert Styling

### 16.1 Toast Notifications (Consistent)

```
SUCCESS TOAST:
├─ Background: #DBEAFE (light blue)
├─ Border left: 4px #3B82F6 (blue)
├─ Icon: ✓ green (20px)
├─ Title: 14px, weight 600, dark text
├─ Message: 13px, weight 400, gray text
├─ Duration: 4 seconds auto-dismiss
├─ Position: Top-center or bottom-right
└─ Animation: Slide in from top (200ms)

ERROR TOAST:
├─ Background: #FEE2E2 (light red)
├─ Border left: 4px #DC2626 (red)
├─ Icon: ✕ red (20px)
├─ Title: "Error" or specific error
├─ Message: Specific error message
├─ Duration: 6 seconds (longer, more important)
├─ Position: Top-center
├─ Close button: X icon (explicit action)
└─ Animation: Slide in from top (200ms)

INFO TOAST:
├─ Background: #E0F2FE (light cyan)
├─ Border left: 4px #0891B2 (teal)
├─ Icon: ℹ️ teal (20px)
├─ Message: Informational only
├─ Duration: 3 seconds
└─ Position: Top-center
```

### 16.2 In-Page Alerts

```
ALERT BOX (Within Page):
├─ Background: Light color matching alert type
├─ Border: 1px matching color
├─ Padding: 16px
├─ Border Radius: 8px
├─ Icon: Left side (20px)
├─ Text: Descriptive message
├─ Close button: Optional X
└─ Example: "⚠️ Your booking expires in 2 hours"

SUCCESS ALERT:
├─ Background: #ECFDF5 (light green)
├─ Border: 1px #10B981 (green)
├─ Icon: ✓ green
└─ Text: #047857 (dark green)

WARNING ALERT:
├─ Background: #FFFBEB (light amber)
├─ Border: 1px #F59E0B (amber)
├─ Icon: ⚠️ amber
└─ Text: #92400E (dark brown)

ERROR ALERT:
├─ Background: #FEF2F2 (light red)
├─ Border: 1px #DC2626 (red)
├─ Icon: ✕ red
└─ Text: #991B1B (dark red)

INFO ALERT:
├─ Background: #EFF6FF (light blue)
├─ Border: 1px #3B82F6 (blue)
├─ Icon: ℹ️ blue
└─ Text: #1E40AF (dark blue)
```

---

## Part 17: Rating & Review Display (Consistency)

### 17.1 Star Rating Display

```
MOBILE GUIDE CARD:
┌──────────────────────┐
│ [Avatar] (80px)      │
│                      │
│ Guide Name           │ ← 16px, weight 600
│ Location             │ ← 12px gray
│ ⭐ 4.8 (23 reviews) │ ← Stars in green, text 12px
│ ₹2,000/day          │ ← 14px weight 600
│                      │
│ [BOOK NOW] 44px      │
└──────────────────────┘

DESKTOP GUIDE CARD (3 per row):
Same layout, proportionally larger
Star rating: 14px
Price: 16px

RATING DETAIL PAGE:
Review Card:
├─ Avatar: 40px
├─ Name + Date: 14px, weight 500
├─ Rating stars: 14px, non-interactive
├─ Review text: 14px, line-height 1.5
└─ Helpful buttons: Optional (helpful? no thanks)

ADMIN RATING TABLE:
├─ Tourist name: 14px
├─ Star rating: 14px (numeric + stars)
├─ Review text: Truncated to 150 chars
├─ Date: 12px gray
└─ Delete action: Icon button
```

---

## Part 18: Data Table Consistency

### 18.1 Table Layout Standards

**Mobile Tables (Stacked Cards):**
```
Instead of horizontal scroll, show as cards:

╔════════════════════╗
║ BOOKING #12345     │ ← Header row
╠════════════════════╣
║ Tourist: John      │ ← Label: Value
║ Date: Feb 28       │
║ Status: Pending    │ ← Colored badge
║ Amount: ₹2,000     │
║                    │
║ [View] [Action]    │ ← Buttons
╚════════════════════╝
```

**Desktop Tables:**
```
BOOKING ID │ TOURIST    │ DATE      │ STATUS   │ AMOUNT  │ ACTION
────────────────────────────────────────────────────────────────
#12345     │ John Doe   │ Feb 28    │ Pending  │ ₹2,000  │ [···]
#12344     │ Jane Smith │ Feb 27    │ Approved │ ₹1,500  │ [···]

Row height: 44px (clickable, hover state)
Column padding: 12px horizontal
Border between rows: 1px #E5E7EB
Hover background: #F9F7F4 (cream tint)
```

### 18.2 Table Columns Standards

```
GUIDE BOOKINGS TABLE (Guide Dashboard):
├─ Booking ID: 100px (searchable)
├─ Tourist: 150px (shows name + avatar)
├─ Date: 100px (sortable)
├─ Status: 100px (badge)
├─ Amount: 100px (right-aligned)
└─ Actions: 60px (buttons menu)

ADMIN BOOKINGS TABLE (Admin Dashboard):
├─ Booking ID: 80px
├─ Guide: 120px (name)
├─ Tourist: 120px (name)
├─ Date: 100px
├─ Status: 100px
├─ Amount: 100px
└─ Actions: 80px
```

---

## Part 19: Loading & Skeleton States

### 19.1 Skeleton Loading Pattern

```
GUIDE CARD SKELETON (Mobile):
┌──────────────────┐
│ [████████████]   │ ← Shimmer effect
│ [████████████]   │ ← Animated gradient
│ [████████]       │
│ [████████████]   │
│ [██████████]     │
│                  │
│ [██████ BOOK ··]  │ ← Full width button
└──────────────────┘

Animation: 1.5s continuous loop
Direction: Left to right gradient
Easing: ease-in-out
Color: #E5E7EB with gradient highlight
```

**Rules:**
- Show skeleton for critical content
- Duration: ~1.5 seconds before feels slow
- Use actual layout (not fake boxes)
- Color: Consistent gray (#E5E7EB)
- Animation: Subtle gradient shimmer

### 19.2 Loading States

```
BUTTON LOADING:
[BOOKING...] with spinner, text hidden

PAGE LOADING:
Centered spinner, "Loading..." text below
Spinner: 32px diameter
Animation: 2s full rotation, repeat infinite
Color: Emerald green (#10B981)

FULL SCREEN LOADING:
Spinner centered + "Please wait" text
Dark overlay: Optional (shows importance)
Can show progress percentage if available
```

---

## Part 20: Responsive Breakpoint Implementation

### 20.1 CSS Media Queries (GUIDO Standard)

```css
/* Mobile First Approach */
/* Base styles: 0px - 374px (xs) */

/* 375px and up (sm - main mobile) */
@media (min-width: 375px) { }

/* 640px and up (md - tablet) */
@media (min-width: 640px) { 
  /* Larger padding, 2-column grids allowed */
}

/* 1024px and up (lg - laptop) */
@media (min-width: 1024px) { 
  /* Sidebar visible, 3-column grids, wider content */
}

/* 1280px and up (xl - desktop) */
@media (min-width: 1280px) { 
  /* Max-width containers, sidebars stable */
}

/* 1536px and up (2xl - 4K/TV) */
@media (min-width: 1536px) { 
  /* Max-width caps, generous spacing */
}
```

### 20.2 Tailwind Classes (Current Framework)

```
Current GUIDO uses Tailwind CSS, so use:
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1536px

Example - Guide Card:
<div className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4">
  /* Full width (mobile), half width (sm), 
     third width (lg), quarter width (xl) */
</div>

Padding Example:
<div className="p-4 sm:p-6 lg:p-8">
  /* 16px mobile, 24px tablet, 32px desktop */
</div>
```

---

## Part 21: Current Inconsistencies Identified

### 21.1 Live Issues (Needing Fix)

```
INCONSISTENCY #1: Navigation Structure
├─ Tourist Dashboard: Top navbar only (no sidebar)
├─ Guide Dashboard: Top + missing sidebar
├─ Admin Dashboard: Side nav (different from tourist/guide)
└─ Fix Needed: Unified nav pattern across all

INCONSISTENCY #2: Button Heights
├─ Tourist booking: 44px proposed
├─ Guide accept/reject: Varies
├─ Admin approve/reject: Varies
└─ Fix Needed: Standardize to 44px mobile, 40px desktop

INCONSISTENCY #3: Tourist Data Display
├─ Ratings show email (FIXED - now shows name)
├─ Bookings show email ❌ (may need checking)
├─ Profile shows full name ✓
└─ Fix Needed: Audit all displays for consistency

INCONSISTENCY #4: Card Padding
├─ Tourist cards: Varies between 12px-24px
├─ Guide dashboard: Varies
├─ Admin dashboard: Varies
└─ Fix Needed: 16px mobile, 24px desktop everywhere

INCONSISTENCY #5: Status Badge Colors
├─ Some use different shades for same status
├─ Placement varies (left/right/top-right)
└─ Fix Needed: Unified badge system

INCONSISTENCY #6: Form Input Heights
├─ Some 40px, some 44px, some undefined
├─ Desktop vs mobile not standardized
└─ Fix Needed: 44px mobile, 40px desktop

INCONSISTENCY #7: Border Radius
├─ Some cards: 8px
├─ Some cards: 12px
├─ Some buttons: 6px
└─ Fix Needed: 12px all (except small: 6px)

INCONSISTENCY #8: Spacing/Padding
├─ No consistent 8px grid adherence
├─ Margin values: 10px, 12px, 15px (non-standard)
└─ Fix Needed: Strict 8px grid (8,16,24,32,40,48,64,80)
```

### 21.2 Missing Components

```
Missing/Incomplete:
├─ Unified loading skeleton component
├─ Consistent toast/notification system (partially done)
├─ Unified status badge component
├─ Consistent data table styling
├─ Icon sizing standard (currently mixed 16px, 20px, 24px)
└─ Focus state indicators for accessibility
```

---

## Part 22: Implementation Roadmap

### Phase 1: Foundation (Week 1)
```
1. Create design tokens file (colors, spacing, typography)
2. Establish Tailwind config with custom values
3. Create base components (Button, Input, Card, Badge)
4. Document component library
```

### Phase 2: Consolidation (Week 2)
```
1. Audit all 3 dashboards for inconsistencies
2. Create unified navigation system
3. Standardize form inputs across all dashboards
4. Create loading/skeleton states
```

### Phase 3: Responsive (Week 3)
```
1. Mobile optimization (375px base)
2. Tablet layout (640px+)
3. Desktop layout (1024px+)
4. Test on real devices
```

### Phase 4: Polish (Week 4)
```
1. Animation refinement
2. Dark mode implementation
3. Accessibility audit (WCAG AA)
4. Performance optimization
5. Final QA testing
```

---

## Part 23: Color Palette Final Specification

### Final Recommended Colors for GUIDO

```
PRIMARY COLORS:
├─ Primary Green (Emerald): #10B981
│  ├─ Hover: #34D399
│  ├─ Active: #047857
│  └─ Disabled: #D1FAE5
│
├─ Cream Background: #F9F7F4
│  ├─ Hover: #F3F0EB
│  └─ Input Focus: #F0FFFE (slight emerald tint)
│
└─ Dark Text: #1F2937
   └─ Light Text: #6B7280 (muted)

STATUS COLORS:
├─ Success (Dark Green): #059669
├─ Warning (Amber): #F59E0B
├─ Error (Red): #DC2626
├─ Info (Teal): #0891B2
└─ Pending (Yellow): #FBBF24

NEUTRAL PALETTE:
├─ White: #FFFFFF (backgrounds, cards)
├─ Light Gray: #F3F4F6
├─ Medium Gray: #D1D5DB
├─ Dark Gray: #6B7280
├─ Charcoal: #1F2937
└─ Black: #111827 (rarely used)

DARK MODE PALETTE:
├─ Background: #0F172A (navy-black)
├─ Surface: #1E293B (card background)
├─ Text: #F1F5F9 (soft white)
├─ Border: #334155 (slate)
├─ Primary: #6EE7B7 (bright emerald)
└─ Accent: #EC4899 (magenta) + #06B6D4 (teal)
```

---

## Part 24: Typography Final Specification

### Font System (GUIDO)

```
FONT FAMILY:
├─ Headings: Inter (weight 600, 700)
├─ Body: Inter (weight 400, 500)
└─ Code: JetBrains Mono (weight 500)

MOBILE TYPE SCALE:
┌─────────────────┬─────┬────────┐
│ Component       │ Size│ Weight │
├─────────────────┼─────┼────────┤
│ H1 (Hero)       │ 28px│ 700    │
│ H2 (Section)    │ 24px│ 700    │
│ H3 (Subsection) │ 20px│ 600    │
│ H4 (Card Title) │ 18px│ 600    │
│ Body Large      │ 16px│ 400    │
│ Body Normal     │ 14px│ 400    │
│ Body Small      │ 12px│ 400    │
└─────────────────┴─────┴────────┘

DESKTOP TYPE SCALE (1024px+):
┌─────────────────┬─────┬────────┐
│ Component       │ Size│ Weight │
├─────────────────┼─────┼────────┤
│ H1 (Hero)       │ 48px│ 700    │
│ H2 (Section)    │ 36px│ 700    │
│ H3 (Subsection) │ 28px│ 600    │
│ H4 (Card Title) │ 24px│ 600    │
│ Body Large      │ 18px│ 400    │
│ Body Normal     │ 16px│ 400    │
│ Body Small      │ 14px│ 400    │
└─────────────────┴─────┴────────┘

LINE HEIGHTS:
├─ Headings: 1.2 (tight)
├─ Body: 1.5 (readable)
├─ Small text: 1.4 (scannable)
└─ Code: 1.6 (monospace)
```

---

## Part 25: Quality Assurance Checklist

### Pre-Implementation Verification

```
Visual Consistency Checklist:
□ All buttons: Same height (44px mobile, 40px desktop)
□ All cards: Same padding (16px mobile, 24px desktop)
□ All inputs: Same height (44px mobile, 40px desktop)
□ All borders: 1px except focus (2px)
□ All border-radius: 12px consistently
□ All spacing: Multiples of 8px only
□ All colors: From approved palette only
□ All shadows: From defined system
□ All animations: <300ms for micro, <500ms for nav
□ All text: Uses type scale (no custom sizes)

Responsive Checklist:
□ Mobile: Tested at 375px, 480px
□ Tablet: Tested at 640px, 768px, 820px
□ Desktop: Tested at 1024px, 1280px
□ Touch targets: All >44px mobile
□ Images: Responsive with srcset
□ Text: No horizontal scroll needed

Accessibility Checklist:
□ All text: 4.5:1 contrast minimum
□ All buttons: Keyboard accessible
□ All focus: Visible outline present
□ All forms: Labels associated with inputs
□ All images: Alt text present
□ All icons: ARIA labels or context
□ All modals: Tab trap + ESC close
□ All tables: Proper header structure

Cross-Dashboard Checklist:
□ Navigation: Same pattern (all 3 dashboards)
□ Buttons: Same styling (all 3 dashboards)
□ Forms: Same validation (all 3 dashboards)
□ Status colors: Same meaning (all 3 dashboards)
□ Alerts: Same components (all 3 dashboards)
□ Breakpoints: Same responsive (all 3 dashboards)
```

---

## Summary: GUIDO Design System

### Key Decisions Made

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| **Colors** | Emerald + Cream | Eco-conscious, premium, accessible, differentiates from competitors |
| **Typography** | Inter font | High legibility on screens, proven in industry |
| **Spacing** | 8px grid | Scalable, maintains harmony, easier to code |
| **Breakpoints** | 375px base | Mobile-first, covers 70% of users |
| **Touch targets** | 44px minimum | Apple HIG standard, accessibility |
| **Navigation** | Unified pattern | Consistency across tourist/guide/admin |
| **Component system** | Tailwind + custom | Scalable, maintainable, documented |
| **Animations** | Subtle, <300ms | Improves UX without distraction |
| **Dark mode** | Secondary | Implemented after light mode complete |

### Expected Outcomes

```
After Implementation:
✓ Consistent UI across all dashboards
✓ Responsive from 375px to 1920px+
✓ WCAG AA accessibility minimum
✓ 60% reduction in CSS code (design tokens)
✓ 30% faster onboarding for new features
✓ Professional, cohesive brand presentation
✓ Reduced user confusion between dashboards
✓ Better mobile user experience
✓ Preparation for dark mode launch
✓ Future-proof component library
```

---

## Document Version History

| Version | Date | Status | Notes |
|---------|------|--------|-------|
| 1.0 | Feb 26, 2026 | Draft | Initial research, pre-implementation |
| - | - | TBD | Awaiting implementation command |

---

**Next Steps:** Await user command to begin implementation phase with specific dashboards targeted first (recommend Tourist → Guide → Admin sequence for priority ordering).

