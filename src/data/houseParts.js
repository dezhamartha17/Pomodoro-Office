// Each part: id, label, emoji, description, cost (materials), buildOrder (display order)
export const HOUSE_PARTS = {
  floor_wood: {
    id: 'floor_wood',
    label: 'Wood Floor',
    emoji: '🪵',
    description: 'Lay the foundation of your home.',
    cost: { wood: 5 },
    buildOrder: 0,
  },
  wall_stone: {
    id: 'wall_stone',
    label: 'Stone Walls',
    emoji: '🧱',
    description: 'Solid walls to keep you safe.',
    cost: { stone: 4, iron: 1 },
    buildOrder: 1,
  },
  roof_iron: {
    id: 'roof_iron',
    label: 'Iron Roof',
    emoji: '🏠',
    description: 'A sturdy roof overhead.',
    cost: { iron: 3, wood: 2 },
    buildOrder: 2,
  },
  window_crystal: {
    id: 'window_crystal',
    label: 'Crystal Window',
    emoji: '🪟',
    description: 'Let magical light filter through.',
    cost: { crystal: 1, iron: 1 },
    buildOrder: 3,
  },
  gate_gold: {
    id: 'gate_gold',
    label: 'Gold Gate',
    emoji: '🚪',
    description: 'An impressive golden entrance.',
    cost: { gold: 2, iron: 2 },
    buildOrder: 4,
  },
  tower_dragon: {
    id: 'tower_dragon',
    label: 'Dragon Tower',
    emoji: '🐲',
    description: 'The pinnacle of power.',
    cost: { dragon_scale: 1, crystal: 2, gold: 3 },
    buildOrder: 5,
  },
};

export const HOUSE_PART_LIST = Object.values(HOUSE_PARTS).sort(
  (a, b) => a.buildOrder - b.buildOrder
);

// House visual emoji based on number of parts built
export function getHouseEmoji(builtCount) {
  if (builtCount === 0) return '⛺';
  if (builtCount <= 1) return '🏗️';
  if (builtCount <= 3) return '🏠';
  if (builtCount <= 4) return '🏡';
  return '🏰';
}

export function getHouseTitle(builtCount) {
  if (builtCount === 0) return 'Tent';
  if (builtCount <= 1) return 'Foundation';
  if (builtCount <= 3) return 'Basic House';
  if (builtCount <= 4) return 'Cozy Home';
  return 'Grand Estate';
}
