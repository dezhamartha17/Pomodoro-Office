import { RARITIES, ITEMS } from './items';

// Roll a random reward based on rarity weights
export function rollReward(streakBonus = false) {
  const rand = Math.random();

  let rarity;
  if (rand < RARITIES.ULTRA_RARE.chance) {
    rarity = 'ULTRA_RARE';
  } else if (rand < RARITIES.ULTRA_RARE.chance + RARITIES.RARE.chance) {
    rarity = 'RARE';
  } else if (rand < RARITIES.ULTRA_RARE.chance + RARITIES.RARE.chance + RARITIES.UNCOMMON.chance) {
    rarity = 'UNCOMMON';
  } else {
    rarity = 'COMMON';
  }

  // Streak bonus: chance to upgrade rarity by one tier
  if (streakBonus && Math.random() < 0.25 && rarity !== 'ULTRA_RARE') {
    const tiers = ['COMMON', 'UNCOMMON', 'RARE', 'ULTRA_RARE'];
    const idx = tiers.indexOf(rarity);
    rarity = tiers[idx + 1];
  }

  const pool = Object.values(ITEMS).filter((item) => item.rarity === rarity);
  const item = pool[Math.floor(Math.random() * pool.length)];

  const qty = rarity === 'COMMON' ? Math.floor(Math.random() * 3) + 2
    : rarity === 'UNCOMMON' ? Math.floor(Math.random() * 2) + 1
    : 1;

  const coinBonus = RARITIES[rarity].coinBonus;

  return {
    item,
    qty,
    coinBonus,
    rarity,
    timestamp: Date.now(),
  };
}
