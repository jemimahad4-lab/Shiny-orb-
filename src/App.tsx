import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameMode, 
  LevelConfig, 
  DailyChallengeInfo, 
  PowerUpActive, 
  GameOverStats, 
  LevelStats, 
  Achievement, 
  CharacterId, 
  ThemeId, 
  GameSettings,
  PlayerSaveData,
  LeaderboardEntry 
} from './types/game';
import { 
  loadSaveData, 
  saveSaveData, 
  updateAchievementProgress, 
  recordLeaderboardEntry, 
  saveSettings, 
  savePlayerName, 
  unlockCharacter, 
  unlockTheme,
  recordDailyChallengeAttempt
} from './utils/storage';
import { getTodayDailyChallenge } from './utils/daily';
import { sound } from './utils/audio';
import { LEVELS } from './data/levels';
import { CHARACTERS, THEMES } from './data/cosmetics';
import { INITIAL_ACHIEVEMENTS } from './data/achievements';
import { GameEngine } from './game/engine';

import { HeaderBar } from './components/HeaderBar';
import { HomeScreen } from './components/HomeScreen';
import { GameHUD } from './components/GameHUD';
import { LevelSelectModal } from './components/LevelSelectModal';
import { ModesModal } from './components/ModesModal';
import { CharactersModal } from './components/CharactersModal';
import { ThemesModal } from './components/ThemesModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { AchievementsModal } from './components/AchievementsModal';
import { DailyChallengeModal } from './components/DailyChallengeModal';
import { SettingsModal } from './components/SettingsModal';
import { TutorialModal } from './components/TutorialModal';
import { ExportModal } from './components/ExportModal';
import { GameOverModal } from './components/GameOverModal';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { AchievementToast } from './components/AchievementToast';

