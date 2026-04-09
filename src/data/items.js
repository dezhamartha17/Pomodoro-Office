export const RARITIES = {
  COMMON: {
    key: 'COMMON',
    label: 'Common',
    color: '#9B9B9B',
    gradColors: ['#1A1A1A', '#2A2A2A'],
    coinBonus: 10,
    chance: 0.55,
  },
  UNCOMMON: {
    key: 'UNCOMMON',
    label: 'Uncommon',
    color: '#1EFF00',
    gradColors: ['#001400', '#002800'],
    coinBonus: 30,
    chance: 0.28,
  },
  RARE: {
    key: 'RARE',
    label: 'Rare',
    color: '#0096FF',
    gradColors: ['#000A1F', '#001533'],
    coinBonus: 80,
    chance: 0.13,
  },
  ULTRA_RARE: {
    key: 'ULTRA_RARE',
    label: 'Ultra Rare',
    color: '#FF8000',
    gradColors: ['#1A0A00', '#301500'],
    coinBonus: 250,
    chance: 0.04,
  },
};

// Each item has: id, label, emoji, rarity, description
export const ITEMS = {
  wood: {
    id: 'wood',
    label: 'Wood',
    emoji: '🪵',
    rarity: 'COMMON',
    description: 'Versatile building material.',
  },
  stone: {
    id: 'stone',
    label: 'Stone',
    emoji: '🪨',
    rarity: 'COMMON',
    description: 'Solid and dependable.',
  },
  iron: {
    id: 'iron',
    label: 'Iron Ore',
    emoji: '⚙️',
    rarity: 'UNCOMMON',
    description: 'Smelted into strong structures.',
  },
  gold: {
    id: 'gold',
    label: 'Gold',
    emoji: '🥇',
    rarity: 'UNCOMMON',
    description: 'Valuable metal for luxury builds.',
  },
  crystal: {
    id: 'crystal',
    label: 'Crystal',
    emoji: '💎',
    rarity: 'RARE',
    description: 'Magical and beautiful.',
  },
  star_dust: {
    id: 'star_dust',
    label: 'Star Dust',
    emoji: '✨',
    rarity: 'RARE',
    description: 'Fallen from the cosmos.',
  },
  dragon_scale: {
    id: 'dragon_scale',
    label: 'Dragon Scale',
    emoji: '🐉',
    rarity: 'ULTRA_RARE',
    description: 'Nearly impossible to find.',
  },
};

export const MATERIAL_KEYS = Object.keys(ITEMS);
