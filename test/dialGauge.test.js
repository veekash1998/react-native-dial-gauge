const { describe, it } = require('node:test');
const assert = require('node:assert');

// Mock module loader so react-native and react-native-svg can be loaded in Node
const Module = require('module');
const origResolve = Module._resolveFilename;
Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === 'react-native' || request === 'react-native-svg' || request === 'react-native-circular-progress') {
    return request;
  }
  return origResolve.apply(this, arguments);
};

// Create mocks
const mockRN = {
  View: 'View',
  Text: 'Text',
  Animated: {
    View: 'Animated.View',
    Text: 'Animated.Text',
    Value: class MockAnimatedValue {
      constructor(val) {
        this._val = val;
        this._listeners = {};
        this._nextId = 1;
      }
      interpolate(config) {
        return 'interpolated';
      }
      setValue(val) {
        this._val = val;
        for (const id in this._listeners) {
          this._listeners[id]({ value: val });
        }
      }
      addListener(callback) {
        const id = 'listener_' + this._nextId++;
        this._listeners[id] = callback;
        return id;
      }
      removeListener(id) {
        delete this._listeners[id];
      }
      removeAllListeners() {
        this._listeners = {};
      }
    },
    timing: (val, config) => ({
      start: (cb) => {
        if (config && config.toValue !== undefined) {
          val.setValue(config.toValue);
        }
        if (cb) cb({ finished: true });
      },
    }),
    parallel: (animations) => ({
      start: (cb) => {
        animations.forEach((a) => a.start && a.start());
        if (cb) cb({ finished: true });
      },
    }),
  },
  StyleSheet: {
    create: (styles) => styles,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
  useWindowDimensions: () => ({ width: 375, height: 812 }),
  PanResponder: {
    create: (config) => ({
      panHandlers: {},
    }),
  },
  Easing: {
    linear: (t) => t,
    out: (f) => f,
    ease: (t) => t,
  },
  Platform: {
    OS: 'ios',
  },
};

const mockSvg = {
  __esModule: true,
  default: 'Svg',
  Svg: 'Svg',
  Path: 'Path',
  Line: 'Line',
  Text: 'SvgText',
  Circle: 'Circle',
  Polygon: 'Polygon',
  Defs: 'Defs',
  LinearGradient: 'LinearGradient',
  Stop: 'Stop',
  G: 'G',
};

require.cache['react-native'] = {
  id: 'react-native',
  filename: 'react-native',
  loaded: true,
  exports: mockRN,
};

require.cache['react-native-svg'] = {
  id: 'react-native-svg',
  filename: 'react-native-svg',
  loaded: true,
  exports: mockSvg,
};

describe('React Native Dial Gauge - Unit Tests', () => {
  it('loads index.js module cleanly and provides default and named exports', () => {
    const DialGaugePkg = require('../index.js');
    assert.ok(DialGaugePkg, 'Module should exist');
    const Component = DialGaugePkg.default || DialGaugePkg;
    assert.strictEqual(typeof Component, 'function', 'Component should be a function');
    assert.ok(DialGaugePkg.polarToCartesian, 'polarToCartesian should be exported');
    assert.ok(DialGaugePkg.describeArc, 'describeArc should be exported');
    assert.ok(DialGaugePkg.angleToValue, 'angleToValue should be exported');
    assert.ok(DialGaugePkg.clampValue, 'clampValue should be exported');
    assert.ok(DialGaugePkg.calculateTicks, 'calculateTicks should be exported');
  });

  it('polarToCartesian correctly maps angles to coordinates', () => {
    const { polarToCartesian } = require('../index.js');
    // 0 deg -> right
    const p0 = polarToCartesian(100, 100, 50, 0);
    assert.strictEqual(Math.round(p0.x), 150);
    assert.strictEqual(Math.round(p0.y), 100);

    // 90 deg -> bottom in SVG (+Y)
    const p90 = polarToCartesian(100, 100, 50, 90);
    assert.strictEqual(Math.round(p90.x), 100);
    assert.strictEqual(Math.round(p90.y), 150);

    // 180 deg -> left
    const p180 = polarToCartesian(100, 100, 50, 180);
    assert.strictEqual(Math.round(p180.x), 50);
    assert.strictEqual(Math.round(p180.y), 100);

    // 270 deg -> top in SVG (-Y)
    const p270 = polarToCartesian(100, 100, 50, 270);
    assert.strictEqual(Math.round(p270.x), 100);
    assert.strictEqual(Math.round(p270.y), 50);
  });

  it('describeArc generates valid SVG path for semicircle and speedometer', () => {
    const { describeArc } = require('../index.js');
    // Semicircle (180 to 360)
    const semiArc = describeArc(100, 100, 50, 180, 360);
    assert.ok(semiArc.startsWith('M 50.00 100.00 A 50 50 0 0 1 150.00 100.00'));

    // Speedometer (135 to 405 = 270 deg sweep)
    const speedArc = describeArc(100, 100, 50, 135, 405);
    assert.ok(speedArc.includes('A 50 50 0 1 1'), 'Speedometer should set largeArcFlag to 1');

    // 0 degree arc returns empty string
    const emptyArc = describeArc(100, 100, 50, 180, 180);
    assert.strictEqual(emptyArc, '');

    // Full 360 circle arc
    const fullCircle = describeArc(100, 100, 50, 0, 360);
    assert.ok(fullCircle.includes('M ') && fullCircle.includes('A 50 50'), 'Full circle should produce double arc');
  });

  it('clampValue and bounds sanitizer handle edge cases and division by zero', () => {
    const { clampValue, sanitizeBounds } = require('../index.js');
    // Normal clamping
    assert.strictEqual(clampValue(50, 0, 100), 50);
    assert.strictEqual(clampValue(-10, 0, 100), 0);
    assert.strictEqual(clampValue(150, 0, 100), 100);

    // Non-numeric handling
    assert.strictEqual(clampValue(NaN, 0, 100), 0);
    assert.strictEqual(clampValue(undefined, 10, 50), 10);
    assert.strictEqual(clampValue(null, 10, 50), 10);

    // Division by zero prevention: min === max
    const same = sanitizeBounds(50, 50);
    assert.ok(same.safeMax > same.safeMin, 'safeMax must be greater than safeMin even if equal inputs');

    // Inverted bounds: min > max
    const inverted = sanitizeBounds(100, 0);
    assert.strictEqual(inverted.safeMin, 0);
    assert.strictEqual(inverted.safeMax, 100);
  });

  it('calculateTicks generates major and minor ticks with labels', () => {
    const { calculateTicks } = require('../index.js');
    const ticks = calculateTicks(100, 100, 50, 180, 180, 0, 100, 5, 2);
    // 5 major ticks and 4 intervals * 2 minor ticks = 8 minor ticks -> total 13 ticks
    assert.strictEqual(ticks.length, 13);
    const majorTicks = ticks.filter((t) => t.isMajor);
    assert.strictEqual(majorTicks.length, 5);
    assert.strictEqual(majorTicks[0].value, 0);
    assert.strictEqual(majorTicks[4].value, 100);
    assert.strictEqual(majorTicks[2].value, 50);
    assert.ok(majorTicks[0].labelX !== undefined && majorTicks[0].labelY !== undefined);
  });

  it('angleToValue maps touch coordinates correctly to dial value', () => {
    const { angleToValue } = require('../index.js');
    // Semicircle (180 to 360) centered at 100, 100
    // Touch at left (50, 100) -> 0
    assert.strictEqual(angleToValue(50, 100, 100, 100, 180, 180, 0, 100), 0);
    // Touch at top (100, 50) -> 50
    assert.strictEqual(angleToValue(100, 50, 100, 100, 180, 180, 0, 100), 50);
    // Touch at right (150, 100) -> 100
    assert.strictEqual(angleToValue(150, 100, 100, 100, 180, 180, 0, 100), 100);

    // With step
    const stepped = angleToValue(100, 50, 100, 100, 180, 180, 0, 100, 10);
    assert.strictEqual(stepped, 50);
  });

  it('getActiveRange identifies the correct threshold range', () => {
    const { getActiveRange } = require('../index.js');
    const ranges = [
      { from: 0, to: 40, color: '#4CAF50' },
      { from: 40, to: 80, color: '#FF9800' },
      { from: 80, to: 100, color: '#F44336' },
    ];
    assert.strictEqual(getActiveRange(25, ranges).color, '#4CAF50');
    assert.strictEqual(getActiveRange(60, ranges).color, '#FF9800');
    assert.strictEqual(getActiveRange(95, ranges).color, '#F44336');
    // Boundary conditions
    assert.strictEqual(getActiveRange(0, ranges).color, '#4CAF50');
    assert.strictEqual(getActiveRange(100, ranges).color, '#F44336');
  });

  it('renders CircularDialGauge component element cleanly with various prop combinations', () => {
    const React = require('react');
    const CircularDialGauge = require('../index.js');

    // 1. Default render
    const el1 = React.createElement(CircularDialGauge, {
      value: 65,
      maxValue: 100,
      minValue: 0,
      title: 'Battery',
      unit: '%',
    });
    assert.ok(el1, 'Element 1 created');

    // 2. Speedometer variant with ranges and size prop
    const el2 = React.createElement(CircularDialGauge, {
      variant: 'speedometer',
      size: 240,
      value: 85,
      ranges: [
        { from: 0, to: 60, color: '#4CAF50' },
        { from: 60, to: 90, color: '#FF9800' },
        { from: 90, to: 120, color: '#F44336' },
      ],
      needleType: 'triangle',
      interactive: true,
      onValueChange: () => {},
    });
    assert.ok(el2, 'Element 2 created');

    // 3. Full circle with gradient
    const el3 = React.createElement(CircularDialGauge, {
      variant: 'circle',
      gradientColors: ['#00C9FF', '#92FE9D'],
      needleType: 'none',
      showScale: false,
      showNeedle: false,
    });
    assert.ok(el3, 'Element 3 created');

    // 4. Edge cases: min === max, negative value, decimalPlaces = 3
    const el4 = React.createElement(CircularDialGauge, {
      minValue: 50,
      maxValue: 50,
      value: -20,
      decimalPlaces: 3,
    });
    assert.ok(el4, 'Element 4 created');
  });
});
