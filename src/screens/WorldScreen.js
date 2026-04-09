import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Dimensions, Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useGame } from '../context/GameContext';
import { getHouseEmoji } from '../data/houseParts';

const { width } = Dimensions.get('window');

const STATUS_CONFIG = {
  IDLE: { icon: '💤', label: 'Idle', color: '#444', bg: '#111' },
  FOCUSING: { icon: '⚔️', label: 'Focusing', color: '#00F5FF', bg: '#001820' },
  SHORT_BREAK: { icon: '☕', label: 'Break', color: '#FF6B35', bg: '#200A00' },
  LONG_BREAK: { icon: '🌙', label: 'Resting', color: '#C77DFF', bg: '#150020' },
};

// Mock members for demo — in real app these come from Firebase/Supabase
const DEMO_MEMBERS = [
  {
    id: 'demo_1', name: 'Aria', avatar: '🧝',
    status: 'FOCUSING', builtParts: ['floor_wood', 'wall_stone', 'roof_iron'],
  },
  {
    id: 'demo_2', name: 'Zeke', avatar: '🧙',
    status: 'SHORT_BREAK', builtParts: ['floor_wood'],
  },
  {
    id: 'demo_3', name: 'Luna', avatar: '🧚',
    status: 'IDLE', builtParts: [],
  },
];

function MemberPlot({ member, isMe = false }) {
  const status = STATUS_CONFIG[member.status] || STATUS_CONFIG.IDLE;
  const houseEmoji = getHouseEmoji(member.builtParts?.length ?? 0);

  return (
    <View style={[styles.plot, isMe && styles.plotMe, { borderColor: isMe ? '#00F5FF55' : '#1A1A2E' }]}>
      {isMe && <Text style={styles.meBadge}>YOU</Text>}

      {/* House */}
      <Text style={styles.plotHouse}>{houseEmoji}</Text>

      {/* Avatar + status */}
      <View style={[styles.avatarBubble, { backgroundColor: status.bg, borderColor: status.color + '66' }]}>
        <Text style={styles.avatarEmoji}>{member.avatar}</Text>
      </View>

      {/* Status badge */}
      <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
        <Text style={styles.statusIcon}>{status.icon}</Text>
        <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
      </View>

      {/* Name */}
      <Text style={styles.memberName}>{member.name}</Text>
    </View>
  );
}

