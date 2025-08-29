import React from 'react';
import { ViewStyle, TextStyle } from 'react-native';

export interface CircularDialGaugeProps {
  /**
   * Current value to display
   * @default 0
   */
  value?: number;
  
  /**
   * Maximum value of the gauge
   * @default 100
   */
  maxValue?: number;
  
  /**
   * Minimum value of the gauge
   * @default 0
   */
  minValue?: number;
  
  /**
   * Title text displayed below the gauge
   * @default "Value"
   */
  title?: string;
  
  /**
   * Unit text displayed with the value
   * @default ""
   */
  unit?: string;
  
  /**
   * Size of the gauge container (will be overridden by width/height if provided)
   */
  size?: number;
  
  /**
   * Width of the gauge container
   */
  width?: number;
  
  /**
   * Height of the gauge container
   */
  height?: number;
  
  /**
   * Primary color for the gauge
   * @default "#4CAF50"
   */
  color?: string;
  
  /**
   * Background color of the gauge track
   * @default "#E0E0E0"
   */
  backgroundColor?: string;
  
  /**
   * Color for primary text elements
   * @default "#333333"
   */
  textColor?: string;
  
  /**
   * Color for secondary text elements
   * @default "#666666"
   */
  secondaryTextColor?: string;
  
  /**
   * Width of the progress stroke
   */
  strokeWidth?: number;
  
  /**
   * Duration of animations in milliseconds
   * @default 1200
   */
  animationDuration?: number;
  
  /**
   * Whether to show scale marks
   * @default true
   */
  showScale?: boolean;
  
  /**
   * Whether to show the needle indicator
   * @default true
   */
  showNeedle?: boolean;
  
  /**
   * Number of decimal places for value display
   * @default 1
   */
  decimalPlaces?: number;
  
  /**
   * Additional styles for the container
   */
  containerStyle?: ViewStyle;
  
  /**
   * Additional styles for the title text
   */
  titleStyle?: TextStyle;
  
  /**
   * Additional styles for the value text
   */
  valueStyle?: TextStyle;
}

declare const CircularDialGauge: React.FC<CircularDialGaugeProps>;

export default CircularDialGauge;