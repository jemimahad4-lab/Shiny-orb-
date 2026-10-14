import React from 'react';
import { X, Star, Lock, Play, ShieldAlert, Award } from 'lucide-react';
import { LevelConfig, PlayerSaveData } from '../types/game';
import { LEVELS } from '../data/levels';
import { sound } from '../utils/audio';

interface LevelSelectModalProps {
  levelsProgress: PlayerSaveData['levels'];
  onSelectLevel: (level: LevelConfig) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  levelsProgress,
  onSelectLevel,
  onClose
}) => {
  // Calculate total stars
  let totalStars = 0;
  Object.values(levelsProgress).forEach((lvl: any) => {
    totalStars += lvl.stars || 0;
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white flex items-center gap-2">
              <span>SECTOR CAMPAIGN</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono">
                30 Levels
              </span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{totalStars} / 90 Stars Collected</span>
            </div>
          </div>

          <button
            id="levels-modal-close-btn"
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Levels Grid List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 no-scrollbar bg-slate-900/60">
          {LEVELS.map((lvl) => {
            const progress = levelsProgress[lvl.id] || { unlocked: lvl.id === 1, completed: false, stars: 0, bestScore: 0 };
            const isUnlocked = progress.unlocked || lvl.id === 1;

            return (
              <div
                key={lvl.id}
                id={`level-card-${lvl.id}`}
                onClick={() => {
                  if (isUnlocked) {
                    sound.playButton();
                    onSelectLevel(lvl);
                  } else {
                    sound.playHit();
                  }
                }}
                className={`relative flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-800/90 hover:bg-slate-800 border-slate-700 hover:border-sky-500/80 cursor-pointer active:scale-[0.98] shadow-md'
                    : 'bg-slate-900/40 border-slate-800 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Level Number Orb */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-['Chakra_Petch'] font-black text-lg ${
                    progress.completed
                      ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/40'
                      : isUnlocked
                      ? 'bg-slate-700 text-sky-300'
                      : 'bg-slate-800 text-slate-600'
                  }`}>
                    {isUnlocked ? lvl.id : <Lock className="w-4 h-4 text-slate-500" />}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      {lvl.name}
                      {lvl.id % 5 === 0 && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
                          Boss
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-slate-400 line-clamp-1">
                      {lvl.objective.description}
                    </span>
                    {isUnlocked && progress.bestScore > 0 && (
                      <span className="text-[11px] text-amber-400/90 font-mono font-medium mt-0.5">
                        Best: {progress.bestScore.toLocaleString()} pts
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Stars & Play Icon */}
                <div className="flex items-center gap-3">
                  {isUnlocked ? (
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3.5 h-3.5 ${
                              starIdx <= progress.stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 hover:bg-sky-500 hover:text-white transition-colors">
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 font-medium">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
