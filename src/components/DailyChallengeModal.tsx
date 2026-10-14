import React from 'react';
import { X, Calendar, Zap, Coins, CheckCircle, Play, ShieldAlert } from 'lucide-react';
import { DailyChallengeInfo } from '../types/game';
import { sound } from '../utils/audio';

interface DailyChallengeModalProps {
  daily: DailyChallengeInfo;
  onPlayDaily: () => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  daily,
  onPlayDaily,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white">
              DAILY PROTOCOL
            </h2>
          </div>
          <button
            id="daily-close-btn"
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

        {/* Date & Title Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-amber-400">
              DATE: {daily.dateKey}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
              {daily.theme} Zone
            </span>
          </div>

          <h3 className="font-['Chakra_Petch'] text-lg font-black text-white">
            {daily.title}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-200">
              Modifier: {daily.modifierName}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {daily.description}
          </p>
        </div>

        {/* Objective & Bounty Reward */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/80 flex flex-col">
            <span className="text-[10px] font-bold uppercase text-slate-400">Objective</span>
            <span className="text-xs font-bold text-slate-200 mt-1">
              {daily.targetObjective.description}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/80 flex flex-col justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">Bonus Bounty</span>
            <div className="flex items-center gap-1.5 text-sm font-mono font-extrabold text-amber-300 mt-1">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>+{daily.rewardCoins} Coins</span>
            </div>
          </div>
        </div>

        {/* Status & Play Button */}
        {daily.completed && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Completed for Today!</span>
            </div>
            {daily.bestScore > 0 && (
              <span className="font-mono">{daily.bestScore.toLocaleString()} pts</span>
            )}
          </div>
        )}

        <button
          id="daily-play-btn"
          onClick={() => {
            sound.playButton();
            onPlayDaily();
          }}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{daily.completed ? 'Replay Challenge' : 'Accept Daily Challenge'}</span>
        </button>
      </div>
    </div>
  );
};
