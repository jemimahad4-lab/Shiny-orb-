import React, { useState } from 'react';
import { X, Award, CheckCircle2, Coins, Sparkles, Trophy, Calendar, Lock } from 'lucide-react';
import { Achievement } from '../types/game';
import { INITIAL_ACHIEVEMENTS } from '../data/achievements';
import { sound } from '../utils/audio';

interface AchievementsModalProps {
  achievementsProgress: Record<string, { progress: number; unlocked: boolean; unlockedAt?: string }>;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  achievementsProgress,
  onClose
}) => {
  const [selectedAch, setSelectedAch] = useState<Achievement | null>(null);

  const allAchievements: Achievement[] = INITIAL_ACHIEVEMENTS.map(ach => {
    const saved = achievementsProgress[ach.id];
    return {
      ...ach,
      progress: saved ? saved.progress : 0,
      unlocked: saved ? saved.unlocked : false,
      unlockedAt: saved?.unlockedAt
    };
  });

  const unlockedCount = allAchievements.filter(a => a.unlocked).length;
  const completionPct = Math.floor((unlockedCount / allAchievements.length) * 100);

  const handleSelectAch = (ach: Achievement) => {
    sound.playButton();
    setSelectedAch(ach);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white flex items-center gap-2">
              <span>ACHIEVEMENTS</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono">
                {unlockedCount} / {allAchievements.length} Unlocked
              </span>
            </h2>
            <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          <button
            id="achievements-close-btn"
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Helper Hint */}
        <div className="px-4 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Tap any achievement to inspect details and reward</span>
          <span className="text-emerald-400 font-mono font-semibold">{completionPct}% Complete</span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 no-scrollbar bg-slate-900/60">
          {allAchievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            const pct = Math.min(100, Math.floor((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectAch(ach)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSelectAch(ach);
                  }
                }}
                className={`p-3.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer active:scale-[0.99] ${
                  isUnlocked
                    ? 'bg-slate-800/90 border-emerald-500/40 hover:border-emerald-400 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${
                    isUnlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-900 text-slate-400 border border-slate-700/50'
                  }`}>
                    {isUnlocked ? <CheckCircle2 className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                  </div>

                  <div className="flex flex-col">
                    <span className={`font-bold text-sm ${isUnlocked ? 'text-white' : 'text-slate-200'}`}>
                      {ach.title}
                    </span>
                    <span className="text-xs text-slate-400">
                      {ach.description}
                    </span>

                    {/* Progress Bar for multi-step */}
                    {!isUnlocked && ach.maxProgress > 1 && (
                      <div className="w-36 h-1.5 bg-slate-950 rounded-full mt-1.5 overflow-hidden border border-slate-800">
                        <div 
                          className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-mono font-bold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{ach.rewardCoins}</span>
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${
                    isUnlocked ? 'text-emerald-400' : 'text-slate-400'
                  }`}>
                    {isUnlocked ? 'Claimed' : `${ach.progress}/${ach.maxProgress}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Achievement Detail Modal */}
        {selectedAch && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 p-5 flex flex-col justify-between animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    selectedAch.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedAch.unlocked ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <h3 className="font-['Chakra_Petch'] text-base font-bold text-white tracking-wide">
                    ACHIEVEMENT BRIEFING
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedAch(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-700/80 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="font-['Chakra_Petch'] font-bold text-lg text-white">
                    {selectedAch.title}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    selectedAch.unlocked
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {selectedAch.unlocked ? 'UNLOCKED' : 'IN PROGRESS'}
                  </span>
                </div>

                <p className="text-sm text-slate-300">
                  {selectedAch.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Reward</span>
                    <div className="flex items-center gap-1 text-amber-400 font-mono font-bold mt-0.5">
                      <Coins className="w-4 h-4" />
                      <span>{selectedAch.rewardCoins} Arc Coins</span>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Progress</span>
                    <span className="font-mono font-bold text-slate-200 mt-0.5">
                      {selectedAch.progress} / {selectedAch.maxProgress}
                    </span>
                  </div>
                </div>

                {selectedAch.unlockedAt && (
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unlocked on {selectedAch.unlockedAt}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedAch(null)}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm active:scale-95 transition-all cursor-pointer text-center"
            >
              Back to Achievements
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