export default function WorldScreen() {
  const { state, dispatch } = useGame();
  const [joinCode, setJoinCode] = useState('');
  const [showJoinInput, setShowJoinInput] = useState(false);

  const inGroup = !!state.group;
  const groupCode = state.group?.code;

  const myStatus = 'IDLE'; // In real app: comes from PomodoroScreen via context
  const myBuiltCount = state.builtParts.length;
  const myMember = {
    id: 'me',
    name: state.myName,
    avatar: state.myAvatar,
    status: myStatus,
    builtParts: state.builtParts,
  };

  const allMembers = inGroup
    ? [myMember, ...DEMO_MEMBERS]
    : [myMember];

  function handleCreate() {
    dispatch({ type: 'CREATE_GROUP' });
  }

  function handleJoin() {
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) return;
    dispatch({ type: 'JOIN_GROUP', code });
    setJoinCode('');
    setShowJoinInput(false);
  }

  function handleLeave() {
    dispatch({ type: 'LEAVE_GROUP' });
  }

  return (
    <LinearGradient colors={['#0D0D1A', '#080812']} style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* World header */}
        <View style={styles.worldHeader}>
          <Text style={styles.worldTitle}>🌍 POMODORO WORLD</Text>
          {inGroup ? (
            <View style={styles.codeBox}>
              <Text style={styles.codeLabel}>GROUP CODE</Text>
              <Text style={styles.code}>{groupCode}</Text>
              <Text style={styles.codeHint}>Share this code with friends!</Text>
            </View>
          ) : (
            <Text style={styles.worldSub}>Join or create a group to share your world</Text>
          )}
        </View>

        {/* Group actions */}
        {!inGroup ? (
          <View style={styles.groupActions}>
            <TouchableOpacity style={styles.createBtn} onPress={handleCreate} activeOpacity={0.8}>
              <Text style={styles.createBtnText}>+ CREATE GROUP</Text>
            </TouchableOpacity>

            {showJoinInput ? (
              <View style={styles.joinRow}>
                <TextInput
                  style={styles.joinInput}
                  placeholder="Enter code..."
                  placeholderTextColor="#333"
                  value={joinCode}
                  onChangeText={setJoinCode}
                  autoCapitalize="characters"
                  maxLength={8}
                />
                <TouchableOpacity style={styles.joinConfirmBtn} onPress={handleJoin} activeOpacity={0.8}>
                  <Text style={styles.joinConfirmText}>JOIN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.joinBtn} onPress={() => setShowJoinInput(true)} activeOpacity={0.8}>
                <Text style={styles.joinBtnText}>JOIN GROUP</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave} activeOpacity={0.8}>
            <Text style={styles.leaveBtnText}>LEAVE GROUP</Text>
          </TouchableOpacity>
        )}

        {/* World map */}
        <Text style={styles.sectionTitle}>
          {inGroup ? 'YOUR NEIGHBORHOOD' : 'YOUR PLOT'}
        </Text>

        {inGroup && (
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>{allMembers.length} members online (demo)</Text>
          </View>
        )}

        {/* Plots grid */}
        <View style={styles.plotsGrid}>
          {allMembers.map((member) => (
            <MemberPlot
              key={member.id}
              member={member}
              isMe={member.id === 'me'}
            />
          ))}
          {/* Empty plot slots */}
          {inGroup && allMembers.length < 4 && (
            <View style={[styles.plot, styles.plotEmpty]}>
              <Text style={styles.emptyPlotText}>⋯</Text>
              <Text style={styles.emptySlotLabel}>Open Slot</Text>
            </View>
          )}
        </View>

        {/* Status legend */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>STATUS LEGEND</Text>
        <View style={styles.legendCard}>
          {Object.values(STATUS_CONFIG).map((s) => (
            <View key={s.label} style={styles.legendRow}>
              <Text style={styles.legendIcon}>{s.icon}</Text>
              <Text style={[styles.legendLabel, { color: s.color }]}>{s.label}</Text>
              <Text style={styles.legendDesc}>
                {s.label === 'Focusing' ? 'Running a Pomodoro session'
                  : s.label === 'Break' ? 'On a short break'
                  : s.label === 'Resting' ? 'Taking a long break'
                  : 'Timer not running'}
              </Text>
            </View>
          ))}
        </View>

        {/* Backend note */}
        <View style={styles.betaNote}>
          <Text style={styles.betaNoteText}>
            🔧  Real-time group sync coming soon — powered by Firebase/Supabase.
            Demo members are shown as placeholders.
          </Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const PLOT_SIZE = (width - 44 - 12) / 2;

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 22, paddingTop: 16 },

  worldHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  worldTitle: { color: '#CCC', fontSize: 18, fontWeight: '900', letterSpacing: 3, marginBottom: 10 },
  worldSub: { color: '#333', fontSize: 12, textAlign: 'center' },
  codeBox: {
    alignItems: 'center',
    backgroundColor: '#0A0A16',
    borderRadius: 16, borderWidth: 1.5, borderColor: '#00F5FF33',
    paddingVertical: 14, paddingHorizontal: 28,
  },
  codeLabel: { color: '#444', fontSize: 10, letterSpacing: 2, marginBottom: 4 },
  code: { color: '#00F5FF', fontSize: 30, fontWeight: '900', letterSpacing: 6 },
  codeHint: { color: '#333', fontSize: 10, marginTop: 4 },

  groupActions: { gap: 10, marginBottom: 24 },
  createBtn: {
    backgroundColor: '#001820', borderWidth: 1.5, borderColor: '#00F5FF',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  createBtnText: { color: '#00F5FF', fontSize: 13, fontWeight: '900', letterSpacing: 2.5 },
  joinBtn: {
    backgroundColor: '#0A0A16', borderWidth: 1.5, borderColor: '#2A2A3E',
    borderRadius: 14, paddingVertical: 14, alignItems: 'center',
  },
  joinBtnText: { color: '#555', fontSize: 13, fontWeight: '700', letterSpacing: 2 },
  joinRow: { flexDirection: 'row', gap: 10 },
  joinInput: {
    flex: 1, backgroundColor: '#0A0A16', borderWidth: 1.5, borderColor: '#2A2A3E',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    color: '#EEE', fontSize: 16, fontWeight: '700', letterSpacing: 3,
  },
  joinConfirmBtn: {
    backgroundColor: '#001820', borderWidth: 1.5, borderColor: '#00F5FF',
    borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center',
  },
  joinConfirmText: { color: '#00F5FF', fontWeight: '900', fontSize: 13, letterSpacing: 2 },
  leaveBtn: {
    backgroundColor: '#1A0808', borderWidth: 1, borderColor: '#FF444422',
    borderRadius: 12, paddingVertical: 10, alignItems: 'center', marginBottom: 20,
  },
  leaveBtnText: { color: '#FF4444', fontSize: 11, fontWeight: '700', letterSpacing: 2 },

  sectionTitle: { color: '#444', fontSize: 11, fontWeight: '800', letterSpacing: 3, marginBottom: 8 },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00F5FF' },
  onlineText: { color: '#444', fontSize: 11 },

  plotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  plot: {
    width: PLOT_SIZE,
    backgroundColor: '#0A0A16',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    position: 'relative',
  },
  plotMe: { backgroundColor: '#001014' },
  plotEmpty: { borderStyle: 'dashed', borderColor: '#1A1A2E', justifyContent: 'center', minHeight: 160 },
  meBadge: {
    position: 'absolute', top: 10, right: 10,
    color: '#00F5FF', fontSize: 9, fontWeight: '900', letterSpacing: 1.5,
  },
  plotHouse: { fontSize: 42 },
  avatarBubble: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5,
  },
  avatarEmoji: { fontSize: 26 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
  },
  statusIcon: { fontSize: 12 },
  statusLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  memberName: { color: '#888', fontSize: 12, fontWeight: '600' },
  emptyPlotText: { color: '#1A1A2E', fontSize: 36 },
  emptySlotLabel: { color: '#1A1A2E', fontSize: 10, letterSpacing: 2 },

  legendCard: {
    backgroundColor: '#0A0A16', borderRadius: 16,
    borderWidth: 1, borderColor: '#14142A',
    padding: 16, gap: 12, marginBottom: 16,
  },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  legendIcon: { fontSize: 16, width: 24 },
  legendLabel: { width: 80, fontWeight: '700', fontSize: 12 },
  legendDesc: { flex: 1, color: '#333', fontSize: 11 },

  betaNote: {
    backgroundColor: '#100800', borderRadius: 12,
    borderWidth: 1, borderColor: '#2A1800',
    padding: 14,
  },
  betaNoteText: { color: '#554433', fontSize: 11, lineHeight: 17 },
});
