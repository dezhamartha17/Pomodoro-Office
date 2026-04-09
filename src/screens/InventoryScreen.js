import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { ITEMS, RARITIES } from '../data/items';
import { getLevelInfo } from '../components/XPBar';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 44 - 12) / 2;

function MaterialCard({ itemDef, qty }) {
  const rarity = RARITIES[itemDef.rarity];
  const hasItems = qty > 0;

  return (
    <View style={[styles.matCard, { borderColor: hasItems ? rarity.color + '55' : '#1A1A2E' }]}>
      <Text style={[styles.matEmoji, !hasItems && styles.dimmed]}>{itemDef.emoji}</Text>
      <Text style={[styles.matQty, { color: hasItems ? rarity.color : '#333' }]}>
        {qty}
      </Text>
      <Text style={[styles.matName, !hasItems && styles.dimmed]}>{itemDef.label}</Text>
      <View style={[styles.rarityPip, { backgroundColor: rarity.color + (hasItems ? 'CC' : '33') }]} />
    </View>
  );
}

export default function InventoryScreen() {
  const { state } = useGame();
  const { level } = getLevelInfo(state.totalXp);

  const totalItems = Object.values(state.inventory).reduce((a, b) => a + b, 0);

  return (
    <LinearGradient colors={['#0D0D1A', '#080812']} style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header stats */}
        <View style={styles.headerRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>{state.coins}</Text>
            <Text style={styles.statPillLabel}>🪙 Coins</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>{level}</Text>
            <Text style={styles.statPillLabel}>⚡ Level</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>{totalItems}</Text>
            <Text style={styles.statPillLabel}>📦 Items</Text>
          </View>
        </View>

        {/* Section: Materials */}
        <Text style={styles.sectionTitle}>MATERIALS</Text>
        <Text style={styles.sectionSub}>Used for building your house</Text>

        <View style={styles.grid}>
          {Object.values(ITEMS).map((itemDef) => (
            <MaterialCard
              key={itemDef.id}
              itemDef={itemDef}
              qty={state.inventory[itemDef.id] || 0}
            />
          ))}
        </View>

        {/* Section: Rarity guide */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>RARITY GUIDE</Text>
        <View style={styles.rarityGuide}>
          {Object.values(RARITIES).map((r) => (
            <View key={r.key} style={styles.rarityRow}>
              <View style={[styles.rarityDot, { backgroundColor: r.color }]} />
              <Text style={[styles.rarityName, { color: r.color }]}>{r.label}</Text>
              <Text style={styles.rarityChance}>
                {(r.chance * 100).toFixed(0)}% drop rate
              </Text>
              <Text style={styles.rarityCoins}>+{r.coinBonus} 🪙</Text>
            </View>
          ))}
        </View>

        {/* Section: Reward history */}
        <Text style={[styles.sectionTitle, { marginTop: 28 }]}>HOW TO EARN</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLine}>⚔️  Complete a Focus session → random reward drop</Text>
          <Text style={styles.infoLine}>🔥  Streak ≥ 3 → chance to upgrade rarity tier</Text>
          <Text style={styles.infoLine}>🪙  Coins = 50 base + streak bonus + rarity bonus</Text>
          <Text style={styles.infoLine}>🏠  Spend materials in the House tab to build</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 16 },

  headerRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statPill: {
    flex: 1, backgroundColor: '#0A0A16', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#14142A',
  },
  statPillNum: { color: '#EEE', fontSize: 22, fontWeight: '900' },
  statPillLabel: { color: '#444', fontSize: 10, letterSpacing: 1.5, marginTop: 2 },

  sectionTitle: { color: '#444', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  sectionSub: { color: '#2A2A3E', fontSize: 11, marginBottom: 14 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  matCard: {
    width: CARD_SIZE,
    backgroundColor: '#0A0A16',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    position: 'relative',
  },
  matEmoji: { fontSize: 40, marginBottom: 8 },
  dimmed: { opacity: 0.3 },
  matQty: { fontSize: 24, fontWeight: '900', marginBottom: 4 },
  matName: { color: '#888', fontSize: 11, letterSpacing: 1 },
  rarityPip: {
    position: 'absolute', top: 10, right: 10,
    width: 6, height: 6, borderRadius: 3,
  },

  rarityGuide: {
    backgroundColor: '#0A0A16', borderRadius: 16,
    borderWidth: 1, borderColor: '#14142A',
    padding: 16, gap: 12,
  },
  rarityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rarityDot: { width: 8, height: 8, borderRadius: 4 },
  rarityName: { width: 90, fontWeight: '700', fontSize: 13 },
  rarityChance: { flex: 1, color: '#444', fontSize: 11 },
  rarityCoins: { color: '#FFD700', fontSize: 12, fontWeight: '700' },

  infoCard: {
    backgroundColor: '#0A0A16', borderRadius: 16,
    borderWidth: 1, borderColor: '#14142A',
    padding: 16, gap: 10,
  },
  infoLine: { color: '#555', fontSize: 12, lineHeight: 18 },
});
