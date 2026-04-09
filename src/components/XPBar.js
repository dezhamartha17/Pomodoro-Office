import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

const XP_PER_LEVEL = 400;

export const LEVEL_TITLES = [
  'Newbie', 'Apprentice', 'Focused', 'Disciplined',
  'Expert', 'Master', 'Legend', 'Grandmaster',
];

export function getLevelInfo(totalXp) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  return { level, xpInLevel, title, xpPerLevel: XP_PER_LEVEL };
}

export default function XPBar({ totalXp, color }) {
  const { level, xpInLevel, title } = getLevelInfo(totalXp);
  const xpProgress = xpInLevel / XP_PER_LEVEL;

  const barAnim = useRef(new Animated.Value(xpProgress)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: xpProgress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [xpProgress]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.badge, { borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>LV.{level}</Text>
        </View>
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <Text style={styles.xpCount}>
          {xpInLevel}
          <Text style={styles.xpMax}>/{XP_PER_LEVEL}</Text>
        </Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View
          style={[
            styles.barFill,
            {
              backgroundColor: color,
              width: barAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              shadowColor: color,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 7 },
  badge: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 10,
  },
  badgeText: { fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  title: {
    flex: 1,
    color: '#666',
    fontSize: 11,
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  xpCount: { color: '#AAA', fontSize: 12, fontWeight: '700' },
  xpMax: { color: '#444', fontSize: 11 },
  barBg: {
    height: 5,
    backgroundColor: '#1A1A2E',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 0 },
    elevation: 3,
  },
});
