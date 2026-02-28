# Sidebar Structure Documentation

## Overview
The project uses multiple sidebar components across different user roles:
1. **UnifiedSidebar** - Common component used by Admin & Guide dashboards
2. **TouristSidebar** - Custom sidebar for Tourist users
3. **GuideSidebar** - Custom sidebar for Guide users  
4. **AdminSidebar** - Custom sidebar for Admin users

---

## 1. UNIFIED SIDEBAR (Admin & Guide Dashboards)
**File:** `components/sidebars/UnifiedSidebar.tsx`

### Properties
- `title`: string (e.g., "Admin", "Guide")
- `logo`: ReactNode (optional)
- `items`: SidebarItem[] - Navigation menu items
- `userSection`: ReactNode (optional) - User profile display
- `onLogout`: () => void (callback)

### Structure
```
┌─────────────────────┐
│ HEADER              │ (py-3, border-bottom)
│ Logo + Title        │
└─────────────────────┘
│ NAVIGATION          │ (flex-1, overflow-y-auto)
│ - Menu Items        │ (scrollable)
│ - Active styling    │
│ - Icons + Labels    │
└─────────────────────┘
│ FOOTER              │ (flex-shrink-0)
│ - User Section      │
│ - Logout Button     │ (always visible)
└─────────────────────┘
```

### Menu Items Example (Admin)
- Dashboard (Home icon)
- Manage Guides (Users icon)
- Approved Guides (Users icon)
- Tourists (Users icon)
- Ratings & Reviews (Star icon)

### Menu Items Example (Guide)
- Dashboard (Home icon)
- Bookings
  - Booking Requests (Clock)
  - Confirmed Bookings (CheckCircle)
  - Past Bookings (Calendar)
  - Ratings (Star)
- Settings
  - Availability (Calendar)
  - Account Settings (Cog)

---

## 2. TOURIST SIDEBAR
**File:** `components/tourist-sidebar.tsx`

### Features
- **NotificationBell** in header (top-right)
- Sheet-based mobile navigation
- Desktop + Mobile variants

### Structure (Desktop)
```
┌──────────────────────────┐
│ Header (gradient bg)     │
│ Logo | Title | Bell      │
└──────────────────────────┘
│ Navigation (flex-1)      │
│ - Explore Guides         │
│ - Saved Guides           │
│ - Booking Status         │
│ - Past Bookings          │
│ - My Ratings & Reviews   │
└──────────────────────────┘
│ Divider                  │
│ Logout Button            │
└──────────────────────────┘
```

### Menu Items (Tourist)
- Dashboard (LayoutDashboard)
- Explore Guides (Compass)
- Saved Guides (Bookmark)
- Booking Status (Calendar)
- Past Bookings (History)
- My Ratings & Reviews (Star)

---

## 3. GUIDE SIDEBAR (Custom)
**File:** `components/guide-sidebar.tsx`

### Features
- **NotificationBell** in mobile header
- Mobile menu toggle
- Sectioned navigation

### Mobile Structure
```
Mobile Header:
├─ Logo + Text
├─ NotificationBell
└─ Menu Toggle

Mobile Menu (when open):
├─ Dashboard (link)
├─ Bookings (section)
│  ├─ Booking Requests
│  ├─ Confirmed Bookings
│  ├─ Past Trips
│  └─ Ratings
├─ Management (section)
│  ├─ Availability
│  └─ Itinerary
└─ Settings
   └─ Logout
```

---

## 4. ADMIN SIDEBAR (Custom)
**File:** `components/admin-sidebar.tsx`

### Features
- Sectioned navigation groups
- **NotificationBell** capability
- Mobile menu toggle
- Multiple verification states

### Menu Structure
```
├─ Dashboard
├─ Guide Verification (section)
│  ├─ Pending (Clock)
│  ├─ Approved (CheckCircle)
│  └─ Rejected (XCircle)
├─ Management (section)
│  ├─ Tourists (Users)
│  └─ Bookings (Calendar)
└─ Ratings & Reviews (Star)
```

---

## Common Elements Across All Sidebars

### User Section Display
```tsx
{
  profilePicture (if available),
  userName,
  userEmail,
  userRole
}
```

### Logout Button
- Always visible
- Bottom-aligned
- LogOut icon
- Callback to `onLogout()`

### Active Link Styling
- Emerald green highlight (#06b6d4 or similar)
- White text
- Subtle shadow

### Icons Used
- lucide-react library
- All icons: 20x20px (w-5 h-5)
- Icons always flex-shrink-0 (no squeeze)

### Responsive Behavior
- Desktop: Fixed sidebar (200-280px width)
- Mobile: Sheet/Drawer overlay
- Hamburger menu toggle on mobile
- Notification bell for alerts

---

## Key Color Scheme

### Sidebars Using UnifiedSidebar
- Background: slate-900 / slate-950 (dark)
- Active Item: emerald-600/90
- Text: white / slate-300
- Border: slate-700
- Header: slate-800/80

### Sidebars Using Custom Design
- Background: emerald-50 → emerald-50 gradient (light)
- Active Item: emerald-600
- Text: emerald-950 → slate-950 (dark)
- Border: emerald-200 / emerald-800 (dark)
- Header: Gradient background

---

## Notification Bell Integration

### Location
- Tourist Sidebar: Header right side
- Guide Sidebar: Mobile header right side
- Admin Sidebar: Mobile header capability

### Component
- Import: `NotificationBell` from `@/components/notification-bell`
- Display: Icon only (bell shape)
- Functionality: Triggers notification center/popover

---

## Spacing Standards

### Header
- Padding: px-3/4, py-2/3
- Min Height: 40-64px (depends on design)
- Border: bottom border in slate/emerald

### Navigation
- Padding: px-3/4, py-3/4
- Item Height: py-2 to py-2.5
- Gap Between Items: space-y-1 to space-y-1.5

### Footer
- Padding: px-3/4, py-3/4
- Border: top border
- Min Height: auto (fit-content)

---

## Migration Notes
When rebuilding sidebars:
1. Maintain logical grouping (Dashboard, Bookings, Management)
2. Keep NotificationBell in header
3. Always pin logout at bottom
4. Support both desktop & mobile views
5. Use consistent icon sizing (w-5 h-5)
6. Maintain emerald color theme
7. Ensure proper scrolling for long menus
8. Test active link highlighting
