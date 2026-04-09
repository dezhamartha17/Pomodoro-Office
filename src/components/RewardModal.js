import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, Animated,
  StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RARITIES } from '../data/items';

const { width } = Dimensions.get('window');

// Single flying particle
function Particle({ color }) {
  const pos = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const angle = useRef(Math.random() * 2 * Math.PI).current;
  const dist = useRef(70 + Math.random() * 90).current;
  const delay = useRef(Math.random() * 300).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.timing(pos, {
          toValue: {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
          },
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: 7, height: 7,
        borderRadius: 4,
        backgroundColor: color,
        opacity,
        transform: [{ translateX: pos.x }, { translateY: pos.y }],
      }}
    />
  );
}

export default function RewardModal({ visible, reward, onClaim }) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.4)).current;
  const [showParticles, setShowParticles] = useState(false);
  const glowLoop = useRef(null);

  useEffect(() => {
    if (visible && reward) {
      setShowParticles(false);
      overlayOpacity.setValue(0);
      cardScale.setValue(0);
      iconScale.setValue(0);
      glowPulse.setValue(0.4);

      Animated.sequence([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(cardScale, {
          toValue: 1, friction: 6, tension: 110, useNativeDriver: true,
        }),
        Animated.spring(iconScale, {
          toValue: 1, friction: 5, tension: 90, useNativeDriver: true,
        }),
      ]).start(() => {
        setShowParticles(true);
        glowLoop.current = Animated.loop(
          Animated.sequence([
            Animated.timing(glowPulse, { toValue: 1, duration: 900, useNativeDriver: true }),
            Animated.timing(glowPulse, { toValue: 0.4, duration: 900, useNativeDriver: true }),
          ])
        );
        glowLoop.current.start();
      });
    } else {
      glowLoop.current?.stop();
    }
  }, [visible, reward]);

  if (!reward) return null;

  const rarityStyle = RARITIES[reward.rarity];
  const isShiny = reward.rarity === 'RARE' || reward.rarity === 'ULTRA_RARE';
  const particleCount = reward.rarity === 'ULTRA_RARE' ? 18 : reward.rarity === 'RARE' ? 12 : 0;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <Animated.View style={{ transform: [{ scale: cardScale }] }}>
          <LinearGradient
            colors={rarityStyle.gradColors}
            style={[styles.card, { borderColor: rarityStyle.color + '66' }]}
          >
            {/* Rarity badge */}
            <View style={[styles.rarityBadge, { borderColor: rarityStyle.color }]}>
              <Text style={[styles.rarityLabel, { color: rarityStyle.color }]}>
                {rarityStyle.label.toUpperCase()}
              </Text>
            </View>

            {/* Item icon with glow + particles */}
            <View style={styles.iconArea}>
              {showParticles &&
                Array.from({ length: particleCount }).map((_, i) => (
                  <Particle key={i} color={rarityStyle.color} />
                ))}
              <Animated.Text
                style={[
                  styles.itemIcon,
                  isShiny && {
                    textShadowColor: rarityStyle.color,
                    textShadowRadius: glowPulse.interpolate({
                      inputRange: [0, 1],
                      outputRange: [8, 28],
                    }),
                  },
                  { transform: [{ scale: iconScale }] },
                ]}
              >
                {reward.item.emoji}
              </Animated.Text>
            </View>

            {/* Item info */}
            <Text style={styles.itemName}>{reward.item.label}</Text>
            <Text style={styles.itemDesc}>{reward.item.description}</Text>

            <View style={styles.rewardRow}>
              <View style={[styles.qtyBadge, { backgroundColor: rarityStyle.color + '22' }]}>
                <Text style={[styles.qtyText, { color: rarityStyle.color }]}>x{reward.qty}</Text>
              </View>
              <View style={styles.coinBadge}>
                <Text style={styles.coinText}>🪙 +{reward.coinBonus}</Text>
              </View>
            </View>

            {/* Claim button */}
            <TouchableOpacity
              style={[styles.claimBtn, { borderColor: rarityStyle.color }]}
              onPress={onClaim}
              activeOpacity={0.8}
            >
              <Text style={[styles.claimText, { color: rarityStyle.color }]}>
                COLLECT
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: width * 0.78,
    borderRadius: 28,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 28,
  },
  rarityBadge: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
    marginBottom: 28,
  },
  rarityLabel: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2.5,
  },
  iconArea: {
    width: 130,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  itemIcon: {
    fontSize: 80,
  },
  itemName: {
    color: '#EEE',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  itemDesc: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  qtyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
  },
  qtyText: {
    fontSize: 18,
    fontWeight: '900',
  },
  coinBadge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#1A1400',
  },
  coinText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '700',
  },
  claimBtn: {
    paddingHorizontal: 52,
    paddingVertical: 14,
    borderRadius: 50,
    borderWidth: 2,
  },
  claimText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 3,
  },
});
