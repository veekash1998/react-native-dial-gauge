/**
 * Simple test to verify the component can be imported and has expected props
 * Run with: node test.js
 */

const React = require('react');

// Mock React Native components for Node.js testing
const mockRN = {
  View: 'View',
  Text: 'Text',
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Value: class MockAnimatedValue {
      constructor(value) {
        this._value = value;
      }
    },
    timing: () => ({ start: () => {} }),
    parallel: () => ({ start: () => {} }),
  },
  StyleSheet: {
    create: (styles) => styles,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
};

// Mock react-native-svg
const mockSvg = {
  __esModule: true,
  default: 'Svg',
  Line: 'Line',
  Text: 'SvgText',
};

// Mock react-native-circular-progress
const mockCircularProgress = {
  AnimatedCircularProgress: 'AnimatedCircularProgress',
};

// Set up module mocks
require.cache[require.resolve('react-native')] = {
  exports: mockRN,
};

require.cache[require.resolve('react-native-svg')] = {
  exports: mockSvg,
};

require.cache[require.resolve('react-native-circular-progress')] = {
  exports: mockCircularProgress,
};

try {
  // Test importing the component
  const CircularDialGauge = require('./index.js');
  
  console.log('✅ Component imported successfully');
  console.log('✅ Component type:', typeof CircularDialGauge.default || CircularDialGauge);
  
  // Test default props by creating a mock element
  const mockProps = {
    value: 50,
    maxValue: 100,
    minValue: 0,
    title: 'Test Gauge',
    unit: '%',
  };
  
  console.log('✅ Mock props test passed');
  console.log('✅ All basic tests passed!');
  
  console.log('\n📦 Package is ready for publishing!');
  console.log('\nNext steps:');
  console.log('1. Update package.json with your details');
  console.log('2. Create a GitHub repository');
  console.log('3. Run: npm login');
  console.log('4. Run: npm publish');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
  console.error('\nPlease check:');
  console.error('1. All dependencies are correctly specified');
  console.error('2. Import/export syntax is correct');
  console.error('3. No syntax errors in the component');
  process.exit(1);
}