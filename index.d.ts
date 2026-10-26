import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export type DialGaugeVariant = 'semicircle' | 'speedometer' | 'circle' | 'custom';
export type DialNeedleType = 'needle' | 'triangle' | 'arrow' | 'line' | 'dot' | 'none';
export type DialAnimationEasing = 'linear' | 'easeOut' | 'spring';
export type DialStrokeLinecap = 'round' | 'butt' | 'square';

export interface DialGaugeRange {
  /** Start value of the range threshold */
  from: number;
  /** End value of the range threshold */
  to: number;
  /** Color code for this range (hex, rgb, etc.) */
  color: string;
  /** Optional descriptive label for this range */
  label?: string;
}

export interface DialTickMark {
  key: string;
  isMajor: boolean;
  angle: number;
  value?: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  labelX?: number;
  labelY?: number;
}

export interface CircularDialGaugeProps {
  /**
   * Current value to display.
   * @default 0
   */
  value?: number;

  /**
   * Maximum value of the gauge.
   * @default 100
   */
  maxValue?: number;

  /**
   * Minimum value of the gauge.
   * @default 0
   */
  minValue?: number;

  /**
   * Dial visual variant.
   * - 'semicircle': 180° arch from 9 o'clock to 3 o'clock (default)
   * - 'speedometer': 270° classic automotive meter from bottom-left to bottom-right
   * - 'circle': 360° full circle gauge
   * - 'custom': custom startAngle and sweepAngle
   * @default 'semicircle'
   */
  variant?: DialGaugeVariant;

  /**
   * Custom starting angle in degrees (0° is 3 o'clock, 90° is 6 o'clock, 180° is 9 o'clock, 270° is 12 o'clock).
   */
  startAngle?: number;

  /**
   * Custom sweep angle in degrees (clockwise).
   */
  sweepAngle?: number;

  /**
   * Square dimension or width base for the gauge. Overridden by width/height if both provided.
   */
  size?: number;

  /**
   * Explicit container width in pixels.
   */
  width?: number;

  /**
   * Explicit container height in pixels.
   */
  height?: number;

  /**
   * Title text displayed below the value.
   * @default "Value"
   */
  title?: string;

  /**
   * Unit text displayed with the value (e.g. "%", "km/h", "°C", "RPM").
   * @default ""
   */
  unit?: string;

  /**
   * Prefix text displayed before the value (e.g. "$").
   * @default ""
   */
  valuePrefix?: string;

  /**
   * Primary active progress color.
   * @default "#4CAF50"
   */
  color?: string;

  /**
   * Background track color.
   * @default "#E0E0E0"
   */
  backgroundColor?: string;

  /**
   * Primary text color for value.
   * @default "#333333"
   */
  textColor?: string;

  /**
   * Secondary text color for title and scale labels.
   * @default "#666666"
   */
  secondaryTextColor?: string;

  /**
   * Stroke width of the progress track. Auto-scales responsively if omitted.
   */
  strokeWidth?: number;

  /**
   * Arc end linecap style.
   * @default 'round'
   */
  strokeLinecap?: DialStrokeLinecap;

  /**
   * Whether to animate value changes and entrance.
   * @default true
   */
  animated?: boolean;

  /**
   * Duration of animations in milliseconds.
   * @default 1000
   */
  animationDuration?: number;

  /**
   * Easing curve for value animation.
   * @default 'easeOut'
   */
  animationEasing?: DialAnimationEasing;

  /**
   * Whether to display scale tick marks and labels.
   * @default true
   */
  showScale?: boolean;

  /**
   * Whether to display the needle indicator.
   * @default true
   */
  showNeedle?: boolean;

  /**
   * Style of the needle indicator.
   * - 'needle': sleek tapered needle (default)
   * - 'triangle': modern sharp pointer
   * - 'line': minimalist thin line
   * - 'dot': orbital dot indicator on the track
   * - 'none': no needle
   * @default 'needle'
   */
  needleType?: DialNeedleType;

  /** Custom color for the needle. Defaults to track color or active range color. */
  needleColor?: string;

  /** Custom length for the needle in pixels. */
  needleLength?: number;

  /** Custom width for the needle base in pixels. */
  needleWidth?: number;

  /** Whether to show the center hub cap. @default true */
  showHub?: boolean;

  /** Radius of the center hub circle. */
  hubRadius?: number;

  /** Color of the center hub circle. */
  hubColor?: string;

  /** Border color of the center hub circle. */
  hubBorderColor?: string;

  /** Border width of the center hub circle. */
  hubBorderWidth?: number;

