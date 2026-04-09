import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { HOUSE_PART_LIST, getHouseEmoji, getHouseTitle } from '../data/houseParts';
import { ITEMS } from '../data/items';

const { width } = Dimensions.get('window');

function CostRow({ cost, inventory }) {
  return (
    <View style={styles.costRow}>
      {Object.entries(cost).map(([matId, qty]) => {
        const item = ITEMS[matId];
        const have = inventory[matId] || 0;
        const enough = have >= qty;
        return (
          <View key={matId} style={styles.costItem}>
            <Text style={styles.costEmoji}>{item?.emoji ?? '?'}</Text>
            <Text style={[styles.costQty, !enough && styles.costShort]}>
              {have}/{qty}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function PartCard({ part, isBuilt, canAfford, onBuild }) {
  return (
    <View
      style={[
        styles.partCard,
        isBuilt && styles.partCardBuilt,
        !isBuilt && canAfford && styles.partCardAffordable,
      ]}
    >
      <Text style={styles.partEmoji}>{part.emoji}</Text>
      <View style={styles.partInfo}>
        <Text style={styles.partName}>{part.label}</Text>
        <Text style={styles.partDesc}>{part.description}</Text>
        {!isBuilt && <CostRow cost={part.cost} inventory={canAfford !== undefined ? {} : {}} />}
      </View>
      {isBuilt ? (
        <View style={styles.builtBadge}>
          <Text style={styles.builtText}>✓</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.buildBtn, !canAfford && styles.buildBtnDisabled]}
          onPress={canAfford ? onBuild : undefined}
          activeOpacity={canAfford ? 0.7 : 1}
        >
          <Text style={[styles.buildBtnText, !canAfford && styles.buildBtnTextDisabled]}>
            BUILD
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function HouseScreen() {
  const { state, dispatch } = useGame();
  const { inventory, builtParts } = state;
  const builtSet = new Set(builtParts);
  const builtCount = builtParts.length;

  const houseEmoji = getHouseEmoji(builtCount);
  const houseTitle = getHouseTitle(builtCount);
  const totalParts = HOUSE_PART_LIST.length;

  function canAffordPart(part) {
    return Object.entries(part.cost).every(
      ([mat, qty]) => (inventory[mat] || 0) >= qty
    );
  }

  function buildPart(part) {
    dispatch({ type: 'BUILD_PART', partId: part.id, cost: part.cost });
  }

  return (
    <LinearGradient colors={['#0D0D1A', '#080812']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* House Preview */}
        <View style={styles.housePreview}>
          <Text style={styles.houseEmoji}>{houseEmoji}</Text>
          <Text style={styles.houseTitle}>{houseTitle}</Text>
          <Text style={styles.houseProgress}>
            {builtCount}/{totalParts} parts built
          </Text>

          {/* Progress bar */}
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${(builtCount / totalParts) * 100}%` },
              ]}
            />
          </View>

          {/* Built part icons */}
          {builtCount > 0 && (
            <View style={styles.builtIconRow}>
              {HOUSE_PART_LIST.filter((p) => builtSet.has(p.id)).map((p) => (
                <Text key={p.id} style={styles.builtIcon}>{p.emoji}</Text>
              ))}
            </View>
          )}
        </View>

        {/* Build list */}
        <Text style={styles.sectionTitle}>BUILD PARTS</Text>
        <Text style={styles.sectionSub}>
          Collect materials from Pomodoro rewards to build
        </Text>

        {HOUSE_PART_LIST.map((part) => {
          const isBuilt = builtSet.has(part.id);
          const affordable = !isBuilt && canAffordPart(part);
          return (
            <View key={part.id}>
              {/* Show cost row inline in PartCard */}
              <View
                style={[
                  styles.partCard,
                  isBuilt && styles.partCardBuilt,
                  !isBuilt && affordable && styles.partCardAffordable,
                ]}
              >
                <Text style={styles.partEmoji}>{part.emoji}</Text>
                <View style={styles.partInfo}>
                  <Text style={styles.partName}>{part.label}</Text>
                  <Text style={styles.partDesc}>{part.description}</Text>
                  {!isBuilt && (
                    <View style={styles.costRow}>
                      {Object.entries(part.cost).map(([matId, qty]) => {
                        const item = ITEMS[matId];
                        const have = inventory[matId] || 0;
                        const enough = have >= qty;
                        return (
                          <View key={matId} style={styles.costItem}>
                            <Text style={styles.costEmoji}>{item?.emoji ?? '?'}</Text>
                            <Text style={[styles.costQty, !enough && styles.costShort]}>
                              {have}/{qty}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
                {isBuilt ? (
                  <View style={styles.builtBadge}>
                    <Text style={styles.builtText}>✓</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.buildBtn, !affordable && styles.buildBtnDisabled]}
                    onPress={affordable ? () => buildPart(part) : undefined}
                    activeOpacity={affordable ? 0.7 : 1}
                  >
                    <Text style={[styles.buildBtnText, !affordable && styles.buildBtnTextDisabled]}>
                      BUILD
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 16 },

  housePreview: {
    backgroundColor: '#0A0A16',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#14142A',
    alignItems: 'center',
    padding: 28,
    marginBottom: 28,
  },
  houseEmoji: { fontSize: 80, marginBottom: 10 },
  houseTitle: { color: '#EEE', fontSize: 20, fontWeight: '800', marginBottom: 4 },
  houseProgress: { color: '#444', fontSize: 12, letterSpacing: 1.5, marginBottom: 12 },
  progressBarBg: {
    width: '80%', height: 5,
    backgroundColor: '#14142A', borderRadius: 3, overflow: 'hidden', marginBottom: 14,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00F5FF',
    borderRadius: 3,
  },
  builtIconRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  builtIcon: { fontSize: 22 },

  sectionTitle: { color: '#444', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 4 },
  sectionSub: { color: '#2A2A3E', fontSize: 11, marginBottom: 14 },

  partCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A16',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#14142A',
    padding: 16,
    marginBottom: 10,
    gap: 14,
  },
  partCardBuilt: { borderColor: '#00F5FF33', backgroundColor: '#001A1A' },
  partCardAffordable: { borderColor: '#00F5FF66' },
  partEmoji: { fontSize: 36 },
  partInfo: { flex: 1, gap: 3 },
  partName: { color: '#CCC', fontSize: 14, fontWeight: '700' },
  partDesc: { color: '#444', fontSize: 11, lineHeight: 15 },
  costRow: { flexDirection: 'row', gap: 10, marginTop: 6, flexWrap: 'wrap' },
  costItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  costEmoji: { fontSize: 13 },
  costQty: { color: '#666', fontSize: 11, fontWeight: '700' },
  costShort: { color: '#FF4444' },

  builtBadge: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#001A1A',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#00F5FF55',
  },
  builtText: { color: '#00F5FF', fontSize: 18, fontWeight: '900' },
  buildBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 10, borderWidth: 1.5, borderColor: '#00F5FF',
  },
  buildBtnDisabled: { borderColor: '#2A2A3E' },
  buildBtnText: { color: '#00F5FF', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  buildBtnTextDisabled: { color: '#2A2A3E' },
});
