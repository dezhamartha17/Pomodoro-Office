import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Animated, Platform, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import CircularTimer from '../components/CircularTimer';
import XPBar, { getLevelInfo } from '../components/XPBar';
import { useGame } from '../context/GameContext';
import { rollReward } from '../data/rewardRoller';

const { width } = Dimensions.get('window');
const TIMER_SIZE = Math.min(width * 0.72, 290);
const STROKE_WIDTH = 13;

const MODES = {
  WORK: {
    label: 'FOCUS', icon: '⚔️', duration: 1 * 60,
    color: '#00F5FF', trackColor: '#00161A', gradColors: ['#0D0D1A', '#081420'],
  },
  SHORT_BREAK: {
    label: 'RECHARGE', icon: '☕', duration: 5 * 60,
    color: '#FF6B35', trackColor: '#1A0B00', gradColors: ['#0D0D1A', '#1A0A06'],
  },
  LONG_BREAK: {
    label: 'REST', icon: '🌙', duration: 15 * 60,
    color: '#C77DFF', trackColor: '#120020', gradColors: ['#0D0D1A', '#10001F'],
  },
};

const formatTime = (s) =>
  `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

function SessionDots({ completed, color }) {
  return (
    <View style={styles.dotsRow}>
      {[0, 1, 2, 3].map((i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < completed
              ? { backgroundColor: color, shadowColor: color, shadowOpacity: 0.9, shadowRadius: 8, elevation: 5 }
              : { backgroundColor: '#1A1A2E' },
          ]}
        />
      ))}
    </View>
  );
}

export default function PomodoroScreen() {
  const { state, dispatch } = useGame();

  const [modeKey, setModeKey] = useState('WORK');
  const [timeLeft, setTimeLeft] = useState(MODES.WORK.duration);
  const [isRunning, setIsRunning] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const xpFloatAnim = useRef(new Animated.Value(0)).current;
  const xpFloatY = useRef(new Animated.Value(0)).current;
  const levelUpAnim = useRef(new Animated.Value(0)).current;
  const [xpFloatText, setXpFloatText] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLabel, setLevelUpLabel] = useState('');

  const intervalRef = useRef(null);
  const onCompleteRef = useRef(null);

  const mode = MODES[modeKey];
  const progress = timeLeft / mode.duration;
  const { level } = getLevelInfo(state.totalXp);

  // Pulse while running
  useEffect(() => {
    if (isRunning) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.02, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    }
  }, [isRunning]);

  const haptic = useCallback((type = 'medium') => {
    if (Platform.OS === 'web') return;
    if (type === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const showXpFloat = useCallback((text) => {
    setXpFloatText(text);
    xpFloatAnim.setValue(1);
    xpFloatY.setValue(0);
    Animated.parallel([
      Animated.timing(xpFloatY, { toValue: -60, duration: 1400, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(xpFloatAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const triggerLevelUp = useCallback((lv, lbl) => {
    setShowLevelUp(true);
    setLevelUpLabel(`LV.${lv}  ${lbl.toUpperCase()}`);
    levelUpAnim.setValue(0);
    Animated.sequence([
      Animated.spring(levelUpAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(levelUpAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start(() => setShowLevelUp(false));
  }, []);

  const handleTimerComplete = useCallback(() => {
    haptic('success');

    if (modeKey === 'WORK') {
      const streakBonus = state.streak >= 3;
      const reward = rollReward(streakBonus);
      const prevLevel = getLevelInfo(state.totalXp).level;

      dispatch({ type: 'COMPLETE_POMODORO', reward });

      const newXp = state.totalXp + 100;
      const newLevel = getLevelInfo(newXp).level;
      if (newLevel > prevLevel) {
        const { title: newTitle } = getLevelInfo(newXp);
        setTimeout(() => triggerLevelUp(newLevel, newTitle), 700);
      }

      const baseCoins = 50 + (streakBonus ? 20 : 0) + reward.coinBonus;
      showXpFloat(`+${baseCoins} 🪙`);

      const nextMode = (state.totalPomodoros + 1) % 4 === 0 ? 'LONG_BREAK' : 'SHORT_BREAK';
      setModeKey(nextMode);
      setTimeLeft(MODES[nextMode].duration);
      setIsRunning(false);
    } else {
      setModeKey('WORK');
      setTimeLeft(MODES.WORK.duration);
      setIsRunning(false);
    }
  }, [modeKey, state.streak, state.totalXp, state.totalPomodoros, dispatch, haptic, showXpFloat, triggerLevelUp]);

  useEffect(() => {
    onCompleteRef.current = handleTimerComplete;
  }, [handleTimerComplete]);

  // Timer tick
  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setTimeout(() => onCompleteRef.current?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStartPause = () => {
    haptic('medium');
    setIsRunning((r) => !r);
  };

  const handleReset = () => {
    haptic('medium');
    setIsRunning(false);
    setTimeLeft(mode.duration);
  };

  const handleSkip = () => {
    haptic('medium');
    dispatch({ type: 'SKIP_POMODORO' });
    setIsRunning(false);
    const nextMode = modeKey === 'WORK'
      ? (state.totalPomodoros % 4 === 3 ? 'LONG_BREAK' : 'SHORT_BREAK')
      : 'WORK';
    setModeKey(nextMode);
    setTimeLeft(MODES[nextMode].duration);
  };

  const handleModeChange = (key) => {
    if (key === modeKey) return;
    setIsRunning(false);
    setModeKey(key);
    setTimeLeft(MODES[key].duration);
  };

  const dotsCompleted = state.totalPomodoros % 4;
  const currentSet = Math.floor(state.totalPomodoros / 4) + 1;

  return (
    <LinearGradient colors={mode.gradColors} style={styles.root}>
      {/* XP Bar reads from context */}
      <XPBar totalXp={state.totalXp} color={mode.color} />

      {/* Mode tabs */}
      <View style={styles.tabs}>
        {Object.entries(MODES).map(([key, m]) => (
          <TouchableOpacity
            key={key}
            onPress={() => handleModeChange(key)}
            style={[styles.tab, modeKey === key && { borderColor: m.color, backgroundColor: m.trackColor }]}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, modeKey === key && { color: m.color }]}>
              {m.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer ring */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <CircularTimer
          progress={progress}
          color={mode.color}
          trackColor={mode.trackColor}
          size={TIMER_SIZE}
          strokeWidth={STROKE_WIDTH}
        >
          <View style={styles.timerContent}>
            <Text style={styles.modeIcon}>{mode.icon}</Text>
            <Text style={[styles.timeDisplay, { color: mode.color }]}>
              {formatTime(timeLeft)}
            </Text>
            <Text style={styles.modeLabel}>{mode.label}</Text>
            {isRunning && <View style={[styles.runningPip, { backgroundColor: mode.color }]} />}
          </View>
        </CircularTimer>
      </Animated.View>

      {/* XP/Coin float */}
      <Animated.Text
        style={[styles.xpFloat, { color: mode.color, opacity: xpFloatAnim, transform: [{ translateY: xpFloatY }] }]}
      >
        {xpFloatText}
      </Animated.Text>

      {/* Session dots */}
      <SessionDots completed={dotsCompleted} color={mode.color} />
      <Text style={styles.setLabel}>SET {currentSet}</Text>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.sideBtn} onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.sideBtnText}>↺</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainBtn, { borderColor: mode.color, shadowColor: mode.color }]}
          onPress={handleStartPause}
          activeOpacity={0.8}
        >
          <Text style={[styles.mainBtnText, { color: mode.color }]}>
            {isRunning ? '⏸  PAUSE' : '▶  START'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sideBtn} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.sideBtnText}>⏭</Text>
        </TouchableOpacity>
      </View>

      {/* Streak */}
      <View style={styles.streakRow}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={[styles.streakCount, state.streak >= 3 && { color: '#FF6B35' }]}>
          {state.streak}
        </Text>
        <Text style={styles.streakLabel}>
          {state.streak >= 3 ? ' STREAK BONUS ACTIVE!' : ' streak'}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsCard}>
        {[
          { val: state.totalPomodoros, lbl: 'DONE' },
          { val: state.streak, lbl: 'STREAK' },
          { val: state.coins, lbl: 'COINS' },
          { val: level, lbl: 'LEVEL' },
        ].map((s, i, arr) => (
          <React.Fragment key={s.lbl}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.lbl}</Text>
            </View>
            {i < arr.length - 1 && <View style={styles.divider} />}
          </React.Fragment>
        ))}
      </View>

      {/* Level Up overlay */}
      {showLevelUp && (
        <Animated.View
          style={[styles.levelUpOverlay, {
            opacity: levelUpAnim,
            transform: [{
              scale: levelUpAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.7, 1.05, 1] }),
            }],
          }]}
          pointerEvents="none"
        >
          <Text style={styles.levelUpTitle}>LEVEL UP!</Text>
          <Text style={styles.levelUpSub}>{levelUpLabel}</Text>
          <Text style={styles.levelUpStars}>★  ★  ★</Text>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
    paddingTop: 8,
    paddingBottom: 4,
  },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  tab: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5, borderColor: '#1E1E30',
  },
  tabText: { color: '#44445A', fontSize: 10, fontWeight: '800', letterSpacing: 1.8 },
  timerContent: { alignItems: 'center' },
  modeIcon: { fontSize: 30, marginBottom: 6 },
  timeDisplay: { fontSize: 54, fontWeight: '900', letterSpacing: 3, fontVariant: ['tabular-nums'] },
  modeLabel: { color: '#44445A', fontSize: 11, letterSpacing: 3.5, marginTop: 5 },
  runningPip: { width: 6, height: 6, borderRadius: 3, marginTop: 8, opacity: 0.9 },
  dotsRow: { flexDirection: 'row', gap: 12, marginTop: 18, marginBottom: 4 },
  dot: { width: 11, height: 11, borderRadius: 6 },
  setLabel: { color: '#2A2A3E', fontSize: 10, letterSpacing: 3, marginBottom: 18 },
  xpFloat: { fontSize: 20, fontWeight: '900', letterSpacing: 1, position: 'absolute', textAlign: 'center' },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
  sideBtn: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#0F0F20', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#1E1E30',
  },
  sideBtnText: { color: '#555', fontSize: 20 },
  mainBtn: {
    paddingHorizontal: 38, paddingVertical: 15,
    borderRadius: 50, borderWidth: 2,
    shadowOpacity: 0.6, shadowRadius: 14, shadowOffset: { width: 0, height: 0 },
    elevation: 8, backgroundColor: 'transparent',
  },
  mainBtnText: { fontSize: 15, fontWeight: '900', letterSpacing: 3 },
  streakRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  streakIcon: { fontSize: 16, marginRight: 4 },
  streakCount: { color: '#555', fontSize: 16, fontWeight: '900' },
  streakLabel: { color: '#333', fontSize: 11, letterSpacing: 1 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#0A0A16', borderRadius: 18,
    paddingVertical: 14, paddingHorizontal: 10,
    width: '100%', borderWidth: 1, borderColor: '#14142A',
  },
  statBox: { flex: 1, alignItems: 'center' },
  statNum: { color: '#DDD', fontSize: 18, fontWeight: '900' },
  statLabel: { color: '#333', fontSize: 9, letterSpacing: 1.5, marginTop: 3 },
  divider: { width: 1, backgroundColor: '#14142A', marginVertical: 4 },
  levelUpOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center', justifyContent: 'center', zIndex: 999,
  },
  levelUpTitle: { color: '#FFD700', fontSize: 50, fontWeight: '900', letterSpacing: 8 },
  levelUpSub: { color: '#FFD700', fontSize: 18, letterSpacing: 4, marginTop: 10, opacity: 0.85 },
  levelUpStars: { color: '#FFD700', fontSize: 28, marginTop: 16, letterSpacing: 12 },
});
