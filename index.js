const React = require('react');
const {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  createElement: h,
} = React;
const {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponder,
  Easing,
  Platform,
} = require('react-native');

// Graceful import for react-native-svg
let Svg, Path, Line, SvgText, Circle, Polygon, Defs, LinearGradient, Stop, G;
try {
  const RNSvg = require('react-native-svg');
  Svg = RNSvg.Svg || RNSvg.default || RNSvg;
  Path = RNSvg.Path;
  Line = RNSvg.Line;
  SvgText = RNSvg.Text;
  Circle = RNSvg.Circle;
  Polygon = RNSvg.Polygon;
  Defs = RNSvg.Defs;
  LinearGradient = RNSvg.LinearGradient;
  Stop = RNSvg.Stop;
  G = RNSvg.G;
} catch (e) {
  Svg = 'Svg';
  Path = 'Path';
  Line = 'Line';
  SvgText = 'SvgText';
  Circle = 'Circle';
  Polygon = 'Polygon';
  Defs = 'Defs';
  LinearGradient = 'LinearGradient';
  Stop = 'Stop';
  G = 'G';
}

// Global gradient ID counter to ensure unique SVG IDs across multiple instances
let gradientIdCounter = 0;

// ============================================================================
// Math & Geometry Utilities
// ============================================================================

/**
 * Convert polar coordinates (radius, angleInDegrees) to cartesian (x, y).
 * In SVG coordinates:
 * 0°   = 3 o'clock (right)
 * 90°  = 6 o'clock (down)
 * 180° = 9 o'clock (left)
 * 270° = 12 o'clock (up)
 */
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: Number((centerX + radius * Math.cos(angleInRadians)).toFixed(3)),
    y: Number((centerY + radius * Math.sin(angleInRadians)).toFixed(3)),
  };
}

/**
 * Generate SVG Path 'd' string for an arc from startAngle to endAngle.
 */
function describeArc(x, y, radius, startAngle, endAngle) {
  if (radius <= 0) return '';
  const diff = endAngle - startAngle;
  if (Math.abs(diff) < 0.001) return '';

  // Full circle handling (SVG arc doesn't render if start point == end point)
  if (Math.abs(diff) >= 360) {
    const p1 = polarToCartesian(x, y, radius, startAngle);
    const p2 = polarToCartesian(x, y, radius, startAngle + 180);
    return `M ${p1.x} ${p1.y} A ${radius} ${radius} 0 1 1 ${p2.x} ${p2.y} A ${radius} ${radius} 0 1 1 ${p1.x} ${p1.y}`;
  }

  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = Math.abs(diff) > 180 ? 1 : 0;
  const sweepFlag = diff >= 0 ? 1 : 0;

  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

/**
 * Sanitize and validate min and max values to prevent division by zero or NaN.
 */
function sanitizeBounds(min, max) {
  let safeMin = typeof min === 'number' && !isNaN(min) ? min : 0;
  let safeMax = typeof max === 'number' && !isNaN(max) ? max : 100;
  if (safeMin === safeMax) {
    safeMax = safeMin + 1;
  } else if (safeMin > safeMax) {
    const temp = safeMin;
    safeMin = safeMax;
    safeMax = temp;
  }
  return { safeMin, safeMax };
}

/**
 * Clamp a numeric value between min and max bounds.
 */
function clampValue(val, min, max) {
  if (typeof val !== 'number' || isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}

/**
 * Convert touch coordinates relative to center (cx, cy) to a gauge value.
 */
function angleToValue(touchX, touchY, cx, cy, startAngle, sweepAngle, minValue, maxValue, step) {
  const dx = touchX - cx;
  const dy = touchY - cy;
  let angleInDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
  if (angleInDeg < 0) angleInDeg += 360;

  const normStart = ((startAngle % 360) + 360) % 360;
  let delta = angleInDeg - normStart;
  while (delta < 0) delta += 360;

  if (delta > sweepAngle) {
    const distToStart = 360 - delta;
    const distToEnd = delta - sweepAngle;
    delta = distToStart < distToEnd ? 0 : sweepAngle;
  }

  const fraction = sweepAngle > 0 ? delta / sweepAngle : 0;
  let val = minValue + fraction * (maxValue - minValue);

  if (step && step > 0) {
    val = Math.round((val - minValue) / step) * step + minValue;
  }
  return Math.max(minValue, Math.min(maxValue, Number(val.toFixed(6))));
}

/**
 * Calculate major and minor scale ticks with coordinates and labels.
 */
function calculateTicks(cx, cy, radius, startAngle, sweepAngle, min, max, majorCount = 5, minorCount = 3, options = {}) {
  const ticks = [];
  const safeMajor = Math.max(2, majorCount);
  const majorIntervals = safeMajor - 1;
  const totalMinorPerInterval = Math.max(0, minorCount);

  const majorTickLength = options.majorTickLength || Math.max(6, radius * 0.1);
  const minorTickLength = options.minorTickLength || Math.max(3, majorTickLength * 0.55);
  const labelDistance = options.labelDistance || Math.max(12, radius * 0.16);

  for (let i = 0; i < safeMajor; i++) {
    const fraction = i / majorIntervals;
    const angle = startAngle + fraction * sweepAngle;
    const value = min + fraction * (max - min);

    const outerPt = polarToCartesian(cx, cy, radius, angle);
    const innerPt = polarToCartesian(cx, cy, radius - majorTickLength, angle);
    const labelPt = polarToCartesian(cx, cy, radius - majorTickLength - labelDistance, angle);

    ticks.push({
      key: `major-${i}`,
      isMajor: true,
      angle,
      value,
      x1: innerPt.x,
      y1: innerPt.y,
      x2: outerPt.x,
      y2: outerPt.y,
      labelX: labelPt.x,
      labelY: labelPt.y,
    });

    if (i < majorIntervals && totalMinorPerInterval > 0) {
      for (let j = 1; j <= totalMinorPerInterval; j++) {
        const minorFraction = (i + j / (totalMinorPerInterval + 1)) / majorIntervals;
        const minorAngle = startAngle + minorFraction * sweepAngle;
        const minorOuter = polarToCartesian(cx, cy, radius, minorAngle);
        const minorInner = polarToCartesian(cx, cy, radius - minorTickLength, minorAngle);

        ticks.push({
          key: `minor-${i}-${j}`,
          isMajor: false,
          angle: minorAngle,
          x1: minorInner.x,
          y1: minorInner.y,
          x2: minorOuter.x,
          y2: minorOuter.y,
        });
      }
    }
  }
  return ticks;
}

/**
 * Find matching color range for a given value.
 */
function getActiveRange(val, ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0) return null;
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (val >= r.from && val <= r.to) {
      return r;
    }
  }
  // Fallback to nearest range
  if (val < ranges[0].from) return ranges[0];
  return ranges[ranges.length - 1];
}

