import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGame } from '../context/GameContext';

const TABS = [
  { key: 'timer',     icon: '⏱',  label: 'Focus'  },
  { key: 'world',     icon: '🌍',  label: 'World'  },
  { key: 'house',     icon: '🏠',  label: 'House'  },
  { key: 'inventory', icon: '🎒',  label: 'Items'  },
];

export default function TabBar({ activeTab, onTabChange }) {
  const { state } = useGame();

  return (
    <View style={styles.container}>
      {/* Coin display */}
      <View style={styles.coinStrip}>
        <Text style={styles.coinText}>🪙 {state.coins}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tab}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              {active && <View style={styles.activeIndicator} />}
              <Text style={[styles.tabIcon, active && styles.tabIconActive]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#080812',
    borderTopWidth: 1,
    borderTopColor: '#14142A',
  },
  coinStrip: {
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#0F0F20',
  },
  coinText: {
    color: '#FFD700',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tabs: {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 6,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 24,
    height: 2,
    backgroundColor: '#00F5FF',
    borderRadius: 1,
  },
  tabIcon: { fontSize: 22, opacity: 0.4 },
  tabIconActive: { opacity: 1 },
  tabLabel: { color: '#333', fontSize: 10, marginTop: 3, letterSpacing: 1 },
  tabLabelActive: { color: '#CCC' },
});
