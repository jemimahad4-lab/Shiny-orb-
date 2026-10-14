import React, { useState } from 'react';
import { X, Check, Lock, Coins, Sparkles } from 'lucide-react';
import { CharacterId, CharacterConfig } from '../types/game';
import { CHARACTERS } from '../data/cosmetics';
import { sound } from '../utils/audio';

interface CharactersModalProps {
  coins: number;
  unlockedCharacters: CharacterId[];
  selectedCharacter: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  onUnlockCharacter: (id: CharacterId, cost: number) => void;
  onClose: () => void;
}

export const CharactersModal: React.FC<CharactersModalProps> = ({
  coins,
  unlockedCharacters,
  selectedCharacter,
  onSelectCharacter,
  onUnlockCharacter,
  onClose
}) => {
  const [activePreview, setActivePreview] = useState<CharacterConfig>(
    CHARACTERS.find(c => c.id === selectedCharacter) || CHARACTERS[0]
  );

  const isUnlocked = unlockedCharacters.includes(activePreview.id);
  const isSelected = selectedCharacter === activePreview.id;
  const canAfford = coins >= activePreview.price;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900">
          <div>
            <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white flex items-center gap-2">
              <span>DRONE HANGAR</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-mono">
                {unlockedCharacters.length} / {CHARACTERS.length} Skins
              </span>
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-mono font-bold mt-0.5">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{coins.toLocaleString()} Coins Available</span>
            </div>
          </div>

          <button
            id="characters-close-btn"
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

        {/* Hero Preview Stage */}
        <div className="relative w-full h-44 bg-gradient-to-b from-slate-950 to-slate-900/90 flex flex-col items-center justify-center border-b border-slate-800 overflow-hidden">
          {/* Subtle Ambient Radial Backlight */}
          <div 
            className="absolute w-36 h-36 rounded-full blur-2xl opacity-40 transition-all duration-500"
            style={{ backgroundColor: activePreview.colors.glow }}
          />

          {/* Floating animated character model */}
          <div className="relative z-10 flex flex-col items-center animate-bounce duration-1000">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300"
              style={{ 
                backgroundColor: activePreview.colors.primary,
                boxShadow: `0 0 24px ${activePreview.colors.glow}, inset 0 0 10px rgba(255,255,255,0.5)`,
                border: `3px solid ${activePreview.colors.secondary}`
              }}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow-inner animate-pulse" />
            </div>
          </div>

          <div className="relative z-10 mt-3 text-center">
            <h3 className="font-['Chakra_Petch'] font-extrabold text-lg text-white">
              {activePreview.name}
            </h3>
            <p className="text-xs text-slate-400 max-w-xs px-4">
              {activePreview.description}
            </p>
          </div>
        </div>

        {/* Character Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-4 gap-3 no-scrollbar">
          {CHARACTERS.map((char) => {
            const unlocked = unlockedCharacters.includes(char.id);
            const equipped = selectedCharacter === char.id;
            const isTarget = activePreview.id === char.id;

            return (
              <button
                key={char.id}
                id={`char-card-${char.id}`}
                onClick={() => {
                  sound.playButton();
                  setActivePreview(char);
                }}
                className={`relative flex flex-col items-center p-3 rounded-xl border transition-all cursor-pointer ${
                  isTarget
                    ? 'border-sky-400 bg-slate-800 shadow-lg scale-105'
                    : 'border-slate-800 bg-slate-900 hover:border-slate-700'
                }`}
              >
                {/* Equipped Badge */}
                {equipped && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}

                {/* Locked Badge */}
                {!unlocked && (
                  <div className="absolute top-1.5 left-1.5 text-slate-500">
                    <Lock className="w-3 h-3" />
                  </div>
                )}

                {/* Avatar Icon */}
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center my-1.5 transition-transform"
                  style={{
                    backgroundColor: char.colors.primary,
                    boxShadow: `0 0 10px ${char.colors.glow}`
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white/90" />
                </div>

                <span className="font-bold text-xs text-slate-200 mt-1 truncate max-w-full">
                  {char.name}
                </span>

                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {unlocked ? (equipped ? 'ACTIVE' : 'READY') : `${char.price} C`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-medium">Cosmetic Perk:</span>
            <span className="text-xs text-sky-400 font-bold">{activePreview.perkDescription}</span>
          </div>

          <div>
            {isUnlocked ? (
              <button
                id="char-equip-btn"
                onClick={() => {
                  sound.playButton();
                  onSelectCharacter(activePreview.id);
                }}
                disabled={isSelected}
                className={`py-2 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 cursor-default'
                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/30'
                }`}
              >
                {isSelected ? 'Equipped' : 'Equip Skin'}
              </button>
            ) : (
              <button
                id="char-unlock-btn"
                onClick={() => {
                  if (canAfford) {
                    sound.playAchievement();
                    onUnlockCharacter(activePreview.id, activePreview.price);
                  } else {
                    sound.playHit();
                  }
                }}
                disabled={!canAfford}
                className={`py-2 px-5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 active:scale-95 ${
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
    </div>
  );
};
