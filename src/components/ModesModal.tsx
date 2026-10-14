import React from 'react';
import { X, Flame, Map, Clock, Calendar, ArrowRight } from 'lucide-react';
import { GameMode } from '../types/game';
import { sound } from '../utils/audio';

interface ModesModalProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenLevels: () => void;
  onOpenDaily: () => void;
  onClose: () => void;
  classicHighScore: number;
  timeAttackHighScore: number;
  dailyCompleted: boolean;
}

export const ModesModal: React.FC<ModesModalProps> = ({
  onSelectMode,
  onOpenLevels,
  onOpenDaily,
  onClose,
  classicHighScore,
  timeAttackHighScore,
  dailyCompleted
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white">
            SELECT GAME MODE
          </h2>
          <button
            id="modes-close-btn"
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

        {/* Modes Grid / Cards */}
        <div className="flex flex-col gap-2.5">
          {/* 1. Classic Mode */}
          <div
            id="mode-card-classic"
            onClick={() => {
              sound.playButton();
              onSelectMode('classic');
            }}
            className="group flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-900 border border-slate-700 hover:border-sky-500/80 cursor-pointer active:scale-[0.98] transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-sky-500/20 text-sky-400 group-hover:scale-105 transition-transform">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">
                  Classic Survival
                </h3>
                <p className="text-xs text-slate-400">
                  Endless run with escalating speed & density.
                </p>
                {classicHighScore > 0 && (
                  <span className="text-[11px] text-amber-400 font-mono font-semibold">
                    Best: {classicHighScore.toLocaleString()} pts
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
          </div>

          {/* 2. Levels Campaign */}
          <div
            id="mode-card-levels"
            onClick={() => {
              sound.playButton();
              onOpenLevels();
            }}
            className="group flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-900 border border-slate-700 hover:border-emerald-500/80 cursor-pointer active:scale-[0.98] transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">
                  Sector Levels (30)
                </h3>
                <p className="text-xs text-slate-400">
                  Handcrafted levels with unique objectives & bosses.
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>

          {/* 3. Time Attack */}
          <div
            id="mode-card-time-attack"
            onClick={() => {
              sound.playButton();
              onSelectMode('timeAttack');
            }}
            className="group flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-900 border border-slate-700 hover:border-purple-500/80 cursor-pointer active:scale-[0.98] transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:scale-105 transition-transform">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">
                  Time Attack (60s)
                </h3>
                <p className="text-xs text-slate-400">
                  Dodge frantically and score maximum points in 60s.
                </p>
                {timeAttackHighScore > 0 && (
                  <span className="text-[11px] text-amber-400 font-mono font-semibold">
                    Best: {timeAttackHighScore.toLocaleString()} pts
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>

          {/* 4. Daily Challenge */}
          <div
            id="mode-card-daily"
            onClick={() => {
              sound.playButton();
              onOpenDaily();
            }}
            className="group flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-slate-800/90 to-slate-900 border border-slate-700 hover:border-amber-500/80 cursor-pointer active:scale-[0.98] transition-all shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-['Chakra_Petch'] font-bold text-base text-white">
                    Daily Challenge
                  </h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                    dailyCompleted ? 'bg-emerald-900/60 text-emerald-400' : 'bg-amber-500 text-slate-950'
                  }`}>
                    {dailyCompleted ? 'DONE' : 'NEW'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Unique daily modifier, objective & bonus rewards.
                </p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};