  /**
   * Custom render function for the needle.
   */
  renderNeedle?: (params: {
    angle: number;
    cx: number;
    cy: number;
    radius: number;
    value: number;
  }) => React.ReactNode;

  /**
   * Number of decimal places to format the numeric value.
   * @default 1
   */
  decimalPlaces?: number;

  /**
   * Whether to show the numeric value display.
   * @default true
   */
  showValue?: boolean;

  /**
   * Custom formatter function for the displayed value.
   */
  valueFormatter?: (value: number) => string;

  /**
   * Custom render function for the entire center content (replaces default value and unit).
   */
  renderCenterContent?: (animatedValue: number, clampedValue: number) => React.ReactNode;

  /**
   * Number of major tick marks.
   * @default 5
   */
  majorTickCount?: number;

  /**
   * Number of minor tick marks between each pair of major marks.
   * @default 3
   */
  minorTicksPerInterval?: number;

  /** Length of major tick marks in pixels. */
  majorTickLength?: number;

  /** Length of minor tick marks in pixels. */
  minorTickLength?: number;

  /** Stroke width of major tick marks in pixels. */
  majorTickWidth?: number;

  /** Stroke width of minor tick marks in pixels. */
  minorTickWidth?: number;

  /** Color of major tick marks. */
  majorTickColor?: string;

  /** Color of minor tick marks. */
  minorTickColor?: string;

  /** Whether to show numeric labels for major ticks. @default true */
  showTickLabels?: boolean;

  /** Distance of tick labels from the scale track. */
  tickLabelDistance?: number;

  /** Color of scale tick labels. */
  tickLabelColor?: string;

  /** Font size of scale tick labels. */
  tickLabelFontSize?: number;

  /** Formatter function for scale tick labels. */
  tickLabelFormatter?: (value: number) => string;

  /**
   * Multi-color threshold segments (e.g., green, yellow, red zones).
   */
  ranges?: DialGaugeRange[];

  /**
   * Array of 2 or more colors to render a smooth linear gradient along the active progress track.
   * Example: `['#00C9FF', '#92FE9D']`
   */
  gradientColors?: string[];

  /**
   * Enable user interaction (touch and drag needle to adjust gauge value).
   * @default false
   */
  interactive?: boolean;

  /**
   * Callback fired continuously while dragging or touching the gauge.
   */
  onValueChange?: (value: number) => void;

  /**
   * Callback fired when touch or drag gesture completes.
   */
  onSlidingComplete?: (value: number) => void;

  /**
   * Step increment to snap values to when interactive (e.g. 1, 5, 0.5).
   */
  step?: number;

  /**
   * Whether user interaction is disabled.
   * @default false
   */
  disabled?: boolean;

  /** Additional styles for the outer container. */
  containerStyle?: ViewStyle;

  /** Additional styles for the title text. */
  titleStyle?: TextStyle;

  /** Additional styles for the value text. */
  valueStyle?: TextStyle;

  /** Additional styles for the unit text. */
  unitStyle?: TextStyle;
}

/**
 * Polar to Cartesian coordinate converter.
 */
export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number };

/**
 * Generates an SVG path 'd' string for an arc.
 */
export function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string;

/**
 * Clamp a numeric value between bounds safely.
 */
export function clampValue(val: number, min: number, max: number): number;

/**
 * Convert touch coordinates to dial value.
 */
export function angleToValue(
  touchX: number,
  touchY: number,
  cx: number,
  cy: number,
  startAngle: number,
  sweepAngle: number,
  minValue: number,
  maxValue: number,
  step?: number
): number;

/**
 * Calculates ticks geometry and labels.
 */
export function calculateTicks(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  sweepAngle: number,
  min: number,
  max: number,
  majorCount?: number,
  minorCount?: number,
  options?: {
    majorTickLength?: number;
    minorTickLength?: number;
    labelDistance?: number;
  }
): DialTickMark[];

/**
 * Find matching color range.
 */
export function getActiveRange(val: number, ranges?: DialGaugeRange[]): DialGaugeRange | null;

/**
 * CircularDialGauge - A beautiful, customizable, interactive circular dial gauge component for React Native.
 */
declare const CircularDialGauge: React.FC<CircularDialGaugeProps> & {
  polarToCartesian: typeof polarToCartesian;
  describeArc: typeof describeArc;
  clampValue: typeof clampValue;
  angleToValue: typeof angleToValue;
  calculateTicks: typeof calculateTicks;
  getActiveRange: typeof getActiveRange;
};

export { CircularDialGauge };
export const DialGauge: typeof CircularDialGauge;
export default CircularDialGauge;