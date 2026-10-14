import React, { useState } from 'react';
import { 
  RotateCcw, 
  Home, 
  Trophy, 
  Coins, 
  Flame, 
  Clock, 
  Share2, 
  Check, 
  User, 
  Sparkles,
  Zap
} from 'lucide-react';
import { GameOverStats, GameMode, LevelConfig } from '../types/game';
import { sound } from '../utils/audio';

interface GameOverModalProps {
  stats: GameOverStats;
  mode: GameMode;
  currentLevel: LevelConfig | null;
  onRestart: () => void;
  onHome: () => void;
  onOpenLeaderboard: () => void;
  onOpenCharacters: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  mode,
  currentLevel,
  onRestart,
  onHome,
  onOpenLeaderboard,
  onOpenCharacters
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    sound.playButton();
    const shareText = `I scored ${stats.score.toLocaleString()} points and reached a ${stats.maxCombo}x combo in Dodge the Spikes 2! Can you beat my survival time of ${Math.floor(stats.survivalTime)}s?`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dodge the Spikes 2',
          text: shareText,
          url: window.location.href
        });
      } catch (e) {
        // Fallback to clipboard
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-center">
        {/* Top Header Badge */}
        <div className="flex flex-col items-center">
          {stats.isNewHighScore ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-mono font-bold animate-bounce shadow-md mb-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>NEW PERSONAL HIGH SCORE!</span>
            </div>
          ) : (
            <span className="text-[11px] uppercase font-bold tracking-widest text-slate-400 mb-1">
              SURVIVAL RUN CONCLUDED
            </span>
          )}

          <h2 className="font-['Chakra_Petch'] text-3xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
            GAME OVER
          </h2>
        </div>

        {/* Final Score Hero Block */}
        <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 flex flex-col items-center">
          <span className="text-xs uppercase font-bold text-slate-400">Total Run Score</span>
          <span className="font-['Chakra_Petch'] font-black text-4xl text-white tracking-wider my-1 drop-shadow-md">
            {stats.score.toLocaleString()}
          </span>

          <div className="flex items-center gap-4 text-xs font-mono mt-1 text-slate-400">
            <span>High Score: <strong className="text-slate-200">{stats.highScore.toLocaleString()}</strong></span>
            {mode === 'levels' && currentLevel && (
              <span>Level: <strong className="text-sky-400">{currentLevel.id}</strong></span>
            )}
          </div>
        </div>

        {/* 3-Stat Summary Grid */}
        <div className="grid grid-cols-3 gap-2">
          {/* Coins Earned */}
          <div className="p-2.5 rounded-xl bg-slate-850/70 border border-slate-800 flex flex-col items-center">
            <Coins className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Coins</span>
            <span className="font-['Chakra_Petch'] font-bold text-sm text-amber-300">
              +{stats.coinsEarned}
            </span>
          </div>

          {/* Survival Time */}
          <div className="p-2.5 rounded-xl bg-slate-850/70 border border-slate-800 flex flex-col items-center">
            <Clock className="w-4 h-4 text-sky-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Time</span>
            <span className="font-['Chakra_Petch'] font-bold text-sm text-sky-300">
              {Math.floor(stats.survivalTime)}s
            </span>
          </div>

          {/* Max Combo */}
          <div className="p-2.5 rounded-xl bg-slate-850/70 border border-slate-800 flex flex-col items-center">
            <Flame className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-[10px] uppercase font-bold text-slate-400">Max Combo</span>
            <span className="font-['Chakra_Petch'] font-bold text-sm text-rose-300">
              {stats.maxCombo}x
            </span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-1">
          <button
            id="gameover-restart-btn"
            onClick={() => {
              sound.playButton();
              onRestart();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-extrabold text-base tracking-wider uppercase shadow-lg shadow-sky-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Chakra_Petch']"
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            <span>PLAY AGAIN</span>
          </button>

          <div className="grid grid-cols-3 gap-2">
            <button
              id="gameover-home-btn"
              onClick={() => {
                sound.playButton();
                onHome();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-90"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              id="gameover-ranks-btn"
              onClick={() => {
                sound.playButton();
                onOpenLeaderboard();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-90"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Ranks</span>
            </button>

            <button
              id="gameover-share-btn"
              onClick={handleShare}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-90"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
