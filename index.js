const React = require('react');
const { useEffect, useRef, createElement: h } = React;
const { View, Text, Animated, StyleSheet, Dimensions } = require('react-native');

// For environments where these modules might not be available, provide fallbacks
let AnimatedCircularProgress, Svg, Line, SvgText;

try {
  ({ AnimatedCircularProgress } = require('react-native-circular-progress'));
  Svg = require('react-native-svg').default || require('react-native-svg');
  ({ Line, Text: SvgText } = require('react-native-svg'));
} catch (e) {
  // Fallback components for testing environments
  AnimatedCircularProgress = 'AnimatedCircularProgress';
  Svg = 'Svg';
  Line = 'Line';
  SvgText = 'SvgText';
}

const { width: screenWidth } = Dimensions.get('window');

// Responsive utility functions
const normalize = (size) => {
  const scale = screenWidth / 375;
  const newSize = size * scale;
  return Math.max(newSize, size * 0.8);
};

const isTablet = screenWidth >= 768;
const wp = (percentage) => (screenWidth * percentage) / 100;/*
*
 * CircularDialGauge - A beautiful, customizable circular dial gauge component
 */
const CircularDialGauge = (props) => {
  const {
    value = 0,
    maxValue = 100,
    minValue = 0,
    title = "Value",
    unit = "",
    size,
    width,
    height,
    color = "#4CAF50",
    backgroundColor = "#E0E0E0",
    textColor = "#333333",
    secondaryTextColor = "#666666",
    strokeWidth,
    animationDuration = 1200,
    showScale = true,
    showNeedle = true,
    decimalPlaces = 1,
    containerStyle = {},
    titleStyle = {},
    valueStyle = {},
  } = props;

  // Calculate responsive dimensions
  const getResponsiveDimensions = () => {
    if (width && height) {
      return { width, height, size: Math.min(width, height) };
    }
    if (width) {
      return { width, height: width, size: width };
    }
    if (height) {
      return { width: height, height, size: height };
    }
    const responsiveSize = isTablet 
      ? Math.min(wp(40), normalize(200)) 
      : Math.min(wp(45), normalize(180));
    return { 
      width: responsiveSize, 
      height: responsiveSize * 0.8,
      size: responsiveSize 
    };
  };

  const { 
    width: containerWidth, 
    height: containerHeight, 
    size: gaugeSize 
  } = getResponsiveDimensions();

  const progressStrokeWidth = strokeWidth || Math.max(normalize(8), gaugeSize * 0.05);

  // Animation refs
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const dialRotation = useRef(new Animated.Value(0)).current;
  const valueAnimation = useRef(new Animated.Value(minValue)).current;

  // Validate and clamp value
  const clampedValue = Math.max(minValue, Math.min(maxValue, value));

  useEffect(() => {
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: animationDuration * 0.6,
      useNativeDriver: true,
    }).start();

    const percentage = ((clampedValue - minValue) / (maxValue - minValue)) * 100;

    Animated.parallel([
      Animated.timing(dialRotation, {
        toValue: percentage,
        duration: animationDuration,
        useNativeDriver: true,
      }),
      Animated.timing(valueAnimation, {
        toValue: clampedValue,
        duration: animationDuration,
        useNativeDriver: false,
      }),
    ]).start();
  }, [clampedValue, maxValue, minValue, animationDuration]);

  const progressPercentage = Math.max(
    0,
    Math.min(100, ((clampedValue - minValue) / (maxValue - minValue)) * 100)
  );

  return h(Animated.View, {
    style: [
      styles.gaugeContainer,
      {
        width: containerWidth,
        height: containerHeight,
        transform: [{ scale: scaleAnimation }],
      },
      containerStyle,
    ]
  }, [
    h(View, {
      key: 'progress-container',
      style: styles.circularProgressContainer
    }, [
      h(AnimatedCircularProgress, {
        key: 'progress',
        size: gaugeSize * 0.7,
        width: progressStrokeWidth,
        fill: progressPercentage,
        tintColor: color,
        backgroundColor: backgroundColor,
        rotation: -90,
        arcSweepAngle: 180,
        lineCap: "round",
        duration: animationDuration
      })
    ]),

    h(View, {
      key: 'value-container',
      style: [styles.centerContent, { top: containerHeight * 0.58 }]
    }, [
      h(Text, {
        key: 'value-text',
        style: [
          styles.valueText, 
          { 
            color: textColor,
            fontSize: Math.max(normalize(16), gaugeSize * 0.08)
          },
          valueStyle,
        ]
      }, `${clampedValue.toFixed(decimalPlaces)} ${unit}`)
    ]),

    h(View, {
      key: 'title-container',
      style: [styles.titleContainer, { top: containerHeight * 0.7 }]
    }, [
      h(Text, {
        key: 'title-text',
        style: [
          styles.titleText, 
          { 
            color: secondaryTextColor,
            fontSize: Math.max(normalize(14), gaugeSize * 0.07)
          },
          titleStyle,
        ]
      }, title)
    ])
  ]);
};

const styles = StyleSheet.create({
  gaugeContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "transparent",
  },
  circularProgressContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  centerContent: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  valueText: {
    fontWeight: "800",
    textAlign: "center",
  },
  titleContainer: {
    position: "absolute",
    alignItems: "center",
    alignSelf: "center",
  },
  titleText: {
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});

module.exports = CircularDialGauge;