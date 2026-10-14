import React from 'react';
import { Volume2, VolumeX, Music, Settings, Coins, Pause, Play, Sparkles, Download } from 'lucide-react';
import { sound } from '../utils/audio';
import { CharacterId } from '../types/game';
import { CHARACTERS } from '../data/cosmetics';

interface HeaderBarProps {
  coins: number;
  selectedCharacter: CharacterId;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenSettings: () => void;
  onOpenCharacters?: () => void;
  onOpenExport?: () => void;
  isInGame?: boolean;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  coins,
  selectedCharacter,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onOpenSettings,
  onOpenCharacters,
  onOpenExport,
  isInGame = false,
  isPaused = false,
  onTogglePause
}) => {
  const char = CHARACTERS.find(c => c.id === selectedCharacter) || CHARACTERS[0];

  return (
    <header className="w-full max-w-lg mx-auto flex items-center justify-between px-3 py-2 z-30 select-none">
      {/* Coins Badge */}
      <div 
        id="header-coins-badge"
        onClick={() => {
          sound.playButton();
          if (onOpenCharacters && !isInGame) onOpenCharacters();
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-amber-950/20 transition-all active:scale-95 ${!isInGame ? 'cursor-pointer hover:border-amber-400/60' : ''}`}
      >
        <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="font-extrabold text-amber-300 text-sm tracking-wide font-mono">
          {coins.toLocaleString()}
        </span>
        {!isInGame && (
          <span className="text-[10px] text-amber-500/80 uppercase font-bold ml-0.5">
            +Shop
          </span>
        )}
      </div>

      {/* Center Character Avatar / Status */}
      {!isInGame && (
        <button
          id="header-character-btn"
          onClick={() => {
            sound.playButton();
            if (onOpenCharacters) onOpenCharacters();
          }}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700/60 backdrop-blur-md hover:border-sky-500/60 transition-all text-xs text-slate-300 active:scale-95"
        >
          <div 
            className="w-3.5 h-3.5 rounded-full shadow-sm"
            style={{ backgroundColor: char.colors.primary, boxShadow: `0 0 8px ${char.colors.glow}` }}
          />
          <span className="font-semibold text-slate-200">{char.name}</span>
        </button>
      )}

      {/* Right Action Icons */}
      <div className="flex items-center gap-1.5">
        {isInGame && onTogglePause && (
          <button
            id="header-pause-btn"
            onClick={() => {
              sound.playButton();
              onTogglePause();
            }}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:border-sky-500 active:scale-90 transition-all"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current text-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>
        )}

        <button
          id="header-sound-btn"
          onClick={() => {
            sound.playButton();
            onToggleSound();
          }}
          className={`p-2 rounded-xl bg-slate-900/80 border text-slate-200 hover:text-white active:scale-90 transition-all ${soundEnabled ? 'border-slate-700/80 text-sky-400' : 'border-red-900/50 text-slate-500'}`}
          aria-label="Toggle Sound"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          id="header-music-btn"
          onClick={() => {
            sound.playButton();
            onToggleMusic();
          }}
          className={`p-2 rounded-xl bg-slate-900/80 border text-slate-200 hover:text-white active:scale-90 transition-all ${musicEnabled ? 'border-purple-600/70 text-purple-400 animate-pulse' : 'border-slate-800 text-slate-500'}`}
          aria-label="Toggle Music"
        >
          <Music className="w-4 h-4" />
        </button>

        {!isInGame && onOpenExport && (
          <button
            id="header-export-btn"
            onClick={() => {
              sound.playButton();
              onOpenExport();
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white active:scale-90 transition-all cursor-pointer shadow-sm"
            title="Download Game ZIP (.ZIP)"
            aria-label="Download Game ZIP"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">.ZIP</span>
          </button>
        )}

        {!isInGame && (
          <button
            id="header-settings-btn"
            onClick={() => {
              sound.playButton();
              onOpenSettings();
            }}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-500 active:scale-90 transition-all"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
