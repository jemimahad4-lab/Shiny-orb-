import { Achievement } from '../types/game';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_game',
    title: 'First Flight',
    description: 'Launch and play your very first round of Dodge the Spikes 2',
    icon: 'PlayCircle',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    rewardCoins: 25
  },
  {
    id: 'first_win',
    title: 'First Victory',
    description: 'Clear any level in Levels Mode',
    icon: 'Trophy',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    rewardCoins: 50
  },
  {
    id: 'score_100',
    title: 'Spike Survivor',
    description: 'Achieve a score of 100 points in any mode',
    icon: 'Zap',
    progress: 0,
    maxProgress: 100,
    unlocked: false,
    rewardCoins: 30
  },
  {
    id: 'score_500',
    title: 'Dodge Specialist',
    description: 'Achieve a score of 500 points in any mode',
    icon: 'Activity',
    progress: 0,
    maxProgress: 500,
    unlocked: false,
    rewardCoins: 60
  },
  {
    id: 'score_1000',
    title: 'Arcade Legend',
    description: 'Reach a formidable score of 1,000 points',
    icon: 'Flame',
    progress: 0,
    maxProgress: 1000,
    unlocked: false,
    rewardCoins: 120
  },
  {
    id: 'score_5000',
    title: 'Godlike Reflexes',
    description: 'Break into elite territory with 5,000 points',
    icon: 'Crown',
    progress: 0,
    maxProgress: 5000,
    unlocked: false,
    rewardCoins: 300
  },
  {
    id: 'coins_10',
    title: 'Pocket Change',
    description: 'Collect a total of 10 shiny coins',
    icon: 'Coins',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    rewardCoins: 20
  },
  {
    id: 'coins_100',
    title: 'Treasure Seeker',
    description: 'Collect a total of 100 coins throughout your journeys',
    icon: 'Gem',
    progress: 0,
    maxProgress: 100,
    unlocked: false,
    rewardCoins: 100
  },
  {
    id: 'coins_500',
    title: 'Arcade Tycoon',
    description: 'Amass a total of 500 collected coins',
    icon: 'Sparkles',
    progress: 0,
    maxProgress: 500,
    unlocked: false,
    rewardCoins: 250
  },
  {
    id: 'combo_10',
    title: 'Rhythm Cadet',
    description: 'Reach a 10x Combo multiplier',
    icon: 'Gauge',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    rewardCoins: 40
  },
  {
    id: 'combo_25',
    title: 'Combo Virtuoso',
    description: 'Reach an electric 25x Combo multiplier',
    icon: 'Radio',
    progress: 0,
    maxProgress: 25,
    unlocked: false,
    rewardCoins: 100
  },
  {
    id: 'combo_50',
    title: 'Untouchable Phantom',
    description: 'Reach an unbelievable 50x Combo multiplier',
    icon: 'Sparkle',
    progress: 0,
    maxProgress: 50,
    unlocked: false,
    rewardCoins: 250
  },
  {
    id: 'levels_5',
    title: 'Sector Pioneer',
    description: 'Successfully complete 5 different levels',
    icon: 'Compass',
    progress: 0,
    maxProgress: 5,
    unlocked: false,
    rewardCoins: 75
  },
  {
    id: 'levels_10',
    title: 'Seasoned Dodger',
    description: 'Successfully complete 10 different levels',
    icon: 'Shield',
    progress: 0,
    maxProgress: 10,
    unlocked: false,
    rewardCoins: 150
  },
  {
    id: 'levels_all',
    title: 'Grandmaster of Spikes',
    description: 'Conquer all 30 handcrafted levels',
    icon: 'Award',
    progress: 0,
    maxProgress: 30,
    unlocked: false,
    rewardCoins: 500
  },
  {
    id: 'survive_60',
    title: 'Iron Core',
    description: 'Survive for at least 60 seconds in Classic Mode in a single run',
    icon: 'Clock',
    progress: 0,
    maxProgress: 60,
    unlocked: false,
    rewardCoins: 100
  },
  {
    id: 'beat_high_score',
    title: 'Limit Breaker',
    description: 'Surpass your own previous personal best high score',
    icon: 'TrendingUp',
    progress: 0,
    maxProgress: 1,
    unlocked: false,
    rewardCoins: 50
  },
  {
    id: 'powerup_collector',
    title: 'Overcharged',
    description: 'Collect 20 power-up boosts in any modes',
    icon: 'BatteryCharging',
    progress: 0,
    maxProgress: 20,
    unlocked: false,
    rewardCoins: 60
  }
];