export default function App() {
  // Persistent Save State
  const [saveData, setSaveData] = useState<PlayerSaveData>(() => loadSaveData());

  // View States
  const [screen, setScreen] = useState<'home' | 'game'>('home');
  const [activeModal, setActiveModal] = useState<
    'levels' | 'modes' | 'characters' | 'themes' | 'leaderboard' | 'achievements' | 'daily' | 'settings' | 'tutorial' | 'export' | null
  >(null);

  // In-Game States
  const [currentGameMode, setCurrentGameMode] = useState<GameMode>('classic');
  const [currentLevel, setCurrentLevel] = useState<LevelConfig | null>(null);
  const [todayDaily, setTodayDaily] = useState<DailyChallengeInfo>(() => getTodayDailyChallenge());

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [maxLives, setMaxLives] = useState(3);
  const [activePowerUps, setActivePowerUps] = useState<PowerUpActive[]>([]);
  const [objectiveCurrent, setObjectiveCurrent] = useState(0);
  const [objectiveTarget, setObjectiveTarget] = useState(1);
  const [dashCooldownRatio, setDashCooldownRatio] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [timeAttackRemaining, setTimeAttackRemaining] = useState(60);

  // Outcome Modals
  const [gameOverStats, setGameOverStats] = useState<GameOverStats | null>(null);
  const [levelCompleteStats, setLevelCompleteStats] = useState<LevelStats | null>(null);

  // Unlocked Achievement Toast
  const [toastAchievement, setToastAchievement] = useState<Achievement | null>(null);

  // Canvas & Engine Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Sync Audio settings with audio system
  useEffect(() => {
    sound.setSoundEnabled(saveData.settings.soundEnabled);
    sound.setMusicEnabled(saveData.settings.musicEnabled);
  }, []);

  // Update Daily Challenge status based on save data
  useEffect(() => {
    const dailyInfo = getTodayDailyChallenge();
    const isCompleted = saveData.dailyChallenges[dailyInfo.dateKey]?.completed || false;
    const bestScore = saveData.dailyChallenges[dailyInfo.dateKey]?.score || 0;
    setTodayDaily({
      ...dailyInfo,
      completed: isCompleted,
      bestScore: bestScore
    });
  }, [saveData.dailyChallenges]);

  // Achievement unlock helper
  const handleUnlockAchievement = useCallback((achId: string) => {
    setSaveData(prev => {
      const { updatedSaveData, unlockedAchievement } = updateAchievementProgress(prev, achId, 9999);
      if (unlockedAchievement) {
        setToastAchievement(unlockedAchievement);
      }
      return updatedSaveData;
    });
  }, []);

  // Setup / Initialize Game Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, {
      selectedCharacter: saveData.selectedCharacter,
      selectedTheme: saveData.selectedTheme,
      reducedMotion: saveData.settings.reducedMotion,
      graphicsQuality: saveData.settings.graphicsQuality,
      soundEnabled: saveData.settings.soundEnabled,
      onScoreUpdate: (newScore, newCombo) => {
        setScore(newScore);
        setCombo(newCombo);
      },
      onLivesUpdate: (curLives, mxb) => {
        setLives(curLives);
        setMaxLives(mxb);
      },
      onPowerUpsUpdate: (pws) => {
        setActivePowerUps([...pws]);
      },
      onObjectiveUpdate: (cur, tgt) => {
        setObjectiveCurrent(cur);
        setObjectiveTarget(tgt);
      },
      onDashCooldownUpdate: (ratio) => {
        setDashCooldownRatio(ratio);
      },
      onTimeAttackTick: (remaining) => {
        setTimeAttackRemaining(remaining);
      },
      onGameOver: (stats) => {
        // Record save data & leaderboard
        setSaveData(prev => {
          const isNewHigh = stats.score > prev.highScore;
          const nextCoins = prev.coins + stats.coinsEarned;

          // Record entry to leaderboard
          const lbEntry: LeaderboardEntry = {
            id: `lb_${Date.now()}`,
            playerName: prev.playerName,
            score: stats.score,
            date: new Date().toLocaleDateString(),
            mode: stats.mode,
            level: stats.levelId,
            combo: stats.maxCombo,
            character: prev.selectedCharacter
          };

          const withLb = recordLeaderboardEntry(prev, lbEntry);

          // Update general stats
          let nextState: PlayerSaveData = {
            ...withLb,
            coins: nextCoins,
            highScore: Math.max(prev.highScore, stats.score),
            stats: {
              ...prev.stats,
              gamesPlayed: prev.stats.gamesPlayed + 1,
              totalScore: prev.stats.totalScore + stats.score,
              totalCoinsEarned: prev.stats.totalCoinsEarned + stats.coinsEarned,
              spikesDodged: prev.stats.spikesDodged + stats.spikesDodged,
              nearMisses: prev.stats.nearMisses + stats.nearMisses,
              highestCombo: Math.max(prev.stats.highestCombo, stats.maxCombo),
              totalSurvivalTime: prev.stats.totalSurvivalTime + stats.survivalTime
            }
          };

          // Check for achievements
          if (nextState.stats.gamesPlayed >= 1) {
            const res = updateAchievementProgress(nextState, 'first_game', 1);
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }
          if (stats.score >= 1000) {
            const res = updateAchievementProgress(nextState, 'score_1000', stats.score);
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }
          if (stats.score >= 5000) {
            const res = updateAchievementProgress(nextState, 'score_5000', stats.score);
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }
          if (stats.maxCombo >= 5) {
            const res = updateAchievementProgress(nextState, 'combo_5', stats.maxCombo);
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }
          if (stats.maxCombo >= 10) {
            const res = updateAchievementProgress(nextState, 'combo_10', stats.maxCombo);
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }
          if (stats.survivalTime >= 60) {
            const res = updateAchievementProgress(nextState, 'survive_60s', Math.floor(stats.survivalTime));
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }

          saveSaveData(nextState);
          return nextState;
        });

        setGameOverStats(stats);
      },
      onLevelComplete: (stats) => {
        // Record level progress & stars
        setSaveData(prev => {
          const lvlId = stats.levelId;
          const prevLvl = prev.levels[lvlId] || { unlocked: true, completed: false, stars: 0, bestScore: 0 };
          const newStars = Math.max(prevLvl.stars, stats.stars);
          const newBestScore = Math.max(prevLvl.bestScore, stats.score);

          const updatedLevels = {
            ...prev.levels,
            [lvlId]: {
              unlocked: true,
              completed: true,
              stars: newStars,
              bestScore: newBestScore
            }
          };

          // Unlock next level if available
          if (lvlId < 30) {
            const nextLvlId = lvlId + 1;
            const existingNext = updatedLevels[nextLvlId] || { unlocked: false, completed: false, stars: 0, bestScore: 0 };
            updatedLevels[nextLvlId] = {
              ...existingNext,
              unlocked: true
            };
          }

          // Total coins earned: harvested + star bonus + level completion bonus
          const levelDef = LEVELS.find(l => l.id === lvlId);
          const bonusCoins = (levelDef?.rewardCoins || 50) + (stats.stars * 10);
          const totalEarnedCoins = stats.coinsEarned + bonusCoins;

          let nextState: PlayerSaveData = {
            ...prev,
            coins: prev.coins + totalEarnedCoins,
            levels: updatedLevels,
            stats: {
              ...prev.stats,
              levelsCompleted: Object.values(updatedLevels).filter((l: any) => l.completed).length,
              totalCoinsEarned: prev.stats.totalCoinsEarned + totalEarnedCoins
            }
          };

          // Level achievements
          const completedCount = nextState.stats.levelsCompleted;
          if (completedCount >= 1) {
            const res = updateAchievementProgress(nextState, 'level_1', 1);
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }
          if (completedCount >= 10) {
            const res = updateAchievementProgress(nextState, 'level_10', completedCount);
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }
          if (completedCount >= 30) {
            const res = updateAchievementProgress(nextState, 'level_30', completedCount);
            nextState = res.updatedSaveData;
            if (res.unlockedAchievement) setToastAchievement(res.unlockedAchievement);
          }

          saveSaveData(nextState);
          return nextState;
        });

        setLevelCompleteStats(stats);
      },
      onDailyComplete: (stats) => {
        // Record daily challenge completion
        setSaveData(prev => {
          const res = recordDailyChallengeAttempt(prev, todayDaily.dateKey, stats.score, true);
          let nextState = res.updatedSaveData;
          nextState.coins += todayDaily.rewardCoins;

          // Achievement for daily
          const achRes = updateAchievementProgress(nextState, 'daily_first', 1);
          nextState = achRes.updatedSaveData;
          if (achRes.unlockedAchievement) setToastAchievement(achRes.unlockedAchievement);

          saveSaveData(nextState);
          return nextState;
        });
      },
      onAchievementTrigger: (achId) => {
        handleUnlockAchievement(achId);
      }
    });

    engineRef.current = engine;

    // Start background attract mode on home screen
    engine.startAttractMode();

    return () => {
      engine.destroy();
    };
  }, []);

  // Update engine cosmetics when character/theme changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateCosmetics(saveData.selectedCharacter, saveData.selectedTheme);
    }
  }, [saveData.selectedCharacter, saveData.selectedTheme]);

  // Update engine settings when settings change
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateSettings({
        reducedMotion: saveData.settings.reducedMotion,
        graphicsQuality: saveData.settings.graphicsQuality,
        soundEnabled: saveData.settings.soundEnabled
      });
    }
  }, [saveData.settings]);

  // Start Play Session
  const startGame = useCallback((mode: GameMode, levelToPlay?: LevelConfig) => {
    setGameOverStats(null);
    setLevelCompleteStats(null);
    setIsPaused(false);
    setActiveModal(null);
    setCurrentGameMode(mode);

    const targetLevel = levelToPlay || (mode === 'levels' ? LEVELS[0] : null);
    setCurrentLevel(targetLevel);

    setScreen('game');

    if (engineRef.current) {
      engineRef.current.startNewGame(
        mode,
        targetLevel,
        mode === 'daily' ? todayDaily : null
      );
    }
  }, [todayDaily]);

  // Handle Quick Play
  const handleQuickPlay = useCallback(() => {
    startGame('classic');
  }, [startGame]);

  // Pause / Resume
  const handleTogglePause = useCallback(() => {
    if (!engineRef.current) return;
    const newPauseState = !isPaused;
    setIsPaused(newPauseState);
    if (newPauseState) {
      engineRef.current.pause();
    } else {
      engineRef.current.resume();
    }
  }, [isPaused]);

  // Dash trigger
  const handleTriggerDash = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerDash();
    }
  }, []);

  // Return to Home
  const handleReturnHome = useCallback(() => {
    setGameOverStats(null);
    setLevelCompleteStats(null);
    setIsPaused(false);
    setActiveModal(null);
    setScreen('home');

    if (engineRef.current) {
      engineRef.current.startAttractMode();
    }
  }, []);

  // Restart current run
  const handleRestartRun = useCallback(() => {
    startGame(currentGameMode, currentLevel || undefined);
  }, [startGame, currentGameMode, currentLevel]);

  // Next level in campaign
  const handleNextLevel = useCallback(() => {
    if (!currentLevel) return;
    const nextLvl = LEVELS.find(l => l.id === currentLevel.id + 1);
    if (nextLvl) {
      startGame('levels', nextLvl);
    } else {
      handleReturnHome();
    }
  }, [currentLevel, startGame, handleReturnHome]);

  // Unlock Character
  const handleUnlockCharacter = useCallback((id: CharacterId, cost: number) => {
    setSaveData(prev => {
      let nextState = unlockCharacter(prev, id, cost);
      // Check skin collector achievements
      const skinCount = nextState.unlockedCharacters.length;
      if (skinCount >= 3) {
        const achRes = updateAchievementProgress(nextState, 'unlock_3_skins', skinCount);
        nextState = achRes.updatedSaveData;
        if (achRes.unlockedAchievement) setToastAchievement(achRes.unlockedAchievement);
      }
      if (skinCount >= 8) {
        const achRes = updateAchievementProgress(nextState, 'unlock_all_skins', skinCount);
        nextState = achRes.updatedSaveData;
        if (achRes.unlockedAchievement) setToastAchievement(achRes.unlockedAchievement);
      }
      return nextState;
    });
  }, []);

  // Unlock Theme
  const handleUnlockTheme = useCallback((id: ThemeId, cost: number) => {
    setSaveData(prev => {
      let nextState = unlockTheme(prev, id, cost);
      const themeCount = nextState.unlockedThemes.length;
      if (themeCount >= 3) {
        const achRes = updateAchievementProgress(nextState, 'unlock_3_themes', themeCount);
        nextState = achRes.updatedSaveData;
        if (achRes.unlockedAchievement) setToastAchievement(achRes.unlockedAchievement);
      }
      return nextState;
    });
  }, []);

  // Reset all progress
  const handleResetProgress = useCallback(() => {
    localStorage.removeItem('dodge_the_spikes_2_save');
    const fresh = loadSaveData();
    setSaveData(fresh);
    handleReturnHome();
  }, [handleReturnHome]);

  // Audio toggles
  const handleToggleSound = useCallback(() => {
    const next = !saveData.settings.soundEnabled;
    const newSettings = { ...saveData.settings, soundEnabled: next };
    setSaveData(prev => saveSettings(prev, newSettings));
    sound.setSoundEnabled(next);
  }, [saveData.settings]);

  const handleToggleMusic = useCallback(() => {
    const next = !saveData.settings.musicEnabled;
    const newSettings = { ...saveData.settings, musicEnabled: next };
    setSaveData(prev => saveSettings(prev, newSettings));
    sound.setMusicEnabled(next);
  }, [saveData.settings]);

  // Total completed levels count
  const totalLevelsCompleted = Object.values(saveData.levels).filter((l: any) => l.completed).length;

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-['Outfit'] select-none flex flex-col items-center justify-between">
      {/* 1. Underlying 60FPS High Performance Canvas Stage */}
      <canvas
        ref={canvasRef}
        id="game-canvas"
        className="absolute inset-0 w-full h-full block touch-none z-0 cursor-crosshair"
      />

      {/* 2. Top Header Bar */}
      <HeaderBar
        coins={saveData.coins}
        selectedCharacter={saveData.selectedCharacter}
        soundEnabled={saveData.settings.soundEnabled}
        musicEnabled={saveData.settings.musicEnabled}
        onToggleSound={handleToggleSound}
        onToggleMusic={handleToggleMusic}
        onOpenSettings={() => setActiveModal('settings')}
        onOpenCharacters={() => setActiveModal('characters')}
        onOpenExport={() => setActiveModal('export')}
        isInGame={screen === 'game'}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />

      {/* 3. Screen Views */}
      {screen === 'home' && (
        <HomeScreen
          highScore={saveData.highScore}
          totalLevelsCompleted={totalLevelsCompleted}
          dailyCompleted={todayDaily.completed}
          unlockedAchievementsCount={saveData.stats.achievementsUnlocked}
          onPlayQuick={handleQuickPlay}
          onOpenLevels={() => setActiveModal('levels')}
          onOpenModes={() => setActiveModal('modes')}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenCharacters={() => setActiveModal('characters')}
          onOpenThemes={() => setActiveModal('themes')}
          onOpenAchievements={() => setActiveModal('achievements')}
          onOpenDaily={() => setActiveModal('daily')}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenTutorial={() => setActiveModal('tutorial')}
          onOpenExport={() => setActiveModal('export')}
        />
      )}

      {screen === 'game' && (
        <GameHUD
          score={score}
          combo={combo}
          lives={lives}
          maxLives={maxLives}
          activePowerUps={activePowerUps}
          mode={currentGameMode}
          currentLevel={currentLevel}
          dailyChallenge={todayDaily}
          objectiveCurrent={objectiveCurrent}
          objectiveTarget={objectiveTarget}
          dashCooldownRatio={dashCooldownRatio}
          onTriggerDash={handleTriggerDash}
          timeAttackRemaining={timeAttackRemaining}
        />
      )}

      {/* 4. Pause Overlay */}
      {isPaused && screen === 'game' && (
        <div className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center gap-4 max-w-xs w-full shadow-2xl text-center">
            <h3 className="font-['Chakra_Petch'] text-2xl font-black text-white tracking-wider">
              GAME PAUSED
            </h3>
            <p className="text-xs text-slate-400">
              Catch your breath. The spikes will be waiting.
            </p>
            <div className="flex flex-col gap-2 w-full mt-2">
              <button
                id="pause-resume-btn"
                onClick={handleTogglePause}
                className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all"
              >
                Resume
              </button>
              <button
                id="pause-restart-btn"
                onClick={handleRestartRun}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
              >
                Restart
              </button>
              <button
                id="pause-quit-btn"
                onClick={handleReturnHome}
                className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl font-semibold text-xs active:scale-95 transition-all"
              >
                Quit to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Modals */}
      {activeModal === 'levels' && (
        <LevelSelectModal
          levelsProgress={saveData.levels}
          onSelectLevel={(lvl) => startGame('levels', lvl)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'modes' && (
        <ModesModal
          onSelectMode={(mode) => startGame(mode)}
          onOpenLevels={() => setActiveModal('levels')}
          onOpenDaily={() => setActiveModal('daily')}
          onClose={() => setActiveModal(null)}
          classicHighScore={saveData.highScore}
          timeAttackHighScore={saveData.stats.highestCombo}
          dailyCompleted={todayDaily.completed}
        />
      )}

      {activeModal === 'characters' && (
        <CharactersModal
          coins={saveData.coins}
          unlockedCharacters={saveData.unlockedCharacters}
          selectedCharacter={saveData.selectedCharacter}
          onSelectCharacter={(id) => {
            setSaveData(prev => {
              const updated = { ...prev, selectedCharacter: id };
              saveSaveData(updated);
              return updated;
            });
          }}
          onUnlockCharacter={handleUnlockCharacter}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'themes' && (
        <ThemesModal
          coins={saveData.coins}
          unlockedThemes={saveData.unlockedThemes}
          selectedTheme={saveData.selectedTheme}
          onSelectTheme={(id) => {
            setSaveData(prev => {
              const updated = { ...prev, selectedTheme: id };
              saveSaveData(updated);
              return updated;
            });
          }}
          onUnlockTheme={handleUnlockTheme}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'leaderboard' && (
        <LeaderboardModal
          leaderboard={saveData.leaderboard}
          playerName={saveData.playerName}
          onUpdatePlayerName={(name) => {
            setSaveData(prev => savePlayerName(prev, name));
          }}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal
          achievementsProgress={saveData.achievements}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'daily' && (
        <DailyChallengeModal
          daily={todayDaily}
          onPlayDaily={() => startGame('daily')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={saveData.settings}
          onUpdateSettings={(newSettings) => {
            setSaveData(prev => saveSettings(prev, newSettings));
          }}
          onResetProgress={handleResetProgress}
          onOpenTutorial={() => setActiveModal('tutorial')}
          onOpenExport={() => setActiveModal('export')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'tutorial' && (
        <TutorialModal onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'export' && (
        <ExportModal onClose={() => setActiveModal(null)} />
      )}

      {/* 6. Outcome Modals */}
      {gameOverStats && (
        <GameOverModal
          stats={gameOverStats}
          mode={currentGameMode}
          currentLevel={currentLevel}
          onRestart={handleRestartRun}
          onHome={handleReturnHome}
          onOpenLeaderboard={() => setActiveModal('leaderboard')}
          onOpenCharacters={() => setActiveModal('characters')}
        />
      )}

      {levelCompleteStats && currentLevel && (
        <LevelCompleteModal
          level={currentLevel}
          stats={levelCompleteStats}
          onNextLevel={handleNextLevel}
          onReplay={handleRestartRun}
          onLevelSelect={() => {
            setLevelCompleteStats(null);
            setActiveModal('levels');
          }}
          hasNextLevel={currentLevel.id < 30}
        />
      )}

      {/* 7. Unlocked Achievement Toast Notification */}
      <AchievementToast
        achievement={toastAchievement}
        onDismiss={() => setToastAchievement(null)}
      />
    </main>
  );
}
