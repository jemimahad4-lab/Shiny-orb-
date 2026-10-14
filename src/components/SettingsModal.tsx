import React, { useState } from 'react';
import { X, Volume2, Music, Smartphone, Eye, Sparkles, Trash2, HelpCircle, Check, RotateCcw, Download } from 'lucide-react';
import { GameSettings } from '../types/game';
import { sound } from '../utils/audio';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: GameSettings) => void;
  onResetProgress: () => void;
  onOpenTutorial: () => void;
  onOpenExport?: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onOpenTutorial,
  onOpenExport,
  onClose
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggle = (key: keyof GameSettings) => {
    sound.playButton();
    const updated = { ...settings, [key]: !settings[key] };
    if (key === 'soundEnabled') sound.setSoundEnabled(updated.soundEnabled);
    if (key === 'musicEnabled') sound.setMusicEnabled(updated.musicEnabled);
    onUpdateSettings(updated);
  };

  const setQuality = (quality: 'high' | 'medium' | 'low') => {
    sound.playButton();
    onUpdateSettings({ ...settings, graphicsQuality: quality });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-5 flex flex-col gap-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white">
            GAME SETTINGS
          </h2>
          <button
            id="settings-close-btn"
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

        {/* Toggles List */}
        <div className="flex flex-col gap-2.5">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700/80">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-sky-400" />
              <div>
                <span className="font-bold text-sm text-white block">Sound Effects</span>
                <span className="text-xs text-slate-400">Tactile arcade feedback & hits</span>
              </div>
            </div>
            <button
              onClick={() => toggle('soundEnabled')}
              className={`w-12 h-6.5 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.soundEnabled ? 'bg-sky-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                settings.soundEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Synth Music */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700/80">
            <div className="flex items-center gap-3">
              <Music className="w-5 h-5 text-purple-400" />
              <div>
                <span className="font-bold text-sm text-white block">Synth Music</span>
                <span className="text-xs text-slate-400">Procedural 8-bit retro arcade loop</span>
              </div>
            </div>
            <button
              onClick={() => toggle('musicEnabled')}
              className={`w-12 h-6.5 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.musicEnabled ? 'bg-purple-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                settings.musicEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Vibration */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700/80">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <div>
                <span className="font-bold text-sm text-white block">Haptic Vibration</span>
                <span className="text-xs text-slate-400">Mobile collision vibrations</span>
              </div>
            </div>
            <button
              onClick={() => toggle('vibrationEnabled')}
              className={`w-12 h-6.5 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.vibrationEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                settings.vibrationEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800 border border-slate-700/80">
            <div className="flex items-center gap-3">
              <Eye className="w-5 h-5 text-amber-400" />
              <div>
                <span className="font-bold text-sm text-white block">Reduced Motion</span>
                <span className="text-xs text-slate-400">Disables intense screen shake</span>
              </div>
            </div>
            <button
              onClick={() => toggle('reducedMotion')}
              className={`w-12 h-6.5 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.reducedMotion ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                settings.reducedMotion ? 'translate-x-5.5' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Graphics Quality */}
          <div className="p-3 rounded-xl bg-slate-800 border border-slate-700/80 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-sm text-white">Graphics & Particle Quality</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['low', 'medium', 'high'] as const).map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                    settings.graphicsQuality === q
                      ? 'bg-sky-500 text-white shadow-sm'
                      : 'bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Auxiliary Actions: How to Play, Export & Reset */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
          {onOpenExport && (
            <button
              onClick={() => {
                sound.playButton();
                onOpenExport();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600/40 to-teal-600/40 hover:from-emerald-600/60 hover:to-teal-600/60 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Download Game (.ZIP) for Portals & Monetization</span>
            </button>
          )}

          <button
            onClick={() => {
              sound.playButton();
              onOpenTutorial();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Open Interactive Tutorial</span>
          </button>

          {showConfirmReset ? (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 flex flex-col gap-2">
              <span className="text-xs text-rose-200 font-bold text-center">
                Are you sure? This erases all coins, unlocked skins, and scores!
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    sound.playHit();
                    onResetProgress();
                    setShowConfirmReset(false);
                  }}
                  className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold"
                >
                  Yes, Erase Everything
                </button>
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full py-2 px-4 rounded-xl text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/20 text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset Game Progress</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
