import React, { useEffect } from 'react';
import { Award, Coins } from 'lucide-react';
import { Achievement } from '../types/game';

interface AchievementToastProps {
  achievement: Achievement | null;
  onDismiss: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onDismiss }) => {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3800);
    return () => clearTimeout(timer);
  }, [achievement, onDismiss]);

  if (!achievement) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-700 pointer-events-auto">
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/95 border-2 border-amber-500/80 shadow-[0_8px_30px_rgba(245,158,11,0.35)] backdrop-blur-md max-w-sm">
        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
          <Award className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 font-['Chakra_Petch']">
            ACHIEVEMENT UNLOCKED!
          </span>
          <span className="font-bold text-xs text-white">
            {achievement.title}
          </span>
          <span className="text-[11px] text-slate-300">
            {achievement.description}
          </span>
        </div>
        <div className="flex items-center gap-1 pl-2 border-l border-slate-700 font-mono text-xs font-bold text-amber-300">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>+{achievement.rewardCoins}</span>
        </div>
      </div>
    </div>
  );
};
