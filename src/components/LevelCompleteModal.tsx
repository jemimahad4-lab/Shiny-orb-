import React from 'react';
import { Star, RotateCcw, ArrowRight, Map, Coins, Trophy, Sparkles } from 'lucide-react';
import { LevelConfig, LevelStats } from '../types/game';
import { sound } from '../utils/audio';

interface LevelCompleteModalProps {
  level: LevelConfig;
  stats: LevelStats;
  onNextLevel: () => void;
  onReplay: () => void;
  onLevelSelect: () => void;
  hasNextLevel: boolean;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  stats,
  onNextLevel,
  onReplay,
  onLevelSelect,
  hasNextLevel
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 text-center">
        {/* Triumph Header */}
        <div className="flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold shadow-md mb-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>SECTOR OBJECTIVE CLEARED!</span>
          </div>

          <h2 className="font-['Chakra_Petch'] text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
            LEVEL {level.id} COMPLETE
          </h2>
          <span className="text-xs text-slate-400 mt-0.5">
            {level.name}
          </span>
        </div>

        {/* 3 Stars Pop Stage */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[1, 2, 3].map((starIdx) => {
            const hasStar = starIdx <= stats.stars;
            return (
              <div 
                key={starIdx}
                className={`relative transition-all duration-500 ${
                  hasStar ? 'scale-110 animate-bounce' : 'scale-90 opacity-40'
                }`}
                style={{ animationDelay: `${starIdx * 150}ms` }}
              >
                <Star 
                  className={`w-12 h-12 ${
                    hasStar 
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]' 
                      : 'text-slate-600'
                  }`} 
                />
              </div>
            );
          })}
        </div>

        {/* Score & Rewards Card */}
        <div className="p-4 rounded-xl bg-slate-850/80 border border-slate-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>Score Achieved:</span>
            <span className="font-mono font-bold text-white text-sm">
              {stats.score.toLocaleString()} pts
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>Star Bonus:</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              +{stats.bonusScore.toLocaleString()} pts
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Coins Harvested:</span>
            <div className="flex items-center gap-1 font-mono font-bold text-amber-300 text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>+{stats.coinsEarned + level.rewardCoins}</span>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col gap-2.5 mt-1">
          {hasNextLevel ? (
            <button
              id="levelcomplete-next-btn"
              onClick={() => {
                sound.playButton();
                onNextLevel();
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-base tracking-wider uppercase shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-['Chakra_Petch']"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <div className="text-xs font-bold text-emerald-400 py-1">
              🏆 ALL 30 SECTORS CONQUERED!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="levelcomplete-replay-btn"
              onClick={() => {
                sound.playButton();
                onReplay();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-90"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay</span>
            </button>

            <button
              id="levelcomplete-sectors-btn"
              onClick={() => {
                sound.playButton();
                onLevelSelect();
              }}
              className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-90"
            >
              <Map className="w-4 h-4" />
              <span>Sectors</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
