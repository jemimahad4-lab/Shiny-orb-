import React, { useState } from 'react';
import { X, Check, Lock, Coins, Palette } from 'lucide-react';
import { ThemeId, ThemeConfig } from '../types/game';
import { THEMES } from '../data/cosmetics';
import { sound } from '../utils/audio';

interface ThemesModalProps {
  coins: number;
  unlockedThemes: ThemeId[];
  selectedTheme: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  onUnlockTheme: (id: ThemeId, cost: number) => void;
  onClose: () => void;
}

export const ThemesModal: React.FC<ThemesModalProps> = ({
  coins,
  unlockedThemes,
  selectedTheme,
  onSelectTheme,
  onUnlockTheme,
  onClose
}) => {
  const [activePreview, setActivePreview] = useState<ThemeConfig>(
    THEMES.find(t => t.id === selectedTheme) || THEMES[0]
  );

  const isUnlocked = unlockedThemes.includes(activePreview.id);
  const isSelected = selectedTheme === activePreview.id;
  const canAfford = coins >= activePreview.price;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white flex items-center gap-2">
              <span>ATMOSPHERIC THEMES</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-mono">
                {unlockedThemes.length} / 6 Active
              </span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold mt-0.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{coins.toLocaleString()} Coins Available</span>
            </div>
          </div>

          <button
            id="themes-close-btn"
            onClick={() => {
              sound.playButton();
              onClose();
            }}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Theme Preview Box */}
        <div 
          className="relative w-full h-36 flex flex-col justify-end p-4 border-b border-slate-800 overflow-hidden transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${activePreview.bgGradient[0]}, ${activePreview.bgGradient[1]})`
          }}
        >
          {/* Ambient glow accent */}
          <div 
            className="absolute top-2 right-4 w-28 h-28 rounded-full blur-2xl opacity-40"
            style={{ backgroundColor: activePreview.ambientColor }}
          />

          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Live Theme Atmosphere
              </span>
              <h3 className="font-['Chakra_Petch'] text-xl font-extrabold text-white">
                {activePreview.name}
              </h3>
              <p className="text-xs text-slate-300/80 max-w-xs">
                {activePreview.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Themes Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 no-scrollbar">
          {THEMES.map((th) => {
            const unlocked = unlockedThemes.includes(th.id);
            const equipped = selectedTheme === th.id;
            const isTarget = activePreview.id === th.id;

            return (
              <div
                key={th.id}
                id={`theme-card-${th.id}`}
                onClick={() => {
                  sound.playButton();
                  setActivePreview(th);
                }}
                className={`relative flex flex-col justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isTarget
                    ? 'border-sky-400 bg-slate-800 shadow-lg scale-[1.02]'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* Header row in card */}
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-5 h-5 rounded-full shadow-sm"
                    style={{ backgroundColor: th.ambientColor, boxShadow: `0 0 10px ${th.ambientColor}` }}
                  />

                  {equipped && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  )}
                  {!unlocked && (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                <h4 className="font-['Chakra_Petch'] font-bold text-sm text-white">
                  {th.name}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {th.tagline}
                </p>

                <div className="mt-3 pt-2 border-t border-slate-750 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">
                    {unlocked ? 'Unlocked' : `${th.price} Coins`}
                  </span>
                  <div className="flex gap-1">
                    {th.particleColors.map((c, i) => (
                      <div 
                        key={i} 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-end">
          {isUnlocked ? (
            <button
              id="theme-apply-btn"
              onClick={() => {
                sound.playButton();
                onSelectTheme(activePreview.id);
              }}
              disabled={isSelected}
              className={`py-2 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 cursor-default'
                  : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
              }`}
            >
              {isSelected ? 'Equipped' : 'Apply Theme'}
            </button>
          ) : (
            <button
              id="theme-unlock-btn"
              onClick={() => {
                if (canAfford) {
                  sound.playAchievement();
                  onUnlockTheme(activePreview.id, activePreview.price);
                } else {
                  sound.playHit();
                }
              }}
              disabled={!canAfford}
              className={`py-2 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
                canAfford
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                  : 'bg-slate-800 text-slate-500 border border-slate-700/50 cursor-not-allowed'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Unlock for {activePreview.price}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
