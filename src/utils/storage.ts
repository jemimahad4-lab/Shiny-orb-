import { 
  PlayerSaveData, 
  LeaderboardEntry, 
  GameSettings, 
  GameMode, 
  CharacterId, 
  ThemeId,
  Achievement
} from '../types/game';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';

const STORAGE_KEY = 'dodge_the_spikes_2_save_v1';

export const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  musicEnabled: false,
  vibrationEnabled: true,
  reducedMotion: false,
  graphicsQuality: 'high',
  controlType: 'touchDrag'
};

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'lb_1', playerName: 'ApexDodger', score: 3840, mode: 'classic', date: '2026-09-12', combo: 42, character: 'golden' },
  { id: 'lb_2', playerName: 'NeonRider', score: 2950, mode: 'classic', date: '2026-09-13', combo: 34, character: 'neon' },
  { id: 'lb_3', playerName: 'CyberGhost', score: 2410, mode: 'classic', date: '2026-09-14', combo: 28, character: 'cyber' },
  { id: 'lb_4', playerName: 'FrostByte', score: 1820, mode: 'timeAttack', date: '2026-09-14', combo: 22, character: 'ice' },
  { id: 'lb_5', playerName: 'Vortex_99', score: 1540, mode: 'daily', date: '2026-09-15', combo: 19, character: 'galaxy' },
  { id: 'lb_6', playerName: 'PixelAce', score: 1210, mode: 'classic', date: '2026-09-15', combo: 16, character: 'classic' }
];

export function getDefaultSaveData(): PlayerSaveData {
  const initialAchievementsRecord: PlayerSaveData['achievements'] = {};
  INITIAL_ACHIEVEMENTS.forEach(ach => {
    initialAchievementsRecord[ach.id] = {
      progress: 0,
      unlocked: false
    };
  });

  const initialLevels: PlayerSaveData['levels'] = {};
  for (let i = 1; i <= 30; i++) {
    initialLevels[i] = {
      unlocked: i === 1, // Only level 1 unlocked initially
      completed: false,
      stars: 0,
      bestScore: 0
    };
  }

  return {
    version: 1,
    coins: 75, // Welcome bonus
    highScore: 0,
    playerName: 'Player 1',
    highScores: {
      classic: 0,
      timeAttack: 0,
      daily: 0
    },
    levels: initialLevels,
    unlockedCharacters: ['classic'],
    selectedCharacter: 'classic',
    unlockedThemes: ['classic'],
    selectedTheme: 'classic',
    achievements: initialAchievementsRecord,
    dailyChallenge: {
      lastPlayedDate: '',
      completedDate: '',
      bestScore: 0
    },
    dailyChallenges: {},
    settings: { ...DEFAULT_SETTINGS },
    tutorialCompleted: false,
    leaderboard: INITIAL_LEADERBOARD,
    stats: {
      gamesPlayed: 0,
      totalScore: 0,
      totalCoinsEarned: 75,
      spikesDodged: 0,
      nearMisses: 0,
      highestCombo: 0,
      totalSurvivalTime: 0,
      levelsCompleted: 0,
      achievementsUnlocked: 0
    }
  };
}

export function loadSaveData(): PlayerSaveData {
  if (typeof window === 'undefined') {
    return getDefaultSaveData();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultData = getDefaultSaveData();
      saveSaveData(defaultData);
      return defaultData;
    }

    const parsed = JSON.parse(raw);
    const defaults = getDefaultSaveData();

    // Safe merge
    const merged: PlayerSaveData = {
      ...defaults,
      ...parsed,
      settings: { ...defaults.settings, ...(parsed.settings || {}) },
      highScores: { ...defaults.highScores, ...(parsed.highScores || {}) },
      dailyChallenge: { ...defaults.dailyChallenge, ...(parsed.dailyChallenge || {}) },
      dailyChallenges: { ...(parsed.dailyChallenges || {}) },
      levels: { ...defaults.levels, ...(parsed.levels || {}) },
      achievements: { ...defaults.achievements, ...(parsed.achievements || {}) },
      leaderboard: Array.isArray(parsed.leaderboard) ? parsed.leaderboard : defaults.leaderboard,
      stats: { ...defaults.stats, ...(parsed.stats || {}) }
    };

    return merged;
  } catch (err) {
    console.error('Failed to load save data, resetting safely:', err);
    return getDefaultSaveData();
  }
}

export function saveSaveData(data: PlayerSaveData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('LocalStorage save failed:', err);
  }
}

