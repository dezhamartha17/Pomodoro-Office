import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GameProvider, useGame } from './src/context/GameContext';
import TabBar from './src/components/TabBar';
import RewardModal from './src/components/RewardModal';
import PomodoroScreen from './src/screens/PomodoroScreen';
import WorldScreen from './src/screens/WorldScreen';
import HouseScreen from './src/screens/HouseScreen';
import InventoryScreen from './src/screens/InventoryScreen';

function AppContent() {
  const [activeTab, setActiveTab] = useState('timer');
  const { state, dispatch } = useGame();

  function handleClaimReward() {
    dispatch({ type: 'CLEAR_REWARD' });
  }

  const Screen = {
    timer: PomodoroScreen,
    world: WorldScreen,
    house: HouseScreen,
    inventory: InventoryScreen,
  }[activeTab] ?? PomodoroScreen;

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Screen />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Reward modal sits at root level so it overlays everything */}
      <RewardModal
        visible={!!state.pendingReward}
        reward={state.pendingReward}
        onClaim={handleClaimReward}
      />
    </View>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D0D1A',
  },
});
