# Animation Specifications

## Tabs
- Trigger hover: subtle color transition, duration 200ms
- Active elevation: shadow-sm, immediate on selection
- Focus ring: 3px ring using `ring` color

## Cards
- Hover: slight shadow increase and brightness 105%
- Duration: 200–300ms
- Easing: ease-out

## Messages
- Bubble hover: brightness or shadow change only on motion-safe

## Performance
- Avoid layout thrash; animate opacity/transform only
- Respect `prefers-reduced-motion` via Tailwind `motion-safe:`

## Transitions
- Transition properties: `color, box-shadow`
- Provide consistent feel across components