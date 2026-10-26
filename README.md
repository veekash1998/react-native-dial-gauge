# React Native Dial Gauge 🚀 (v2.0)

A high-performance, responsive, interactive, and customizable circular dial gauge and speedometer component for **React Native** and **Expo**. Built with smooth animations, pure SVG rendering, multiple visual styles, color threshold zones, and touch-drag interactivity.

[![npm version](https://img.shields.io/npm/v/react-native-dial-gauge.svg)](https://www.npmjs.com/package/react-native-dial-gauge)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/yourusername/react-native-dial-gauge)

---

## ✨ Features in v2.0

- 🎯 **Multiple Gauge Variants**: Semi-circle (180°), Speedometer (270°), Full circle (360°), or custom start and sweep angles.
- 👆 **Interactive User Controls**: Touch and drag needle / dial to adjust values dynamically with `onValueChange` and `onSlidingComplete`.
- 🌈 **Multi-color Threshold Zones**: Define colored danger/warning/normal bands (e.g. green 0-60, orange 60-80, red 80-100).
- 🎨 **SVG Gradients**: Beautiful gradient progress tracks with customizable multi-color stops.
- 🎪 **Custom Needle Styles**: Tapered instrument needle, sharp triangle, minimalist line, orbital dot, or needle-less gauge.
- 🔢 **Smooth Animated Counter**: Real-time 60fps numeric counter that counts up smoothly during value transitions.
- 📱 **True Responsive Design**: Adapts dynamically across phones, tablets, split-screen, and screen rotations using dynamic dimensions.
- 🛡️ **Zero Crash / NaN-Safe**: Fully protected against division by zero, invalid bounds, inverted ranges, and unmounted listeners.
- 🪶 **Pure SVG Rendering**: Zero unmaintained wrapper dependencies; powered directly by `react-native-svg`.
- 📘 **TypeScript & JSDoc**: Complete TypeScript definitions with autocompletion for all props and utility functions.

---

## 📦 Installation

```bash
npm install react-native-dial-gauge
# or
yarn add react-native-dial-gauge
```

### Peer Dependency

This library requires `react-native-svg`:

```bash
# For Expo projects:
npx expo install react-native-svg

# For React Native CLI projects:
npm install react-native-svg
# (iOS CLI only):
cd ios && pod install
```

> **Note for v1 users**: `react-native-circular-progress` is no longer required! `react-native-dial-gauge` v2 renders directly using native SVG for improved performance and reliability.

---

## 🚀 Quick Start

### 1. Basic Gauge

```jsx
import React from 'react';
import { View } from 'react-native';
import CircularDialGauge from 'react-native-dial-gauge';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <CircularDialGauge
        value={75}
        minValue={0}
        maxValue={100}
        title="Battery Level"
        unit="%"
        size={220}
      />
    </View>
  );
}
```

---

### 2. Interactive Gauge (Touch & Drag)

Allow users to drag the needle or touch the dial to select a value:

```jsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import CircularDialGauge from 'react-native-dial-gauge';

export default function InteractiveDemo() {
  const [val, setVal] = useState(50);

  return (
    <View style={{ alignItems: 'center', padding: 20 }}>
      <CircularDialGauge
        value={val}
        minValue={0}
        maxValue={100}
        size={240}
        title="User Control"
        unit="%"
        color="#6366F1"
        interactive={true}
        step={1}
        needleType="triangle"
        onValueChange={(newVal) => setVal(newVal)}
        onSlidingComplete={(finalVal) => console.log('Finished at:', finalVal)}
      />
      <Text style={{ marginTop: 10 }}>Selected Value: {val}%</Text>
    </View>
  );
}
```

---

### 3. Automotive Speedometer with Color Zones

```jsx
import React from 'react';
import CircularDialGauge from 'react-native-dial-gauge';

export default function SpeedometerDemo() {
  return (
    <CircularDialGauge
      variant="speedometer"
      value={85}
      minValue={0}
      maxValue={160}
      title="Speed"
      unit="km/h"
      size={260}
      needleType="needle"
      needleColor="#1E293B"
      ranges={[
        { from: 0, to: 80, color: '#10B981', label: 'Safe' },
        { from: 80, to: 120, color: '#F59E0B', label: 'Warning' },
        { from: 120, to: 160, color: '#EF4444', label: 'Danger' },
      ]}
      majorTickCount={9}
      minorTicksPerInterval={3}
    />
  );
}
```

---

### 4. Modern Linear Gradient Arc

```jsx
import React from 'react';
import CircularDialGauge from 'react-native-dial-gauge';

export default function GradientDemo() {
  return (
    <CircularDialGauge
      value={88}
      title="Performance"
      unit="pts"
      size={220}
      gradientColors={['#06B6D4', '#10B981']}
      needleType="needle"
      needleColor="#0891B2"
    />
  );
}
```

---

### 5. 360° Circular Activity Ring

```jsx
import React from 'react';
import CircularDialGauge from 'react-native-dial-gauge';

export default function ActivityRingDemo() {
  return (
    <CircularDialGauge
      variant="circle"
      value={38.5}
      minValue={0}
      maxValue={50}
      title="Daily Goal"
      unit="km"
      size={200}
      color="#EC4899"
      backgroundColor="#FCE7F3"
      needleType="dot"
      showScale={false}
    />
  );
}
```

---

## ⚙️ Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current value to display |
| `minValue` | `number` | `0` | Minimum gauge value |
| `maxValue` | `number` | `100` | Maximum gauge value |
| `variant` | `'semicircle' \| 'speedometer' \| 'circle' \| 'custom'` | `'semicircle'` | Gauge visual style and default geometry |
| `size` | `number` | `responsive` | Diameter/size base for the gauge |
| `width` | `number` | `responsive` | Explicit container width |
| `height` | `number` | `responsive` | Explicit container height |
| `startAngle` | `number` | *(variant dependent)* | Custom starting angle in degrees |
| `sweepAngle` | `number` | *(variant dependent)* | Custom arc sweep angle in degrees |
| `color` | `string` | `"#4CAF50"` | Primary progress track color |
| `backgroundColor` | `string` | `"#E0E0E0"` | Background track color |
| `textColor` | `string` | `"#333333"` | Color for value text |
| `secondaryTextColor` | `string` | `"#666666"` | Color for title and scale labels |
| `title` | `string` | `"Value"` | Title displayed below the value |
| `unit` | `string` | `""` | Unit text displayed with value (e.g. `km/h`, `°C`) |
| `valuePrefix` | `string` | `""` | Prefix before value (e.g. `$`) |
| `decimalPlaces` | `number` | `1` | Number of decimal places |
| `valueFormatter` | `(val: number) => string` | `undefined` | Custom formatter for displayed value |
| `renderCenterContent`| `(animVal, val) => ReactNode` | `undefined` | Custom renderer for gauge center |
| `animated` | `boolean` | `true` | Whether to animate transitions |
| `animationDuration` | `number` | `1000` | Animation duration in milliseconds |
| `animationEasing` | `'easeOut' \| 'linear' \| 'spring'` | `'easeOut'` | Easing curve for animation |
| `showNeedle` | `boolean` | `true` | Show/hide the needle |
| `needleType` | `'needle' \| 'triangle' \| 'line' \| 'dot' \| 'none'` | `'needle'` | Needle indicator shape |
| `needleColor` | `string` | *(matches track)* | Color of the needle |
| `needleLength` | `number` | `responsive` | Length of needle in pixels |
| `needleWidth` | `number` | `responsive` | Width of needle base |
| `showHub` | `boolean` | `true` | Show center hub circle |
| `hubRadius` | `number` | `responsive` | Radius of center hub cap |
| `hubColor` | `string` | *(matches needle)* | Fill color of center hub |
| `renderNeedle` | `(params) => ReactNode` | `undefined` | Custom renderer for the needle |
| `showScale` | `boolean` | `true` | Show/hide scale tick marks and labels |
| `majorTickCount` | `number` | `5` | Number of major tick marks |
| `minorTicksPerInterval` | `number` | `3` | Minor ticks between major ticks |
| `majorTickColor` | `string` | `secondaryTextColor` | Color of major tick marks |
| `minorTickColor` | `string` | `backgroundColor` | Color of minor tick marks |
| `showTickLabels` | `boolean` | `true` | Show numeric labels on major ticks |
| `tickLabelFormatter` | `(val: number) => string` | `undefined` | Custom formatter for tick labels |
| `ranges` | `DialGaugeRange[]` | `undefined` | Color-coded threshold segments |
| `gradientColors` | `string[]` | `undefined` | Array of colors for linear gradient arc |
| `interactive` | `boolean` | `false` | Enable touch and drag interactivity |
| `onValueChange` | `(val: number) => void` | `undefined` | Called continuously while dragging |
| `onSlidingComplete` | `(val: number) => void` | `undefined` | Called when touch gesture finishes |
| `step` | `number` | `undefined` | Value increment step for interactive dragging |
| `disabled` | `boolean` | `false` | Disable touch interaction |
| `containerStyle` | `ViewStyle` | `{}` | Container style override |
| `titleStyle` | `TextStyle` | `{}` | Title text style override |
| `valueStyle` | `TextStyle` | `{}` | Value text style override |
| `unitStyle` | `TextStyle` | `{}` | Unit text style override |

---

## 🧪 Unit Testing

Run the included automated unit test suite:

```bash
npm test
```

The test suite tests:
- Trigonometry & coordinates mapping (`polarToCartesian`, `describeArc`).
- Touch-to-angle conversion and value clamping.
- Tick mark calculations (major/minor ticks, labels).
- Edge cases (division by zero, inverted bounds, NaN handling).
- React Native component rendering with all prop variations.

---

## 📝 Changelog

### v2.0.0 (Major Release)
- 🐛 **Fixed critical bug**: `showScale` and `showNeedle` are now properly rendered in the published entry point (`index.js`).
- 🐛 **Fixed critical bug**: The `size` prop is now properly respected and correctly scales width and height.
- 🐛 **Fixed critical bug**: Value display now smoothly animates and counts up at 60fps instead of reading private `_value`.
- 🐛 **Fixed critical bug**: Eliminated crashes and `NaN` errors when `minValue === maxValue` or invalid bounds are passed.
- 🐛 **Fixed needle positioning bug**: Needle rotates around the exact geometric center without magic negative offsets.
- 🚀 **New Feature**: Added user interactivity with touch and drag support (`interactive`, `onValueChange`, `onSlidingComplete`, `step`).
- 🚀 **New Feature**: Added gauge variants: `semicircle` (180°), `speedometer` (270°), and `circle` (360°).
- 🚀 **New Feature**: Added multi-color threshold zones (`ranges`).
- 🚀 **New Feature**: Added SVG linear gradient progress tracks (`gradientColors`).
- 🚀 **New Feature**: Added customizable needle types (`needle`, `triangle`, `line`, `dot`, `none`).
- 🚀 **New Feature**: Added responsive auto-scaling with dynamic window dimension detection.
- 🪶 **Dependency overhaul**: Removed unmaintained `react-native-circular-progress` dependency; now uses standard `react-native-svg`.
- 🧪 **Testing**: Added comprehensive automated unit tests.
- 📘 **TypeScript**: Updated TypeScript definitions (`index.d.ts`) covering all v2 props and types.

---

## 📄 License

MIT © Your Name