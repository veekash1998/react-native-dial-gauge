import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
  PanResponder,
  Easing,
} from 'react-native';
import Svg, {
  Path,
  Line,
  Text as SvgText,
  Circle,
  Polygon,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';

let gradientIdCounter = 0;

export function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180.0;
  return {
    x: Number((centerX + radius * Math.cos(angleInRadians)).toFixed(3)),
    y: Number((centerY + radius * Math.sin(angleInRadians)).toFixed(3)),
  };
}

export function describeArc(x, y, radius, startAngle, endAngle) {
  if (radius <= 0) return '';
  const diff = endAngle - startAngle;
  if (Math.abs(diff) < 0.001) return '';

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

export function sanitizeBounds(min, max) {
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

export function clampValue(val, min, max) {
  if (typeof val !== 'number' || isNaN(val)) return min;
  return Math.max(min, Math.min(max, val));
}

export function angleToValue(touchX, touchY, cx, cy, startAngle, sweepAngle, minValue, maxValue, step) {
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

export function calculateTicks(cx, cy, radius, startAngle, sweepAngle, min, max, majorCount = 5, minorCount = 3, options = {}) {
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

export function getActiveRange(val, ranges) {
  if (!Array.isArray(ranges) || ranges.length === 0) return null;
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    if (val >= r.from && val <= r.to) {
      return r;
    }
  }
  if (val < ranges[0].from) return ranges[0];
  return ranges[ranges.length - 1];
}

const CircularDialGauge = ({
  value = 0,
  maxValue = 100,
  minValue = 0,
  title = 'Value',
  unit = '',
  valuePrefix = '',
  size,
  width,
  height,
  variant = 'semicircle',
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
  needleType = 'needle',
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
}) => {
  const gradientId = useMemo(() => `dial-gauge-gradient-${++gradientIdCounter}`, []);
  const { safeMin, safeMax } = useMemo(() => sanitizeBounds(minValue, maxValue), [minValue, maxValue]);
  const clampedValue = useMemo(() => clampValue(value, safeMin, safeMax), [value, safeMin, safeMax]);

  const windowDims = Dimensions.get('window');
  const screenWidth = windowDims.width || 375;
  const isTablet = screenWidth >= 768;

  const normalize = useCallback(
    (s) => {
      const scale = screenWidth / 375;
      return Math.max(s * scale, s * 0.8);
    },
    [screenWidth]
  );

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
      const baseResponsive = isTablet ? Math.min(screenWidth * 0.35, 260) : Math.min(screenWidth * 0.50, 200);
      resolvedWidth = baseResponsive;
      resolvedHeight = baseResponsive * defaultAngles.heightRatio;
    }

    const gaugeSize = Math.min(resolvedWidth, resolvedHeight / defaultAngles.heightRatio);
    return { width: resolvedWidth, height: resolvedHeight, gaugeSize };
  }, [size, width, height, isTablet, screenWidth, defaultAngles.heightRatio]);

  const { width: containerWidth, height: containerHeight, gaugeSize } = dimensions;

  const stroke = strokeWidth || Math.max(normalize(8), gaugeSize * 0.055);
  const cx = containerWidth / 2;
  const cy = variant === 'semicircle' ? gaugeSize * 0.50 : variant === 'speedometer' ? containerHeight * 0.52 : containerHeight / 2;
  const trackRadius = Math.max(10, gaugeSize * 0.40 - stroke / 2);

  const activeRange = useMemo(() => getActiveRange(clampedValue, ranges), [clampedValue, ranges]);
  const effectivePrimaryColor = (activeRange && activeRange.color) || color;

  const entranceAnimation = useRef(new Animated.Value(0)).current;
  const animatedValue = useRef(new Animated.Value(clampedValue)).current;
  const [displayValue, setDisplayValue] = useState(clampedValue);
  const [currentValState, setCurrentValState] = useState(clampedValue);

  useEffect(() => {
    setCurrentValState(clampedValue);
  }, [clampedValue]);

  useEffect(() => {
    const listenerId = animatedValue.addListener(({ value: val }) => {
      setDisplayValue(val);
    });
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, [animatedValue]);

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

  const needleLen = needleLength || trackRadius * 0.85;
  const needleW = needleWidth || Math.max(normalize(4), gaugeSize * 0.024);
  const hubR = hubRadius || Math.max(normalize(7), gaugeSize * 0.038);
  const hubCol = hubColor || effectivePrimaryColor;
  const hubBorderCol = hubBorderColor || backgroundColor;
  const hubBorderW = hubBorderWidth || 2;

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

  const backgroundArcPath = useMemo(() => {
    return describeArc(cx, cy, trackRadius, startAngle, startAngle + sweepAngle);
  }, [cx, cy, trackRadius, startAngle, sweepAngle]);

  const progressRatio = (clampValue(displayValue, safeMin, safeMax) - safeMin) / (safeMax - safeMin);
  const progressSweep = progressRatio * sweepAngle;
  const progressArcPath = useMemo(() => {
    if (progressSweep <= 0) return '';
    return describeArc(cx, cy, trackRadius, startAngle, startAngle + progressSweep);
  }, [cx, cy, trackRadius, startAngle, progressSweep]);

  const needleRotation = animatedValue.interpolate({
    inputRange: [safeMin, safeMax],
    outputRange: [`${startAngle}deg`, `${startAngle + sweepAngle}deg`],
    extrapolate: 'clamp',
  });

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

  const formattedValue = useMemo(() => {
    if (typeof valueFormatter === 'function') {
      return valueFormatter(displayValue);
    }
    return `${valuePrefix}${displayValue.toFixed(decimalPlaces)}`;
  }, [valueFormatter, displayValue, valuePrefix, decimalPlaces]);

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

    let needleSvgContent = null;
    if (needleType === 'triangle') {
      needleSvgContent = (
        <Polygon
          points={`${halfBox},${halfBox - needleW / 1.5} ${halfBox + needleLen},${halfBox} ${halfBox},${halfBox + needleW / 1.5}`}
          fill={needleColorFinal}
        />
      );
    } else if (needleType === 'line') {
      needleSvgContent = (
        <Line
          x1={halfBox}
          y1={halfBox}
          x2={halfBox + needleLen}
          y2={halfBox}
          stroke={needleColorFinal}
          strokeWidth={needleW}
          strokeLinecap="round"
        />
      );
    } else if (needleType === 'dot') {
      needleSvgContent = (
        <Circle
          cx={halfBox + trackRadius}
          cy={halfBox}
          r={stroke * 0.7}
          fill={needleColorFinal}
          stroke="#FFFFFF"
          strokeWidth={2}
        />
      );
    } else {
      needleSvgContent = (
        <Polygon
          points={`${halfBox - hubR * 0.5},${halfBox} ${halfBox},${halfBox - needleW / 2} ${halfBox + needleLen},${halfBox} ${halfBox},${halfBox + needleW / 2}`}
          fill={needleColorFinal}
        />
      );
    }

    return (
      <Animated.View
        key="needle-container"
        pointerEvents="none"
        style={[
          styles.needleWrapper,
          {
            width: needleBoxSize,
            height: needleBoxSize,
            left: cx - halfBox,
            top: cy - halfBox,
            transform: [{ rotate: needleRotation }],
          },
        ]}
      >
        <Svg width={needleBoxSize} height={needleBoxSize}>
          {needleSvgContent}
          {showHub && (
            <Circle
              cx={halfBox}
              cy={halfBox}
              r={hubR}
              fill={hubCol}
              stroke={hubBorderCol}
              strokeWidth={hubBorderW}
            />
          )}
        </Svg>
      </Animated.View>
    );
  };

  const centerContentTop = variant === 'semicircle' ? cy + normalize(10) : cy - normalize(15);
  const titleTop = variant === 'semicircle' ? centerContentTop + normalize(26) : centerContentTop + normalize(32);

  return (
    <Animated.View
      accessible={true}
      accessibilityRole={interactive ? 'adjustable' : 'image'}
      accessibilityLabel={title}
      accessibilityValue={{ min: safeMin, max: safeMax, now: clampedValue }}
      style={[
        styles.gaugeContainer,
        {
          width: containerWidth,
          height: containerHeight,
          transform: [{ scale: entranceAnimation }],
        },
        containerStyle,
      ]}
      {...(panResponder ? panResponder.panHandlers : {})}
    >
      <Svg width={containerWidth} height={containerHeight} style={styles.svgCanvas}>
        {gradientColors && gradientColors.length >= 2 && (
          <Defs>
            <LinearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {gradientColors.map((gColor, idx) => (
                <Stop
                  key={`stop-${idx}`}
                  offset={`${(idx / (gradientColors.length - 1)) * 100}%`}
                  stopColor={gColor}
                  stopOpacity={1}
                />
              ))}
            </LinearGradient>
          </Defs>
        )}

        {!Array.isArray(ranges) || ranges.length === 0 ? (
          <Path
            d={backgroundArcPath}
            stroke={backgroundColor}
            strokeWidth={stroke}
            strokeLinecap={strokeLinecap}
            fill="none"
          />
        ) : (
          ranges.map((rng, rIdx) => {
            const rFrom = clampValue(rng.from, safeMin, safeMax);
            const rTo = clampValue(rng.to, safeMin, safeMax);
            const rStartFrac = (rFrom - safeMin) / (safeMax - safeMin);
            const rEndFrac = (rTo - safeMin) / (safeMax - safeMin);
            const rPath = describeArc(cx, cy, trackRadius, startAngle + rStartFrac * sweepAngle, startAngle + rEndFrac * sweepAngle);
            return (
              <Path
                key={`range-arc-${rIdx}`}
                d={rPath}
                stroke={rng.color}
                strokeWidth={stroke}
                strokeLinecap="butt"
                fill="none"
              />
            );
          })
        )}

        {progressArcPath ? (
          <Path
            d={progressArcPath}
            stroke={gradientColors && gradientColors.length >= 2 ? `url(#${gradientId})` : effectivePrimaryColor}
            strokeWidth={stroke}
            strokeLinecap={strokeLinecap}
            fill="none"
          />
        ) : null}

        {showScale &&
          scaleMarks.map((mark) => (
            <React.Fragment key={mark.key}>
              <Line
                x1={mark.x1}
                y1={mark.y1}
                x2={mark.x2}
                y2={mark.y2}
                stroke={mark.isMajor ? majorTickColor || secondaryTextColor : minorTickColor || backgroundColor}
                strokeWidth={
                  mark.isMajor
                    ? majorTickWidth || Math.max(normalize(1.8), gaugeSize * 0.009)
                    : minorTickWidth || Math.max(normalize(1.0), gaugeSize * 0.005)
                }
                strokeLinecap="round"
              />
              {showTickLabels && mark.isMajor && mark.labelX !== undefined && (
                <SvgText
                  x={mark.labelX}
                  y={mark.labelY + 4}
                  fontSize={tickLabelFontSize || Math.max(normalize(9), gaugeSize * 0.048)}
                  fill={tickLabelColor || secondaryTextColor}
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {typeof tickLabelFormatter === 'function' ? tickLabelFormatter(mark.value) : mark.value.toFixed(0)}
                </SvgText>
              )}
            </React.Fragment>
          ))}
      </Svg>

      {renderNeedleElement()}

      {showValue && (
        <View pointerEvents="none" style={[styles.centerContent, { top: centerContentTop }]}>
          {typeof renderCenterContent === 'function' ? (
            renderCenterContent(displayValue, clampedValue)
          ) : (
            <Text
              style={[
                styles.valueText,
                { color: textColor, fontSize: Math.max(normalize(18), gaugeSize * 0.095) },
                valueStyle,
              ]}
            >
              {formattedValue}
              {unit ? (
                <Text
                  style={[
                    styles.unitText,
                    { color: secondaryTextColor, fontSize: Math.max(normalize(12), gaugeSize * 0.06) },
                    unitStyle,
                  ]}
                >
                  {` ${unit}`}
                </Text>
              ) : null}
            </Text>
          )}
        </View>
      )}

      {title ? (
        <View pointerEvents="none" style={[styles.titleContainer, { top: titleTop }]}>
          <Text
            style={[
              styles.titleText,
              { color: secondaryTextColor, fontSize: Math.max(normalize(12), gaugeSize * 0.062) },
              titleStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      ) : null}
    </Animated.View>
  );
};

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

export default CircularDialGauge;