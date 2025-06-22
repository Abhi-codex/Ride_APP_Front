## Overview
This project uses a utility-first styling approach inspired by Tailwind CSS, but implemented using React Native's StyleSheet for maximum compatibility with Expo and React Native.

## Setup

### TailwindStyles.ts
We've created a comprehensive utility styles file at `constants/TailwindStyles.ts` that provides:
- Tailwind-inspired color palette
- Layout utilities (flexbox, positioning)
- Spacing utilities (padding, margin)
- Typography utilities
- Background and text colors
- Border and shadow utilities

## Usage

### Basic Styling
Instead of using className props, import and use the styles object:

```tsx
import { styles, colors } from '../constants/TailwindStyles';

// Example usage
<View style={[styles.flex1, styles.bgWhite, styles.p4]}>
  <Text style={[styles.textLg, styles.fontBold, styles.textPrimary600]}>
    Hello World!
  </Text>
  <TouchableOpacity style={[styles.bgPrimary500, styles.py3, styles.px4, styles.roundedLg]}>
    <Text style={[styles.textWhite, styles.textCenter, styles.fontBold]}>
      Action Button
    </Text>
  </TouchableOpacity>
</View>
```

### Custom Colors
Access colors directly from the colors object:
```tsx
<View style={{ backgroundColor: colors.primary[500] }}>
  <Text style={{ color: colors.secondary[700] }}>Custom styled text</Text>
</View>
```

## Converted Components

The following rider components have been converted to use utility styles:

1. **RiderControlPanel** - Bottom panel with online/offline toggle and ride actions
2. **AvailableRidesList** - List of available rides with accept/reject buttons
3. **AcceptedRideInfo** - Display for accepted ride information
4. **RiderMap** - Map component (kept original styling for map-specific props)
5. **app/rider/index.tsx** - Main rider screen

## Development

To start the development server:
```bash
npx expo start --clear
```

The `--clear` flag clears the cache, which is important when making configuration changes.

## Features Implemented

### RiderControlPanel
- Modern card design with rounded corners and shadows
- Color-coded online/offline button (green for online, gray for offline)
- Primary blue styling for action buttons
- Improved typography and spacing

### AvailableRidesList & AcceptedRideInfo
- Clean card layouts with proper spacing
- Color-coded action buttons (blue for accept, red for reject)
- Enhanced visual hierarchy with different text weights and colors
- Consistent positioning and sizing

### Loading States
- Centered loading indicators with proper spacing
- Branded color scheme for activity indicators

## Best Practices

1. **Consistent Spacing**: Use Tailwind's spacing scale (p-2, m-4, etc.)
2. **Color Scheme**: Stick to the defined color palette for consistency
3. **Typography**: Use Tailwind's font utilities for consistent text styling
4. **Component Structure**: Keep className props readable by breaking long class lists

## Troubleshooting

If styles aren't applying:
1. Clear Metro cache: `npx expo start --clear`
2. Restart the development server
3. Check that global.css is being imported in _layout.tsx
4. Verify className syntax (no typos in class names)

## Future Enhancements

Consider adding:
- Dark mode support using Tailwind's dark mode utilities
- Custom component variants using `@apply` directives
- Animation utilities using Tailwind's transition classes
