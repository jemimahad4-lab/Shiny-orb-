export type GameMode = 'classic' | 'levels' | 'timeAttack' | 'daily';

export type ThemeId = 'classic' | 'night' | 'fire' | 'ice' | 'neon' | 'cyber';

export type CharacterId = 'classic' | 'neon' | 'fire' | 'ice' | 'cyber' | 'galaxy' | 'shadow' | 'golden';

export type PowerUpType = 
  | 'shield' 
  | 'slowmo' 
  | 'magnet' 
  | 'doubleScore' 
  | 'coinMultiplier' 
  | 'dash' 
  | 'invincibility';

export interface PowerUpActive {
  type: PowerUpType;
  remainingTime: number; // in seconds
  duration: number;
}

export type ObstacleType = 
  | 'spike' 
  | 'movingSpike' 
  | 'rotatingSpike' 
  | 'fallingSpike' 
  | 'spikeWall' 
  | 'movingBlock' 
  | 'laser' 
  | 'patternHazard';

export interface LevelObjective {
  type: 'survive_time' | 'collect_coins' | 'reach_combo' | 'dodge_spikes';
  target: number;
  description: string;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  theme: ThemeId;
  objective: LevelObjective;
  duration?: number; // For survive_time
  speedMultiplier: number;
  spawnInterval: number; // Base ms between obstacles
  allowedObstacles: ObstacleType[];
  hazardIntensity: number; // 1 to 5
  rewardCoins: number;
  star2Requirement: string;
  star3Requirement: string;
}

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  description: string;
  price: number;
  colors: {
    primary: string;
    secondary: string;
    glow: string;
    trail: string;
  };
  shape: 'circle' | 'diamond' | 'shield' | 'star' | 'cube' | 'hexagon';
  perkDescription: string;
}

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  price: number;
  bgGradient: string[];
  ambientColor: string;
  gridColor: string;
  particleColors: string[];
}

export interface GameOverStats {
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  coinsEarned: number;
  survivalTime: number;
  maxCombo: number;
  spikesDodged: number;
  nearMisses: number;
  mode: GameMode;
  levelId?: number;
}

export interface LevelStats {
  levelId: number;
  score: number;
  stars: number;
  bonusScore: number;
  coinsEarned: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  mode: GameMode;
  level?: number;
  date: string;
  combo: number;
  character: CharacterId;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  rewardCoins: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  reducedMotion: boolean;
  graphicsQuality: 'high' | 'medium' | 'low';
  controlType: 'touchDrag' | 'joystick';
}

export interface DailyChallengeInfo {
  dateKey: string;
  title: string;
  description: string;
  modifier: 'hyperSpeed' | 'coinFrenzy' | 'laserZone' | 'heavyRain' | 'reverseGravity';
  modifierName: string;
  targetObjective: LevelObjective;
  theme: ThemeId;
  completed: boolean;
  bestScore: number;
  rewardCoins: number;
}

export interface PlayerSaveData {
  version: number;
  coins: number;
  highScore: number;
  playerName: string;
  highScores: {
    classic: number;
    timeAttack: number;
    daily: number;
  };
  levels: Record<number, {
    unlocked: boolean;
    completed: boolean;
    stars: number;
    bestScore: number;
  }>;
  unlockedCharacters: CharacterId[];
  selectedCharacter: CharacterId;
  unlockedThemes: ThemeId[];
  selectedTheme: ThemeId;
  achievements: Record<string, {
    progress: number;
    unlocked: boolean;
    unlockedAt?: string;
  }>;
  dailyChallenge: {
    lastPlayedDate: string;
    completedDate: string;
    bestScore: number;
  };
  dailyChallenges: Record<string, {
    completed: boolean;
    score: number;
  }>;
  settings: GameSettings;
  tutorialCompleted: boolean;
  leaderboard: LeaderboardEntry[];
  stats: {
    gamesPlayed: number;
    totalScore: number;
    totalCoinsEarned: number;
    spikesDodged: number;
    nearMisses: number;
    highestCombo: number;
    totalSurvivalTime: number;
    levelsCompleted: number;
    achievementsUnlocked: number;
  };
}