export function recordLeaderboardEntry(
  saveData: PlayerSaveData,
  entry: LeaderboardEntry
): PlayerSaveData {
  const updatedLb = [...saveData.leaderboard, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  const updated: PlayerSaveData = {
    ...saveData,
    leaderboard: updatedLb
  };
  saveSaveData(updated);
  return updated;
}

export function saveSettings(
  saveData: PlayerSaveData,
  newSettings: GameSettings
): PlayerSaveData {
  const updated: PlayerSaveData = {
    ...saveData,
    settings: { ...newSettings }
  };
  saveSaveData(updated);
  return updated;
}

export function savePlayerName(
  saveData: PlayerSaveData,
  name: string
): PlayerSaveData {
  const updated: PlayerSaveData = {
    ...saveData,
    playerName: name
  };
  saveSaveData(updated);
  return updated;
}

export function unlockCharacter(
  saveData: PlayerSaveData,
  id: CharacterId,
  cost: number
): PlayerSaveData {
  if (saveData.coins < cost) return saveData;
  if (saveData.unlockedCharacters.includes(id)) return saveData;

  const updated: PlayerSaveData = {
    ...saveData,
    coins: saveData.coins - cost,
    unlockedCharacters: [...saveData.unlockedCharacters, id],
    selectedCharacter: id
  };
  saveSaveData(updated);
  return updated;
}

export function unlockTheme(
  saveData: PlayerSaveData,
  id: ThemeId,
  cost: number
): PlayerSaveData {
  if (saveData.coins < cost) return saveData;
  if (saveData.unlockedThemes.includes(id)) return saveData;

  const updated: PlayerSaveData = {
    ...saveData,
    coins: saveData.coins - cost,
    unlockedThemes: [...saveData.unlockedThemes, id],
    selectedTheme: id
  };
  saveSaveData(updated);
  return updated;
}

export function updateAchievementProgress(
  saveData: PlayerSaveData,
  achId: string,
  progressOrVal: number
): { updatedSaveData: PlayerSaveData; unlockedAchievement: Achievement | null } {
  const achDef = INITIAL_ACHIEVEMENTS.find(a => a.id === achId);
  if (!achDef) return { updatedSaveData: saveData, unlockedAchievement: null };

  const current = saveData.achievements[achId] || { progress: 0, unlocked: false };
  if (current.unlocked) return { updatedSaveData: saveData, unlockedAchievement: null };

  const newProgress = Math.max(current.progress, progressOrVal);
  const nowUnlocked = newProgress >= achDef.maxProgress;

  const updatedAchievements = {
    ...saveData.achievements,
    [achId]: {
      progress: newProgress,
      unlocked: nowUnlocked,
      unlockedAt: nowUnlocked ? new Date().toISOString() : undefined
    }
  };

  const unlockedAch: Achievement | null = nowUnlocked ? {
    ...achDef,
    progress: newProgress,
    unlocked: true,
    unlockedAt: new Date().toISOString()
  } : null;

  const bonusCoins = nowUnlocked ? achDef.rewardCoins : 0;
  const newAchievementsCount = Object.values(updatedAchievements).filter(a => a.unlocked).length;

  const updatedSaveData: PlayerSaveData = {
    ...saveData,
    coins: saveData.coins + bonusCoins,
    achievements: updatedAchievements,
    stats: {
      ...saveData.stats,
      achievementsUnlocked: newAchievementsCount,
      totalCoinsEarned: saveData.stats.totalCoinsEarned + bonusCoins
    }
  };

  saveSaveData(updatedSaveData);
  return { updatedSaveData, unlockedAchievement: unlockedAch };
}

export function recordDailyChallengeAttempt(
  saveData: PlayerSaveData,
  dateKey: string,
  score: number,
  completed: boolean
): { updatedSaveData: PlayerSaveData } {
  const existing = saveData.dailyChallenges[dateKey] || { completed: false, score: 0 };
  const updatedDaily = {
    completed: existing.completed || completed,
    score: Math.max(existing.score, score)
  };

  const updatedSaveData: PlayerSaveData = {
    ...saveData,
    dailyChallenges: {
      ...saveData.dailyChallenges,
      [dateKey]: updatedDaily
    }
  };

  saveSaveData(updatedSaveData);
  return { updatedSaveData };
}

export function resetGameProgress(): PlayerSaveData {
  const resetData = getDefaultSaveData();
  saveSaveData(resetData);
  return resetData;
}
