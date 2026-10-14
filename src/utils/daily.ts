import { DailyChallengeInfo, ThemeId } from '../types/game';

// Deterministic pseudo-random number generator from string seed
function pseudoRandom(seedStr: string): () => number {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  let s = Math.abs(hash) + 12345;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const MODIFIERS: Array<{
  type: DailyChallengeInfo['modifier'];
  name: string;
  desc: string;
}> = [
  { type: 'hyperSpeed', name: 'Hyper Velocity', desc: 'Obstacles move 40% faster with tight reaction windows!' },
  { type: 'coinFrenzy', name: 'Coin Torrent', desc: 'Triple coin spawn rate, but tighter safe pathways!' },
  { type: 'laserZone', name: 'Laser Grid Lockdown', desc: 'Continuous cross-fire laser sweep alarms!' },
  { type: 'heavyRain', name: 'Meteor Barrage', desc: 'Falling spikes drop in rapid salvos from above!' },
  { type: 'reverseGravity', name: 'Quantum Anomaly', desc: 'Rotating pinwheels and erratic drift movements!' }
];

const DAILY_THEMES: ThemeId[] = ['classic', 'night', 'fire', 'ice', 'neon', 'cyber'];

export function getTodayDailyChallenge(
  completedDate: string = '',
  bestScore: number = 0
): DailyChallengeInfo {
  return generateDailyChallenge(completedDate, bestScore);
}

export function generateDailyChallenge(
  completedDate: string,
  bestScore: number,
  overrideDateKey?: string
): DailyChallengeInfo {
  const dateKey = overrideDateKey || getTodayDateKey();
  const rng = pseudoRandom(dateKey);

  const modIdx = Math.floor(rng() * MODIFIERS.length);
  const modifier = MODIFIERS[modIdx];
  const theme = DAILY_THEMES[Math.floor(rng() * DAILY_THEMES.length)];

  const targetSurviveSecs = 30 + Math.floor(rng() * 20); // 30s to 50s
  const rewardCoins = 150 + Math.floor(rng() * 100); // 150 to 250 coins

  const titles = [
    `Solar Flare Protocol`,
    `Midnight Blitz`,
    `Infernal Tempest`,
    `Cryogenic Surge`,
    `Neon Overload`,
    `Cybernetic Crucible`
  ];
  const title = `${titles[Math.floor(rng() * titles.length)]} [${dateKey}]`;

  const isCompleted = completedDate === dateKey;

  return {
    dateKey,
    title,
    description: modifier.desc,
    modifier: modifier.type,
    modifierName: modifier.name,
    targetObjective: {
      type: 'survive_time',
      target: targetSurviveSecs,
      description: `Survive for ${targetSurviveSecs} seconds under ${modifier.name}`
    },
    theme,
    completed: isCompleted,
    bestScore: isCompleted ? bestScore : 0,
    rewardCoins
  };
}
