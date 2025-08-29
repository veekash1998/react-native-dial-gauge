# React Native Dial Gauge

A beautiful, customizable, and responsive circular dial gauge component for React Native with smooth animations. Perfect for dashboards, meters, and data visualization.

![React Native Dial Gauge Demo](https://via.placeholder.com/400x200/4CAF50/FFFFFF?text=Dial+Gauge+Demo)

## Features

- 🎨 **Fully Customizable** - Colors, sizes, text, and styling
- 📱 **Responsive Design** - Automatically adapts to different screen sizes
- ✨ **Smooth Animations** - Beautiful entrance and value change animations
- 🎯 **Precise Control** - Configurable min/max values and decimal places
- 📊 **Scale Marks** - Optional scale indicators with labels
- 🎪 **Needle Indicator** - Animated needle pointer
- 📱 **Cross Platform** - Works on iOS, Android, and Expo
- 🔧 **TypeScript Support** - Full TypeScript definitions included
- 🪶 **Lightweight** - Minimal dependencies

## Installation

```bash
npm install react-native-dial-gauge
```

### Peer Dependencies

Make sure you have these peer dependencies installed:

```bash
npm install react-native-svg react-native-circular-progress
```

For Expo projects:
```bash
expo install react-native-svg react-native-circular-progress
```

For React Native CLI projects, you'll also need to follow the installation instructions for:
- [react-native-svg](https://github.com/react-native-svg/react-native-svg)
- [react-native-circular-progress](https://github.com/bartgryszko/react-native-circular-progress)

## Basic Usage

```jsx
import React from 'react';
import { View } from 'react-native';
import CircularDialGauge from 'react-native-dial-gauge';

const App = () => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <CircularDialGauge
        value={75}
        maxValue={100}
        minValue={0}
        title="Battery Level"
        unit="%"
      />
    </View>
  );
};

export default App;
```

## Advanced Usage

```jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import CircularDialGauge from 'react-native-dial-gauge';

const Dashboard = () => {
  const [voltage, setVoltage] = useState(220);
  const [current, setCurrent] = useState(15);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setVoltage(200 + Math.random() * 50);
      setCurrent(10 + Math.random() * 20);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.gaugeRow}>
        <CircularDialGauge
          value={voltage}
          maxValue={250}
          minValue={200}
          title="AC Voltage"
          unit="V"
          color="#FF6B35"
          width={180}
          height={140}
          decimalPlaces={1}
          animationDuration={800}
          containerStyle={styles.gaugeContainer}
        />
        
        <CircularDialGauge
          value={current}
          maxValue={32}
          minValue={0}
          title="AC Current"
          unit="A"
          color="#4ECDC4"
          width={180}
          height={140}
          decimalPlaces={2}
          showScale={true}
          showNeedle={true}
          containerStyle={styles.gaugeContainer}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  gaugeRow: {
    flexDirection: 'row',
    gap: 20,
  },
  gaugeContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default Dashboard;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current value to display |
| `maxValue` | `number` | `100` | Maximum value of the gauge |
| `minValue` | `number` | `0` | Minimum value of the gauge |
| `title` | `string` | `"Value"` | Title text displayed below the gauge |
| `unit` | `string` | `""` | Unit text displayed with the value |
| `size` | `number` | `responsive` | Size of the gauge (overridden by width/height) |
| `width` | `number` | `responsive` | Width of the gauge container |
| `height` | `number` | `responsive` | Height of the gauge container |
| `color` | `string` | `"#4CAF50"` | Primary color for the gauge |
| `backgroundColor` | `string` | `"#E0E0E0"` | Background color of the gauge track |
| `textColor` | `string` | `"#333333"` | Color for primary text elements |
| `secondaryTextColor` | `string` | `"#666666"` | Color for secondary text elements |
| `strokeWidth` | `number` | `responsive` | Width of the progress stroke |
| `animationDuration` | `number` | `1200` | Duration of animations in milliseconds |
| `showScale` | `boolean` | `true` | Whether to show scale marks |
| `showNeedle` | `boolean` | `true` | Whether to show the needle indicator |
| `decimalPlaces` | `number` | `1` | Number of decimal places for value display |
| `containerStyle` | `ViewStyle` | `{}` | Additional styles for the container |
| `titleStyle` | `TextStyle` | `{}` | Additional styles for the title text |
| `valueStyle` | `TextStyle` | `{}` | Additional styles for the value text |

## Responsive Design

The component automatically adapts to different screen sizes:

- **Phone**: Optimized for smaller screens
- **Tablet**: Larger gauges with better spacing
- **Custom Sizes**: Use `width` and `height` props for precise control

## Customization Examples

### Custom Colors and Styling

```jsx
<CircularDialGauge
  value={85}
  maxValue={100}
  title="Performance"
  unit="%"
  color="#FF6B35"
  backgroundColor="#FFF3E0"
  textColor="#D84315"
  secondaryTextColor="#FF8A65"
  containerStyle={{
    backgroundColor: '#FFEBEE',
    borderRadius: 25,
    padding: 20,
  }}
  titleStyle={{
    fontWeight: 'bold',
    fontSize: 16,
  }}
  valueStyle={{
    fontWeight: '900',
    fontSize: 20,
  }}
/>
```

### Minimal Design

```jsx
<CircularDialGauge
  value={42}
  maxValue={100}
  title="Progress"
  showScale={false}
  showNeedle={false}
  color="#6C5CE7"
  backgroundColor="#DDD6FE"
  animationDuration={2000}
/>
```

### High Precision Gauge

```jsx
<CircularDialGauge
  value={23.456}
  maxValue={50}
  minValue={0}
  title="Temperature"
  unit="°C"
  decimalPlaces={3}
  color="#E17055"
  strokeWidth={12}
/>
```

## Performance Tips

1. **Avoid Frequent Updates**: For real-time data, consider throttling updates to avoid excessive re-renders
2. **Use Stable References**: Pass stable objects for style props to prevent unnecessary re-renders
3. **Optimize Animation Duration**: Shorter durations for frequent updates, longer for dramatic changes

## Troubleshooting

### Common Issues

1. **Gauge not showing**: Make sure `react-native-svg` is properly installed and linked
2. **Animation not smooth**: Check if you're running in debug mode, animations are smoother in release builds
3. **Size issues**: Use specific `width` and `height` props instead of relying on auto-sizing

### Platform-Specific Notes

- **iOS**: Works out of the box with proper SVG setup
- **Android**: Ensure SVG is properly configured in your build
- **Expo**: Use `expo install` for dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Changelog

### 1.0.0
- Initial release
- Basic circular dial gauge functionality
- Responsive design
- Smooth animations
- TypeScript support
- Comprehensive customization options

## Support

If you like this package, please consider giving it a ⭐ on GitHub!

For issues and feature requests, please use the [GitHub Issues](https://github.com/yourusername/react-native-dial-gauge/issues) page.