import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Svg, { Line, Text as SvgText } from "react-native-svg";

const { width: screenWidth } = Dimensions.get('window');

// Responsive utility functions
const normalize = (size) => {
  const scale = screenWidth / 375; // Base width (iPhone X)
  const newSize = size * scale;
  return Math.max(newSize, size * 0.8); // Minimum scale factor
};

const isTablet = screenWidth >= 768;
const wp = (percentage) => (screenWidth * percentage) / 100;

/**
 * CircularDialGauge - A beautiful, customizable circular dial gauge component
 */
const CircularDialGauge = ({
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
}) => {
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
    // Default responsive behavior
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

  // Calculate responsive stroke width
  const progressStrokeWidth = strokeWidth || Math.max(normalize(8), gaugeSize * 0.05);

  // Animation refs
  const scaleAnimation = useRef(new Animated.Value(0)).current;
  const dialRotation = useRef(new Animated.Value(0)).current;
  const valueAnimation = useRef(new Animated.Value(minValue)).current;

  // Validate and clamp value
  const clampedValue = Math.max(minValue, Math.min(maxValue, value));

  useEffect(() => {
    // Animate the scale
    Animated.timing(scaleAnimation, {
      toValue: 1,
      duration: animationDuration * 0.6,
      useNativeDriver: true,
    }).start();

    // Animate the dial needle and value
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

  // Calculate progress percentage for circular progress
  const progressPercentage = Math.max(
    0,
    Math.min(100, ((clampedValue - minValue) / (maxValue - minValue)) * 100)
  );

  // Generate scale marks
  const generateScaleMarks = () => {
    if (!showScale) return [];
    
    const marks = [];
    const centerX = gaugeSize * 0.5;
    const centerY = gaugeSize * 0.5;
    const radius = gaugeSize * 0.35;
    const startAngle = 180; // Start from left
    const endAngle = 360; // End at right
    const totalAngle = endAngle - startAngle;

    // Major marks (5 marks: min, 25%, 50%, 75%, max)
    for (let i = 0; i <= 4; i++) {
      const angle = startAngle + (totalAngle / 4) * i;
      const radian = (angle * Math.PI) / 180;

      // Outer tick position
      const outerX = centerX + Math.cos(radian) * radius;
      const outerY = centerY + Math.sin(radian) * radius;

      // Inner tick position
      const innerX = centerX + Math.cos(radian) * (radius - normalize(12));
      const innerY = centerY + Math.sin(radian) * (radius - normalize(12));

      // Label position
      const labelX = centerX + Math.cos(radian) * (radius + normalize(12));
      const labelY = centerY + Math.sin(radian) * (radius + normalize(12));

      // Calculate value for this mark
      let markValue;
      if (i === 0) markValue = minValue;
      else if (i === 4) markValue = maxValue;
      else markValue = minValue + ((maxValue - minValue) / 4) * i;

      marks.push({
        key: i,
        angle,
        outerX,
        outerY,
        innerX,
        innerY,
        labelX,
        labelY,
        value: markValue,
        isMajor: true,
      });
    }

    // Minor marks (between major marks)
    for (let i = 0; i < 4; i++) {
      for (let j = 1; j < 4; j++) {
        const angle = startAngle + (totalAngle / 4) * i + (totalAngle / 16) * j;
        const radian = (angle * Math.PI) / 180;

        const outerX = centerX + Math.cos(radian) * radius;
        const outerY = centerY + Math.sin(radian) * radius;
        const innerX = centerX + Math.cos(radian) * (radius - normalize(6));
        const innerY = centerY + Math.sin(radian) * (radius - normalize(6));

        marks.push({
          key: `${i}-${j}`,
          angle,
          outerX,
          outerY,
          innerX,
          innerY,
          isMajor: false,
        });
      }
    }

    return marks;
  };

  const scaleMarks = generateScaleMarks();

  return (
    <Animated.View
      style={[
        styles.gaugeContainer,
        {
          width: containerWidth,
          height: containerHeight,
          transform: [{ scale: scaleAnimation }],
        },
        containerStyle,
      ]}
    >
      <View style={styles.circularProgressContainer}>
        <AnimatedCircularProgress
          size={gaugeSize * 0.7}
          width={progressStrokeWidth}
          fill={progressPercentage}
          tintColor={color}
          backgroundColor={backgroundColor}
          rotation={-90}
          arcSweepAngle={180}
          lineCap="round"
          duration={animationDuration}
        />
        
        {showScale && (
          <Svg
            width={gaugeSize}
            height={gaugeSize}
            style={{
              position: "absolute",
              top: -(gaugeSize * 0.15), 
              left: -(gaugeSize * 0.15),
            }}
          >
            {scaleMarks.map((mark) => (
              <React.Fragment key={mark.key}>
                <Line
                  x1={mark.outerX}
                  y1={mark.outerY}
                  x2={mark.innerX}
                  y2={mark.innerY}
                  stroke={secondaryTextColor}
                  strokeWidth={mark.isMajor ? Math.max(normalize(2), gaugeSize * 0.01) : Math.max(normalize(1), gaugeSize * 0.005)}
                  strokeLinecap="round"
                />

                {mark.isMajor && mark.labelX && (
                  <SvgText
                    x={mark.labelX}
                    y={mark.labelY}
                    fontSize={Math.max(normalize(10), gaugeSize * 0.06)}
                    fill={secondaryTextColor}
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    fontWeight="600"
                  >
                    {typeof mark.value === "number"
                      ? mark.value.toFixed(0)
                      : mark.value}
                  </SvgText>
                )}
              </React.Fragment>
            ))}
          </Svg>
        )}

        {showNeedle && (
          <Animated.View
            style={[
              styles.needleContainer,
              {
                width: gaugeSize,
                height: gaugeSize,
                position: "absolute",
                top: -(gaugeSize * 0.15),
                left: -(gaugeSize * 0.15),
                transform: [
                  {
                    rotate: dialRotation.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["180deg", "360deg"],
                    }),
                  },
                ],
              },
            ]}
          >
            <View
              style={[
                styles.needle,
                {
                  width: gaugeSize * 0.3,
                  height: Math.max(normalize(4), gaugeSize * 0.02),
                  backgroundColor: color,
                  borderRadius: Math.max(normalize(2), gaugeSize * 0.01),
                  position: "absolute",
                  top: gaugeSize * 0.5 - Math.max(normalize(2), gaugeSize * 0.01),
                  left: gaugeSize * 0.5,
                },
              ]}
            />
            <View
              style={[
                styles.needleHub,
                {
                  width: normalize(10),
                  height: normalize(10),
                  borderRadius: normalize(5),
                  backgroundColor: color,
                  borderWidth: 2,
                  borderColor: backgroundColor,
                  position: "absolute",
                  top: gaugeSize * 0.5 - normalize(5),
                  left: gaugeSize * 0.5 - normalize(5),
                },
              ]}
            />
          </Animated.View>
        )}
      </View>

      {/* Value Display */}
      <View style={[styles.centerContent, { top: containerHeight * 0.58 }]}>
        <Animated.Text 
          style={[
            styles.valueText, 
            { 
              color: textColor,
              fontSize: Math.max(normalize(16), gaugeSize * 0.08)
            },
            valueStyle,
          ]}
        >
          {valueAnimation._value !== undefined
            ? valueAnimation._value.toFixed(decimalPlaces)
            : clampedValue.toFixed(decimalPlaces)
          } {unit}
        </Animated.Text>
      </View>

      {/* Title */}
      <View style={[styles.titleContainer, { top: containerHeight * 0.7 }]}>
        <Text 
          style={[
            styles.titleText, 
            { 
              color: secondaryTextColor,
              fontSize: Math.max(normalize(14), gaugeSize * 0.07)
            },
            titleStyle,
          ]}
        >
          {title}
        </Text>
      </View>
    </Animated.View>
  );
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
  needleContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  needle: {
    zIndex: 10,
  },
  needleHub: {
    zIndex: 15,
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

export default CircularDialGauge;