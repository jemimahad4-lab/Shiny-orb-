import React from 'react';
import { Heart, Flame, Shield, Clock, Magnet, Zap, Award, Sparkles, Navigation } from 'lucide-react';
import { PowerUpActive, GameMode, LevelConfig, DailyChallengeInfo } from '../types/game';

interface GameHUDProps {
  score: number;
  combo: number;
  lives: number;
  maxLives: number;
  activePowerUps: PowerUpActive[];
  mode: GameMode;
  currentLevel: LevelConfig | null;
  dailyChallenge: DailyChallengeInfo | null;
  objectiveCurrent: number;
  objectiveTarget: number;
  dashCooldownRatio: number; // 0 = ready, 1 = max cooldown
  onTriggerDash: () => void;
  timeAttackRemaining?: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  lives,
  maxLives,
  activePowerUps,
  mode,
  currentLevel,
  dailyChallenge,
  objectiveCurrent,
  objectiveTarget,
  dashCooldownRatio,
  onTriggerDash,
  timeAttackRemaining
}) => {
  const getPowerUpIcon = (type: string) => {
    switch (type) {
      case 'shield': return <Shield className="w-3.5 h-3.5 text-sky-400" />;
      case 'slowmo': return <Clock className="w-3.5 h-3.5 text-purple-400" />;
      case 'magnet': return <Magnet className="w-3.5 h-3.5 text-orange-400" />;
      case 'doubleScore': return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'coinMultiplier': return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      case 'invincibility': return <Award className="w-3.5 h-3.5 text-yellow-300" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-white" />;
    }
  };

  const objectivePct = Math.min(100, Math.floor((objectiveCurrent / (objectiveTarget || 1)) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none z-20">
      {/* Top HUD Row */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {/* Hearts / Health */}
          <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1.5 rounded-full border border-slate-700/60 backdrop-blur-md shadow-md">
            {Array.from({ length: maxLives }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 transition-all duration-300 ${
                  i < lives 
                    ? 'text-rose-500 fill-rose-500 scale-100' 
                    : 'text-slate-600 scale-90 opacity-40'
                }`}
              />
            ))}
          </div>

          {/* Center Title or Time Attack Clock */}
          {mode === 'timeAttack' && (
            <div className="bg-amber-950/80 border border-amber-500/50 px-3 py-1 rounded-full text-xs font-mono font-bold text-amber-300 backdrop-blur-md animate-pulse">
              TIME: {Math.ceil(timeAttackRemaining || 0)}s
            </div>
          )}

          {mode === 'levels' && currentLevel && (
            <div className="bg-slate-900/80 border border-slate-700/60 px-3 py-1 rounded-full text-[11px] font-semibold text-slate-300 backdrop-blur-md truncate max-w-[170px]">
              {currentLevel.name.split(':')[0]}
            </div>
          )}

          {mode === 'daily' && dailyChallenge && (
            <div className="bg-emerald-950/80 border border-emerald-500/40 px-3 py-1 rounded-full text-[11px] font-bold text-emerald-300 backdrop-blur-md">
              DAILY: {dailyChallenge.modifierName}
            </div>
          )}

          {/* Current Score */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700/60 backdrop-blur-md shadow-md">
            <span className="text-[10px] uppercase font-bold text-slate-400">Score</span>
            <span className="font-extrabold text-white text-base tracking-wider font-mono">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Level / Daily Objective Progress Bar */}
        {(mode === 'levels' || mode === 'daily') && (
          <div className="w-full bg-slate-900/70 border border-slate-800 backdrop-blur-md rounded-xl p-2 flex flex-col gap-1 shadow-sm">
            <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
              <span>
                {mode === 'levels' ? currentLevel?.objective.description : dailyChallenge?.targetObjective.description}
              </span>
              <span className="font-mono text-sky-400 font-bold">
                {objectiveCurrent} / {objectiveTarget}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${objectivePct}%` }}
              />
            </div>
          </div>
        )}

        {/* Combo Multiplier Alert */}
        {combo > 1 && (
          <div className="self-center flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 backdrop-blur-md animate-bounce shadow-lg">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="font-extrabold text-amber-300 text-sm tracking-wider font-mono">
              COMBO x{combo}
            </span>
          </div>
        )}

        {/* Active Power-Ups Chips */}
        {activePowerUps.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-start">
            {activePowerUps.map(pw => {
              const pct = (pw.remainingTime / pw.duration) * 100;
              return (
                <div 
                  key={pw.type}
                  className="flex items-center gap-1.5 bg-slate-900/85 border border-slate-700/80 px-2 py-1 rounded-lg backdrop-blur-md shadow-sm"
                >
                  {getPowerUpIcon(pw.type)}
                  <span className="text-[10px] uppercase font-bold text-slate-200">
                    {pw.type}
                  </span>
                  <div className="w-8 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-400 transition-all duration-150"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Controls / Action HUD */}
      <div className="flex items-end justify-between pointer-events-auto pb-2">
        {/* Left Touch Guideline */}
        <div className="text-[11px] text-slate-400/80 bg-slate-950/40 px-2.5 py-1 rounded-lg backdrop-blur-sm hidden sm:block">
          Drag / WASD to Dodge
        </div>

        {/* Mobile / Screen Dash Button */}
        <div className="ml-auto">
          <button
            id="game-dash-btn"
            onClick={onTriggerDash}
            disabled={dashCooldownRatio > 0}
            className={`relative w-16 h-16 rounded-full flex flex-col items-center justify-center font-bold text-xs uppercase shadow-xl transition-all active:scale-90 ${
              dashCooldownRatio > 0
                ? 'bg-slate-800/80 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                : 'bg-gradient-to-tr from-sky-600 to-indigo-500 text-white border-2 border-sky-300/80 shadow-sky-500/30 hover:scale-105 active:bg-sky-400'
            }`}
          >
            <Navigation className={`w-5 h-5 -rotate-45 ${dashCooldownRatio > 0 ? 'text-slate-500' : 'text-sky-200 animate-pulse'}`} />
            <span className="text-[9px] tracking-wider mt-0.5">DASH</span>

            {/* Radial / Ring Cooldown Overlay */}
            {dashCooldownRatio > 0 && (
              <div 
                className="absolute inset-0 rounded-full bg-slate-950/60 flex items-center justify-center text-[10px] font-mono font-bold text-slate-300"
              >
                {(dashCooldownRatio * 1.0).toFixed(1)}s
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
