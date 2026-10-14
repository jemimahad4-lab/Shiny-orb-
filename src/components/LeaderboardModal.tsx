import React, { useState } from 'react';
import { X, Trophy, Medal, User, Calendar, Flame, ChevronRight, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { LeaderboardEntry, GameMode } from '../types/game';
import { CHARACTERS } from '../data/cosmetics';
import { sound } from '../utils/audio';

interface LeaderboardModalProps {
  leaderboard: LeaderboardEntry[];
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  leaderboard,
  playerName,
  onUpdatePlayerName,
  onClose
}) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | GameMode>('all');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null);
  const [selectedRank, setSelectedRank] = useState<number>(1);

  const filteredEntries = leaderboard
    .filter(entry => selectedFilter === 'all' || entry.mode === selectedFilter)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  // Player's best entry
  const playerEntries = leaderboard.filter(e => e.playerName.toLowerCase() === playerName.toLowerCase());
  const playerBest = playerEntries.sort((a, b) => b.score - a.score)[0];

  const handleSaveName = () => {
    if (nameInput.trim()) {
      sound.playButton();
      onUpdatePlayerName(nameInput.trim());
      setIsEditingName(false);
    }
  };

  const handleRowClick = (entry: LeaderboardEntry, rank: number) => {
    sound.playButton();
    setSelectedEntry(entry);
    setSelectedRank(rank);
  };

  // Find cosmetic details of selected character
  const selectedCharacterConfig = selectedEntry
    ? CHARACTERS.find(c => c.id === selectedEntry.character) || CHARACTERS[0]
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-3 sm:p-4 select-none isolate">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="font-['Chakra_Petch'] text-xl font-bold text-white tracking-wide">
              LOCAL HALL OF FAME
            </h2>
          </div>

          <button
            id="lb-close-btn"
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

        {/* Player Identity Banner */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <User className="w-4 h-4" />
            </div>
            {isEditingName ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  maxLength={15}
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-slate-950 border border-sky-500 text-white text-xs px-2.5 py-1 rounded-lg focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-white rounded-lg text-xs font-bold active:scale-95 transition-all cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{playerName}</span>
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="text-[10px] text-sky-400 hover:underline cursor-pointer"
                  >
                    (Edit Name)
                  </button>
                </div>
                <span className="text-[10px] text-slate-400">
                  {playerBest ? `Personal Best: ${playerBest.score.toLocaleString()} pts` : 'No games recorded yet'}
                </span>
              </div>
            )}
          </div>

          {playerBest && (
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Top Combo</span>
              <div className="text-xs font-mono font-bold text-amber-400">
                {playerBest.combo}x
              </div>
            </div>
          )}
        </div>

        {/* Mode Filters */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          {(['all', 'classic', 'timeAttack', 'daily'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => {
                sound.playButton();
                setSelectedFilter(filter);
                setSelectedEntry(null);
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {filter === 'all' ? 'All Modes' : filter === 'timeAttack' ? 'Time Attack' : filter.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Helper Hint */}
        <div className="px-4 py-1.5 bg-slate-950/60 border-b border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Tap any player row to view full dossier & stats</span>
          <span className="text-sky-400 font-mono font-semibold">Top 10</span>
        </div>

        {/* Leaderboard Table List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No scores recorded for this category yet. Dodge some spikes!
            </div>
          ) : (
            filteredEntries.map((entry, index) => {
              const rank = index + 1;
              const isCurrentUser = entry.playerName.toLowerCase() === playerName.toLowerCase();
              const isSelected = selectedEntry?.id === entry.id;

              return (
                <div
                  key={entry.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleRowClick(entry, rank)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleRowClick(entry, rank);
                    }
                  }}
                  className={`group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer active:scale-[0.98] ${
                    isSelected
                      ? 'bg-sky-900/40 border-sky-400 shadow-md ring-1 ring-sky-400/50'
                      : isCurrentUser 
                        ? 'bg-sky-950/50 border-sky-500/40 hover:bg-sky-900/40 hover:border-sky-400' 
                        : 'bg-slate-800/80 border-slate-700/80 hover:bg-slate-750 hover:border-slate-600'
                  }`}
                  aria-label={`View record details for ${entry.playerName}, Rank ${rank}`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      index === 0 ? 'bg-amber-500 text-slate-950 font-black shadow-sm shadow-amber-500/30' :
                      index === 1 ? 'bg-slate-300 text-slate-900 font-bold shadow-sm' :
                      index === 2 ? 'bg-amber-700 text-amber-100 font-bold' :
                      'bg-slate-900 text-slate-400 border border-slate-700/50'
                    }`}>
                      {rank}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-sm font-bold truncate max-w-[130px] ${isCurrentUser ? 'text-sky-300' : 'text-slate-100'}`}>
                          {entry.playerName}
                        </span>
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded bg-sky-500/30 text-sky-300 text-[9px] font-bold uppercase tracking-wider">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="capitalize">{entry.mode === 'timeAttack' ? 'Time Attack' : entry.mode}</span>
                        <span>•</span>
                        <span>{entry.date}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {entry.combo > 0 && (
                      <span className="text-[11px] font-mono text-amber-400/90 font-bold hidden sm:inline">
                        {entry.combo}x
                      </span>
                    )}
                    <span className="font-['Chakra_Petch'] font-black text-base text-white tracking-wider">
                      {entry.score.toLocaleString()}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Player Detail Modal Overlay */}
        {selectedEntry && (
          <div className="absolute inset-0 z-20 bg-slate-950/95 p-4 flex flex-col justify-between animate-fadeIn">
            <div>
              {/* Detail Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="font-['Chakra_Petch'] text-base font-bold text-white tracking-wide">
                    RUN DOSSIER & RECORD
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer active:scale-95"
                  aria-label="Close details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rank & Player Title Card */}
              <div className="mt-3.5 p-3.5 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-black ${
                    selectedRank === 1 ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30' :
                    selectedRank === 2 ? 'bg-slate-200 text-slate-900' :
                    selectedRank === 3 ? 'bg-amber-700 text-amber-100' :
                    'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}>
                    <span className="text-[9px] uppercase font-bold tracking-tight -mb-1">Rank</span>
                    <span className="text-base font-['Chakra_Petch']">#{selectedRank}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-base text-white">
                        {selectedEntry.playerName}
                      </h4>
                      {selectedEntry.playerName.toLowerCase() === playerName.toLowerCase() && (
                        <span className="px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">
                      {selectedRank === 1 ? 'Current Sector Record Holder' : `Hall of Fame Contender`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">SCORE</div>
                  <div className="font-['Chakra_Petch'] font-black text-xl text-sky-400">
                    {selectedEntry.score.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Detailed Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Game Mode</span>
                  <span className="font-bold text-sm text-slate-100 mt-0.5 capitalize">
                    {selectedEntry.mode === 'timeAttack' ? 'Time Attack 60s' : selectedEntry.mode === 'daily' ? 'Daily Challenge' : 'Endless Classic'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-400" />
                    <span>Best Combo</span>
                  </span>
                  <span className="font-mono font-bold text-sm text-amber-400 mt-0.5">
                    {selectedEntry.combo > 0 ? `${selectedEntry.combo}x Combo Multiplier` : 'None'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>Date Achieved</span>
                  </span>
                  <span className="font-mono text-xs text-slate-200 mt-0.5">
                    {selectedEntry.date}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col">
                  <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Dodger Tier</span>
                  </span>
                  <span className="font-bold text-xs text-emerald-400 mt-0.5">
                    {selectedEntry.score >= 3000 ? 'Apex Grandmaster' : selectedEntry.score >= 2000 ? 'Master Survivor' : selectedEntry.score >= 1000 ? 'Adept Dodger' : 'Novice Runner'}
                  </span>
                </div>
              </div>

              {/* Equipped Drone Info */}
              {selectedCharacterConfig && (
                <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center border shadow-sm"
                      style={{
                        backgroundColor: selectedCharacterConfig.colors.primary + '20',
                        borderColor: selectedCharacterConfig.colors.primary
                      }}
                    >
                      <Sparkles className="w-4 h-4" style={{ color: selectedCharacterConfig.colors.primary }} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">
                        Equipped: {selectedCharacterConfig.name}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {selectedCharacterConfig.perkDescription}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
              {selectedEntry.playerName.toLowerCase() === playerName.toLowerCase() && (
                <button
                  onClick={() => {
                    setSelectedEntry(null);
                    setIsEditingName(true);
                  }}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/50 text-sky-300 font-bold text-xs active:scale-95 transition-all cursor-pointer text-center"
                >
                  Edit My Name
                </button>
              )}
              <button
                onClick={() => setSelectedEntry(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs active:scale-95 transition-all cursor-pointer text-center"
              >
                Back to Leaderboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
