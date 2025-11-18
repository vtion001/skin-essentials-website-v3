# Skin Essentials Admin Design System

## Color Palette
- Primary: #fbc6c5, #d09d80
- Accent: #1d4ed8, #16a34a, #f59e0b, #ef4444, #7c3aed
- Surface: white/60 with backdrop-blur-sm
- Borders: themed (blue-200, green-200, purple-200, orange-200)

## Typography
- Headings: font-semibold, tracking-tight
- Body: text-gray-700/600, readable contrast
- Metadata: text-xs text-gray-500

## Spacing
- Grid gaps: 6
- Card padding: 24px (p-6)
- Tab height: 36px (h-9) with 3px container padding

## Components
- Tabs: rounded-lg container, rounded-md triggers, active state surface elevation, focus-visible ring
- Cards: subtle shadow, themed borders, gradient or blur surface
- Badges: semantic colors with ample contrast

## Accessibility
- ARIA roles: tablist, tab, tabpanel; list/listitem where applicable
- Focus states: focus-visible:ring-[3px] with accessible colors
- Motion safety: motion-safe transitions; avoid excessive animation

## Tokens
- Motion: duration-200/300; easing: ease-out
- Radii: container rounded-lg; triggers rounded-md

## Usage
- Maintain hierarchy via headings, spacing, and contrast
- Use semantic icons and labels with accessible names