// ============================================================================
// CircularDialGauge Component
// ============================================================================

const CircularDialGauge = (props) => {
  const {
    value = 0,
    maxValue = 100,
    minValue = 0,
    title = 'Value',
    unit = '',
    valuePrefix = '',
    size,
    width,
    height,
    variant = 'semicircle', // 'semicircle' | 'speedometer' | 'circle' | 'custom'
    startAngle: customStartAngle,
    sweepAngle: customSweepAngle,
    color = '#4CAF50',
    backgroundColor = '#E0E0E0',
    textColor = '#333333',
    secondaryTextColor = '#666666',
    strokeWidth,
    strokeLinecap = 'round',
    animationDuration = 1000,
    animated = true,
    animationEasing = 'easeOut',
    showScale = true,
    showNeedle = true,
    needleType = 'needle', // 'needle' | 'triangle' | 'arrow' | 'line' | 'dot' | 'none'
    needleColor,
    needleLength,
    needleWidth,
    showHub = true,
    hubRadius,
    hubColor,
    hubBorderColor,
    hubBorderWidth,
    decimalPlaces = 1,
    showValue = true,
    valueFormatter,
    renderCenterContent,
    renderNeedle,
    majorTickCount = 5,
    minorTicksPerInterval = 3,
    majorTickLength,
    minorTickLength,
    majorTickWidth,
    minorTickWidth,
    majorTickColor,
    minorTickColor,
    showTickLabels = true,
    tickLabelDistance,
    tickLabelColor,
    tickLabelFontSize,
    tickLabelFormatter,
    ranges,
    gradientColors,
    interactive = false,
    onValueChange,
    onSlidingComplete,
    step,
    disabled = false,
    containerStyle = {},
    titleStyle = {},
    valueStyle = {},
    unitStyle = {},
  } = props;

  // Generate stable gradient ID
  const gradientId = useMemo(() => `dial-gauge-gradient-${++gradientIdCounter}`, []);

  // Safe min/max bounds
  const { safeMin, safeMax } = useMemo(() => sanitizeBounds(minValue, maxValue), [minValue, maxValue]);
  const clampedValue = useMemo(() => clampValue(value, safeMin, safeMax), [value, safeMin, safeMax]);

  // Dynamic window dimensions for responsive auto-scaling
  const windowDims = Dimensions.get('window');
  const screenWidth = windowDims.width || 375;
  const isTablet = screenWidth >= 768;

  // Responsive scaling utility
  const normalize = useCallback(
    (s) => {
      const scale = screenWidth / 375;
      return Math.max(s * scale, s * 0.8);
    },
    [screenWidth]
  );

  // Variant default angles
  const defaultAngles = useMemo(() => {
    switch (variant) {
      case 'speedometer':
        return { start: 135, sweep: 270, heightRatio: 0.9 };
      case 'circle':
        return { start: 270, sweep: 360, heightRatio: 1.0 };
      case 'semicircle':
      default:
        return { start: 180, sweep: 180, heightRatio: 0.65 };
    }
  }, [variant]);

  const startAngle = customStartAngle !== undefined ? customStartAngle : defaultAngles.start;
  const sweepAngle = customSweepAngle !== undefined ? customSweepAngle : defaultAngles.sweep;

  // Resolve dimensions: respect 'size', 'width', 'height' or responsive defaults
  const dimensions = useMemo(() => {
    let resolvedWidth;
    let resolvedHeight;

    if (size) {
      resolvedWidth = size;
      resolvedHeight = height || size * defaultAngles.heightRatio;
    } else if (width && height) {
      resolvedWidth = width;
      resolvedHeight = height;
    } else if (width) {
      resolvedWidth = width;
      resolvedHeight = width * defaultAngles.heightRatio;
    } else if (height) {
      resolvedWidth = height / defaultAngles.heightRatio;
      resolvedHeight = height;
    } else {
      // Responsive screen-relative size
      const baseResponsive = isTablet ? Math.min(screenWidth * 0.35, 260) : Math.min(screenWidth * 0.50, 200);
      resolvedWidth = baseResponsive;
      resolvedHeight = baseResponsive * defaultAngles.heightRatio;
    }

    const gaugeSize = Math.min(resolvedWidth, resolvedHeight / defaultAngles.heightRatio);
    return {
      width: resolvedWidth,
      height: resolvedHeight,
      gaugeSize,
    };
  }, [size, width, height, isTablet, screenWidth, defaultAngles.heightRatio]);

  const { width: containerWidth, height: containerHeight, gaugeSize } = dimensions;

  // Gauge center and track geometry
  const stroke = strokeWidth || Math.max(normalize(8), gaugeSize * 0.055);
  const cx = containerWidth / 2;
  const cy = variant === 'semicircle' ? gaugeSize * 0.50 : variant === 'speedometer' ? containerHeight * 0.52 : containerHeight / 2;
  const trackRadius = Math.max(10, gaugeSize * 0.40 - stroke / 2);

  // Active range matching
  const activeRange = useMemo(() => getActiveRange(clampedValue, ranges), [clampedValue, ranges]);
  const effectivePrimaryColor = (activeRange && activeRange.color) || color;

  // Animated values
  const entranceAnimation = useRef(new Animated.Value(0)).current;
  const animatedValue = useRef(new Animated.Value(clampedValue)).current;
  const [displayValue, setDisplayValue] = useState(clampedValue);
  const [currentValState, setCurrentValState] = useState(clampedValue);

  // Sync state if controlled value prop changes
  useEffect(() => {
    setCurrentValState(clampedValue);
  }, [clampedValue]);

  // Set up animation listener for smooth real-time numeric counter display
  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value: val }) => {
      setDisplayValue(val);
    });
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [animatedValue]);

  // Entrance and value change animations
  useEffect(() => {
    Animated.timing(entranceAnimation, {
      toValue: 1,
      duration: Math.min(animationDuration, 600),
      useNativeDriver: true,
    }).start();

    if (animated && animationDuration > 0) {
      let easingFunc = Easing.out(Easing.ease);
      if (animationEasing === 'linear') easingFunc = Easing.linear;
      else if (animationEasing === 'spring') easingFunc = Easing.out(Easing.back(1.5));

      Animated.timing(animatedValue, {
        toValue: currentValState,
        duration: animationDuration,
        easing: easingFunc,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(currentValState);
      setDisplayValue(currentValState);
    }
  }, [currentValState, animated, animationDuration, animationEasing, entranceAnimation, animatedValue]);

  // Needle dimensions
  const needleLen = needleLength || trackRadius * 0.85;
  const needleW = needleWidth || Math.max(normalize(4), gaugeSize * 0.024);
  const hubR = hubRadius || Math.max(normalize(7), gaugeSize * 0.038);
  const hubCol = hubColor || effectivePrimaryColor;
  const hubBorderCol = hubBorderColor || backgroundColor;
  const hubBorderW = hubBorderWidth || 2;

  // Scale marks calculation
  const scaleMarks = useMemo(() => {
    if (!showScale) return [];
    return calculateTicks(cx, cy, trackRadius, startAngle, sweepAngle, safeMin, safeMax, majorTickCount, minorTicksPerInterval, {
      majorTickLength,
      minorTickLength,
      labelDistance: tickLabelDistance,
    });
  }, [
    showScale,
    cx,
    cy,
    trackRadius,
    startAngle,
    sweepAngle,
    safeMin,
    safeMax,
    majorTickCount,
    minorTicksPerInterval,
    majorTickLength,
    minorTickLength,
    tickLabelDistance,
  ]);

  // Background arc path
  const backgroundArcPath = useMemo(() => {
    return describeArc(cx, cy, trackRadius, startAngle, startAngle + sweepAngle);
  }, [cx, cy, trackRadius, startAngle, sweepAngle]);

  // Progress arc path for current value
  const progressRatio = (clampValue(displayValue, safeMin, safeMax) - safeMin) / (safeMax - safeMin);
  const progressSweep = progressRatio * sweepAngle;
  const progressArcPath = useMemo(() => {
    if (progressSweep <= 0) return '';
    return describeArc(cx, cy, trackRadius, startAngle, startAngle + progressSweep);
  }, [cx, cy, trackRadius, startAngle, progressSweep]);

  // Needle rotation interpolation
  const needleRotation = animatedValue.interpolate({
    inputRange: [safeMin, safeMax],
    outputRange: [`${startAngle}deg`, `${startAngle + sweepAngle}deg`],
    extrapolate: 'clamp',
  });

  // PanResponder for Interactive User Control (Drag needle / Tap gauge)
  const containerRef = useRef(null);
  const [containerPageOffset, setContainerPageOffset] = useState({ pageX: 0, pageY: 0 });

  const handleTouch = useCallback(
    (evt) => {
      if (!interactive || disabled) return;
      const { locationX, locationY } = evt.nativeEvent;
      const newVal = angleToValue(locationX, locationY, cx, cy, startAngle, sweepAngle, safeMin, safeMax, step);
      setCurrentValState(newVal);
      animatedValue.setValue(newVal);
      setDisplayValue(newVal);
      if (typeof onValueChange === 'function') {
        onValueChange(newVal);
      }
    },
    [interactive, disabled, cx, cy, startAngle, sweepAngle, safeMin, safeMax, step, animatedValue, onValueChange]
  );

  const panResponder = useMemo(() => {
    if (!interactive || disabled) return null;
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleTouch,
      onPanResponderMove: handleTouch,
      onPanResponderRelease: (evt) => {
        handleTouch(evt);
        if (typeof onSlidingComplete === 'function') {
          const { locationX, locationY } = evt.nativeEvent;
          const finalVal = angleToValue(locationX, locationY, cx, cy, startAngle, sweepAngle, safeMin, safeMax, step);
          onSlidingComplete(finalVal);
        }
      },
    });
  }, [interactive, disabled, handleTouch, cx, cy, startAngle, sweepAngle, safeMin, safeMax, step, onSlidingComplete]);

  // Formatted value string
  const formattedValue = useMemo(() => {
    if (typeof valueFormatter === 'function') {
      return valueFormatter(displayValue);
    }
    return `${valuePrefix}${displayValue.toFixed(decimalPlaces)}`;
  }, [valueFormatter, displayValue, valuePrefix, decimalPlaces]);

  // Render Needle Content
  const renderNeedleElement = () => {
    if (!showNeedle || needleType === 'none') return null;

    if (typeof renderNeedle === 'function') {
      return renderNeedle({
        angle: startAngle + progressSweep,
        cx,
        cy,
        radius: trackRadius,
        value: displayValue,
      });
    }

    const needleColorFinal = needleColor || effectivePrimaryColor;
    const needleBoxSize = gaugeSize;
    const halfBox = needleBoxSize / 2;

    let needleSvgContent;
    if (needleType === 'triangle') {
      // Sharp pointer triangle
      needleSvgContent = h(Polygon, {
        points: `${halfBox},${halfBox - needleW / 1.5} ${halfBox + needleLen},${halfBox} ${halfBox},${halfBox + needleW / 1.5}`,
        fill: needleColorFinal,
      });
    } else if (needleType === 'line') {
      // Clean modern thin line
      needleSvgContent = h(Line, {
        x1: halfBox,
        y1: halfBox,
        x2: halfBox + needleLen,
        y2: halfBox,
        stroke: needleColorFinal,
        strokeWidth: needleW,
        strokeLinecap: 'round',
      });
    } else if (needleType === 'dot') {
      // Orbital indicator dot on the track
      needleSvgContent = h(Circle, {
        cx: halfBox + trackRadius,
        cy: halfBox,
        r: stroke * 0.7,
        fill: needleColorFinal,
        stroke: '#FFFFFF',
        strokeWidth: 2,
      });
    } else {
      // Classic sleek tapered needle (default)
      needleSvgContent = h(Polygon, {
        points: `${halfBox - hubR * 0.5},${halfBox} ${halfBox},${halfBox - needleW / 2} ${halfBox + needleLen},${halfBox} ${halfBox},${halfBox + needleW / 2}`,
        fill: needleColorFinal,
      });
    }

    return h(
      Animated.View,
      {
        key: 'needle-container',
        pointerEvents: 'none',
        style: [
          styles.needleWrapper,
          {
            width: needleBoxSize,
            height: needleBoxSize,
            left: cx - halfBox,
            top: cy - halfBox,
            transform: [{ rotate: needleRotation }],
          },
        ],
      },
      [
        h(
          Svg,
          {
            key: 'needle-svg',
            width: needleBoxSize,
            height: needleBoxSize,
          },
          [
            needleSvgContent,
            showHub &&
              h(Circle, {
                key: 'needle-hub',
                cx: halfBox,
                cy: halfBox,
                r: hubR,
                fill: hubCol,
                stroke: hubBorderCol,
                strokeWidth: hubBorderW,
              }),
          ]
        ),
      ]
    );
  };

  // Center display positioning
  const centerContentTop = variant === 'semicircle' ? cy + normalize(10) : cy - normalize(15);
  const titleTop = variant === 'semicircle' ? centerContentTop + normalize(26) : centerContentTop + normalize(32);

  return h(
    Animated.View,
    {
      ref: containerRef,
      accessible: true,
      accessibilityRole: interactive ? 'adjustable' : 'image',
      accessibilityLabel: title,
      accessibilityValue: { min: safeMin, max: safeMax, now: clampedValue },
      style: [
        styles.gaugeContainer,
        {
          width: containerWidth,
          height: containerHeight,
          transform: [{ scale: entranceAnimation }],
        },
        containerStyle,
      ],
      ...(panResponder ? panResponder.panHandlers : {}),
    },
    [
      // Main SVG Canvas (Tracks, Gradients, Ranges, Scale Ticks)
      h(
        Svg,
        {
          key: 'gauge-svg-canvas',
          width: containerWidth,
          height: containerHeight,
          style: styles.svgCanvas,
        },
        [
          // Gradient Definition
          gradientColors &&
            gradientColors.length >= 2 &&
            h(
              Defs,
              { key: 'defs' },
              h(
                LinearGradient,
                {
                  id: gradientId,
                  x1: '0%',
                  y1: '0%',
                  x2: '100%',
                  y2: '100%',
                },
                gradientColors.map((gColor, idx) =>
                  h(Stop, {
                    key: `stop-${idx}`,
                    offset: `${(idx / (gradientColors.length - 1)) * 100}%`,
                    stopColor: gColor,
                    stopOpacity: 1,
                  })
                )
              )
            ),

          // Background Track Arc
          !Array.isArray(ranges) || ranges.length === 0
            ? h(Path, {
                key: 'background-track',
                d: backgroundArcPath,
                stroke: backgroundColor,
                strokeWidth: stroke,
                strokeLinecap,
                fill: 'none',
              })
            : // Segmented Range Arcs
              ranges.map((rng, rIdx) => {
                const rFrom = clampValue(rng.from, safeMin, safeMax);
                const rTo = clampValue(rng.to, safeMin, safeMax);
                const rStartFrac = (rFrom - safeMin) / (safeMax - safeMin);
                const rEndFrac = (rTo - safeMin) / (safeMax - safeMin);
                const rPath = describeArc(cx, cy, trackRadius, startAngle + rStartFrac * sweepAngle, startAngle + rEndFrac * sweepAngle);
                return h(Path, {
                  key: `range-arc-${rIdx}`,
                  d: rPath,
                  stroke: rng.color,
                  strokeWidth: stroke,
                  strokeLinecap: 'butt',
                  fill: 'none',
                });
              }),

          // Active Progress Arc
          progressArcPath
            ? h(Path, {
                key: 'progress-track',
                d: progressArcPath,
                stroke: gradientColors && gradientColors.length >= 2 ? `url(#${gradientId})` : effectivePrimaryColor,
                strokeWidth: stroke,
                strokeLinecap,
                fill: 'none',
              })
            : null,

          // Scale Ticks & Labels
          showScale &&
            scaleMarks.map((mark) =>
              h(React.Fragment, { key: mark.key }, [
                h(Line, {
                  key: `tick-line-${mark.key}`,
                  x1: mark.x1,
                  y1: mark.y1,
                  x2: mark.x2,
                  y2: mark.y2,
                  stroke: mark.isMajor
                    ? majorTickColor || secondaryTextColor
                    : minorTickColor || backgroundColor,
                  strokeWidth: mark.isMajor
                    ? majorTickWidth || Math.max(normalize(1.8), gaugeSize * 0.009)
                    : minorTickWidth || Math.max(normalize(1.0), gaugeSize * 0.005),
                  strokeLinecap: 'round',
                }),

                showTickLabels &&
                  mark.isMajor &&
                  mark.labelX !== undefined &&
                  h(
                    SvgText,
                    {
                      key: `tick-text-${mark.key}`,
                      x: mark.labelX,
                      y: mark.labelY + 4,
                      fontSize: tickLabelFontSize || Math.max(normalize(9), gaugeSize * 0.048),
                      fill: tickLabelColor || secondaryTextColor,
                      textAnchor: 'middle',
                      fontWeight: '600',
                    },
                    typeof tickLabelFormatter === 'function'
                      ? tickLabelFormatter(mark.value)
                      : mark.value.toFixed(0)
                  ),
              ])
            ),
        ]
      ),

      // Animated Needle
      renderNeedleElement(),

      // Value & Unit Display
      showValue &&
        h(
          View,
          {
            key: 'value-display-container',
            pointerEvents: 'none',
            style: [styles.centerContent, { top: centerContentTop }],
          },
          [
            typeof renderCenterContent === 'function'
              ? renderCenterContent(displayValue, clampedValue)
              : h(
                  Text,
                  {
                    key: 'value-text',
                    style: [
                      styles.valueText,
                      {
                        color: textColor,
                        fontSize: Math.max(normalize(18), gaugeSize * 0.095),
                      },
                      valueStyle,
                    ],
                  },
                  [
                    formattedValue,
                    unit
                      ? h(
                          Text,
                          {
                            key: 'unit-text',
                            style: [
                              styles.unitText,
                              {
                                color: secondaryTextColor,
                                fontSize: Math.max(normalize(12), gaugeSize * 0.06),
                              },
                              unitStyle,
                            ],
                          },
                          ` ${unit}`
                        )
                      : null,
                  ]
                ),
          ]
        ),

      // Title Display
      title
        ? h(
            View,
            {
              key: 'title-display-container',
              pointerEvents: 'none',
              style: [styles.titleContainer, { top: titleTop }],
            },
            [
              h(
                Text,
                {
                  key: 'title-text',
                  style: [
                    styles.titleText,
                    {
                      color: secondaryTextColor,
                      fontSize: Math.max(normalize(12), gaugeSize * 0.062),
                    },
                    titleStyle,
                  ],
                },
                title
              ),
            ]
          )
        : null,
    ]
  );
};

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  svgCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  needleWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  valueText: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  unitText: {
    fontWeight: '600',
    marginLeft: 3,
  },
  titleContainer: {
    position: 'absolute',
    alignItems: 'center',
    alignSelf: 'center',
  },
  titleText: {
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

// ============================================================================
// Module Exports
// ============================================================================

CircularDialGauge.default = CircularDialGauge;
CircularDialGauge.CircularDialGauge = CircularDialGauge;
CircularDialGauge.DialGauge = CircularDialGauge;
CircularDialGauge.polarToCartesian = polarToCartesian;
CircularDialGauge.describeArc = describeArc;
CircularDialGauge.angleToValue = angleToValue;
CircularDialGauge.clampValue = clampValue;
CircularDialGauge.calculateTicks = calculateTicks;
CircularDialGauge.sanitizeBounds = sanitizeBounds;
CircularDialGauge.getActiveRange = getActiveRange;

module.exports = CircularDialGauge;