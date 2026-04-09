import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
} from 'react';
import { loadGameState, saveGameState } from '../utils/storage';

const INITIAL_STATE = {
  // Currency
  coins: 0,
  totalXp: 0,

  // Progress
  totalPomodoros: 0,
  streak: 0,

  // Inventory: { itemId: quantity }
  inventory: {},

  // House: Set of built part IDs stored as array
  builtParts: [],

  // Player identity
  myName: 'Player',
  myAvatar: '🧙',

  // Group (local only for now — real sync needs backend)
  group: null,
  // group shape: { code: string, isHost: bool }

  // Pending reward (not persisted — ephemeral UI state)
  pendingReward: null,
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'LOAD_STATE':
      return { ...state, ...action.payload, pendingReward: null };

    case 'COMPLETE_POMODORO': {
      const { reward, myStatus } = action; // reward = result of rollReward()
      const gained = 50 + (state.streak >= 3 ? 20 : 0) + reward.coinBonus;
      const newInventory = { ...state.inventory };
      newInventory[reward.item.id] = (newInventory[reward.item.id] || 0) + reward.qty;

      return {
        ...state,
        totalPomodoros: state.totalPomodoros + 1,
        streak: state.streak + 1,
        totalXp: state.totalXp + 100,
        coins: state.coins + gained,
        inventory: newInventory,
        pendingReward: reward,
      };
    }

    case 'SKIP_POMODORO':
      return { ...state, streak: 0 };

    case 'CLEAR_REWARD':
      return { ...state, pendingReward: null };

    case 'BUILD_PART': {
      const { partId, cost } = action;
      if (state.builtParts.includes(partId)) return state;

      const newInventory = { ...state.inventory };
      let canAfford = true;
      Object.entries(cost).forEach(([mat, qty]) => {
        if ((newInventory[mat] || 0) < qty) canAfford = false;
      });
      if (!canAfford) return state;

      Object.entries(cost).forEach(([mat, qty]) => {
        newInventory[mat] = (newInventory[mat] || 0) - qty;
      });

      return {
        ...state,
        inventory: newInventory,
        builtParts: [...state.builtParts, partId],
      };
    }

    case 'SET_IDENTITY':
      return { ...state, myName: action.name, myAvatar: action.avatar };

    case 'CREATE_GROUP': {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      return { ...state, group: { code, isHost: true } };
    }

    case 'JOIN_GROUP':
      return { ...state, group: { code: action.code, isHost: false } };

    case 'LEAVE_GROUP':
      return { ...state, group: null };

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
  const saveTimer = useRef(null);
  const initialized = useRef(false);

  // Load persisted state on mount
  useEffect(() => {
    loadGameState().then((saved) => {
      if (saved) dispatch({ type: 'LOAD_STATE', payload: saved });
      initialized.current = true;
    });
  }, []);

  // Debounced save on state change (skip pendingReward)
  useEffect(() => {
    if (!initialized.current) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveGameState(state), 500);
    return () => clearTimeout(saveTimer.current);
  }, [
    state.coins, state.totalXp, state.totalPomodoros, state.streak,
    state.inventory, state.builtParts, state.myName, state.myAvatar, state.group,
  ]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be inside GameProvider');
  return ctx;
}
