import React from 'react';
import { 
  Play, 
  Map, 
  Trophy, 
  User, 
  Palette, 
  Award, 
  Calendar, 
  Layers, 
  Settings, 
  Sparkles, 
  Zap,
  HelpCircle,
  Download
} from 'lucide-react';
import { sound } from '../utils/audio';

interface HomeScreenProps {
  highScore: number;
  totalLevelsCompleted: number;
  dailyCompleted: boolean;
  unlockedAchievementsCount: number;
  onPlayQuick: () => void;
  onOpenLevels: () => void;
  onOpenModes: () => void;
  onOpenLeaderboard: () => void;
  onOpenCharacters: () => void;
  onOpenThemes: () => void;
  onOpenAchievements: () => void;
  onOpenDaily: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onOpenExport: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  highScore,
  totalLevelsCompleted,
  dailyCompleted,
  unlockedAchievementsCount,
  onPlayQuick,
  onOpenLevels,
  onOpenModes,
  onOpenLeaderboard,
  onOpenCharacters,
  onOpenThemes,
  onOpenAchievements,
  onOpenDaily,
  onOpenSettings,
  onOpenTutorial,
  onOpenExport
}) => {
  return (
    <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-between h-full px-4 py-6 z-20 select-none overflow-y-auto no-scrollbar">
      {/* Top Banner / Subtitle */}
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-700/50 backdrop-blur-md text-[11px] text-sky-400 font-semibold uppercase tracking-wider animate-pulse">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Mobile Arcade Survival</span>
      </div>

      {/* Hero Game Logo & Title */}
      <div className="flex flex-col items-center my-auto py-4 text-center">
        <div className="relative inline-block">
          {/* Subtle Ambient Glow Backing */}
          <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-fuchsia-500/20 to-amber-500/20 blur-xl rounded-full opacity-70 animate-pulse pointer-events-none" />

          <h1 
            id="home-title"
            className="relative font-extrabold text-4xl sm:text-5xl tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_4px_16px_rgba(56,189,248,0.4)] font-['Chakra_Petch']"
          >
            DODGE THE
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="font-black text-4xl sm:text-5xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 drop-shadow-[0_4px_20px_rgba(244,63,94,0.6)] font-['Chakra_Petch']">
              SPIKES
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 text-white text-2xl sm:text-3xl font-black shadow-lg shadow-sky-500/40 border border-sky-300">
              2
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-medium mt-3 tracking-wide max-w-xs">
          Fast-paced reflex test. Dodge spikes, chain combos, and conquer all 30 sectors.
        </p>

        {/* High Score Pill */}
        {highScore > 0 && (
          <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold shadow-md">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>BEST: {highScore.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Center Main Action Buttons */}
      <div className="w-full flex flex-col items-center gap-3.5 my-auto">
        {/* Massive Animated Play Button */}
        <button
          id="home-play-btn"
          onClick={() => {
            sound.playButton();
            onPlayQuick();
          }}
          className="group relative w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-extrabold text-lg tracking-wider uppercase shadow-[0_8px_25px_rgba(56,189,248,0.4)] border border-sky-300/60 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 overflow-hidden cursor-pointer"
        >
          {/* Shimmer sweep effect */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
          <Play className="w-6 h-6 fill-current text-white drop-shadow" />
          <span className="font-['Chakra_Petch'] text-xl">SURVIVE NOW</span>
          <Zap className="w-5 h-5 text-yellow-300 fill-yellow-300 animate-pulse ml-1" />
        </button>

        {/* 2-Column Primary Grid: Levels & Game Modes */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          <button
            id="home-levels-btn"
            onClick={() => {
              sound.playButton();
              onOpenLevels();
            }}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-sky-500/80 text-white text-sm font-bold shadow-md active:scale-95 transition-all"
          >
            <Map className="w-4 h-4 text-sky-400" />
            <div className="flex flex-col text-left">
              <span className="text-xs uppercase font-extrabold leading-tight">30 Levels</span>
              <span className="text-[10px] text-slate-400 font-normal">{totalLevelsCompleted}/30 Cleared</span>
            </div>
          </button>

          <button
            id="home-modes-btn"
            onClick={() => {
              sound.playButton();
              onOpenModes();
            }}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-purple-500/80 text-white text-sm font-bold shadow-md active:scale-95 transition-all"
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <div className="flex flex-col text-left">
              <span className="text-xs uppercase font-extrabold leading-tight">Modes</span>
              <span className="text-[10px] text-slate-400 font-normal">Classic & Time</span>
            </div>
          </button>
        </div>

        {/* Daily Challenge Spotlight Banner */}
        <button
          id="home-daily-btn"
          onClick={() => {
            sound.playButton();
            onOpenDaily();
          }}
          className={`w-full flex items-center justify-between p-3 rounded-xl border backdrop-blur-md shadow-md transition-all active:scale-95 ${
            dailyCompleted 
              ? 'bg-slate-900/70 border-emerald-500/40 text-emerald-300' 
              : 'bg-gradient-to-r from-amber-950/40 to-slate-900/80 border-amber-500/50 hover:border-amber-400 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold uppercase tracking-wide">Daily Challenge</span>
              <span className="text-[10px] text-slate-400">
                {dailyCompleted ? 'Completed Today! ✓' : 'New Seed & Bonus Coins Available'}
              </span>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dailyCompleted ? 'bg-emerald-900/60 text-emerald-300' : 'bg-amber-500 text-slate-950 animate-pulse'}`}>
            {dailyCompleted ? 'DONE' : 'PLAY'}
          </span>
        </button>

        {/* Secondary Grid: Characters, Themes, Leaderboard, Achievements */}
        <div className="w-full grid grid-cols-4 gap-2 pt-1">
          {/* Characters */}
          <button
            id="home-characters-btn"
            onClick={() => {
              sound.playButton();
              onOpenCharacters();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-sky-500 text-slate-200 active:scale-90 transition-all"
          >
            <User className="w-5 h-5 text-sky-400 mb-1" />
            <span className="text-[10px] font-bold">Skins</span>
          </button>

          {/* Themes */}
          <button
            id="home-themes-btn"
            onClick={() => {
              sound.playButton();
              onOpenThemes();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-pink-500 text-slate-200 active:scale-90 transition-all"
          >
            <Palette className="w-5 h-5 text-pink-400 mb-1" />
            <span className="text-[10px] font-bold">Themes</span>
          </button>

          {/* Leaderboard */}
          <button
            id="home-leaderboard-btn"
            onClick={() => {
              sound.playButton();
              onOpenLeaderboard();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-amber-500 text-slate-200 active:scale-90 transition-all"
          >
            <Trophy className="w-5 h-5 text-amber-400 mb-1" />
            <span className="text-[10px] font-bold">Ranks</span>
          </button>

          {/* Achievements */}
          <button
            id="home-achievements-btn"
            onClick={() => {
              sound.playButton();
              onOpenAchievements();
            }}
            className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500 text-slate-200 active:scale-90 transition-all"
          >
            <Award className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-[10px] font-bold">{unlockedAchievementsCount}/18</span>
          </button>
        </div>
      </div>

      {/* Bottom Auxiliary Links: Tutorial, Download ZIP & Settings */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 pt-3">
        <button
          id="home-how-to-play-btn"
          onClick={() => {
            sound.playButton();
            onOpenTutorial();
          }}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors py-1 px-1.5 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Tutorial</span>
        </button>

        <button
          id="home-download-zip-btn"
          onClick={() => {
            sound.playButton();
            onOpenExport();
          }}
          className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-all py-1 px-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 active:scale-95 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download .ZIP</span>
        </button>

        <button
          id="home-footer-settings-btn"
          onClick={() => {
            sound.playButton();
            onOpenSettings();
          }}
          className="flex items-center gap-1 hover:text-slate-200 transition-colors py-1 px-1.5 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
};
