import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function CircularTimer({ progress, color, trackColor, size, strokeWidth, children }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const animOffset = useRef(new Animated.Value(circumference * (1 - progress))).current;

  useEffect(() => {
    Animated.timing(animOffset, {
      toValue: circumference * (1 - progress),
      duration: 600,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Outer glow ring */}
        <Circle
          cx={cx} cy={cy} r={radius + strokeWidth / 2 + 2}
          stroke={color}
          strokeWidth={1}
          fill="none"
          opacity={0.12}
        />
        {/* Track ring */}
        <Circle
          cx={cx} cy={cy} r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress ring */}
        <AnimatedCircle
          cx={cx} cy={cy} r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animOffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${cx}, ${cy})`}
        />
        {/* Inner dot glow at progress tip */}
      </Svg>
      {children}
    </View>
  );
}
