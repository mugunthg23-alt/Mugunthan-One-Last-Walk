import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Volume2, VolumeX, Sparkles, Heart, LayoutGrid, RotateCcw, Users } from 'lucide-react';
import { AppScreen, Person } from './types.ts';
import { getPeople, findPersonByIdOrSlug } from './data/peopleService.ts';
import { CinematicBackground } from './components/CinematicBackground.tsx';
import { IntroScreen } from './components/IntroScreen.tsx';
import { TransitionScreen } from './components/TransitionScreen.tsx';
import { DirectoryScreen } from './components/DirectoryScreen.tsx';
import { PersonalMessageScreen } from './components/PersonalMessageScreen.tsx';
import { FinalScreen } from './components/FinalScreen.tsx';
import { AdminScreen } from './components/AdminScreen.tsx';
import { JerryMugunthan } from './components/JerryMugunthan.tsx';
import { ambientAudio } from './utils/audio.ts';

export default function App() {
  // Start the intro directly from "I could have written a farewell email..." per user request
  const [screen, setScreen] = useState<AppScreen>('intro');
  const [people, setPeople] = useState<Person[]>(() => getPeople());
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [jerryAutoRead, setJerryAutoRead] = useState<boolean>(false);
  const [jerryTriggerKey, setJerryTriggerKey] = useState<number>(0);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState<number>(-1);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);

  // Check URL parameters on mount (?to=slug or ?admin=true or /admin)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const adminParam = url.searchParams.get('admin');
    const toParam = url.searchParams.get('to') || url.searchParams.get('id');

    if (adminParam === 'true' || window.location.pathname === '/admin') {
      setScreen('admin');
      return;
    }

    if (toParam) {
      const match = findPersonByIdOrSlug(toParam, people);
      if (match) {
        setSelectedPerson(match);
        setScreen('message');
        return;
      }
    }
  }, [people]);

  // Escape key exits Cinema Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCinemaMode) {
        setIsCinemaMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCinemaMode]);

  // Audio synthesis toggle
  const handleToggleAudio = () => {
    const active = ambientAudio.toggle();
    setIsAudioPlaying(active);
  };

  // Navigate to colleague message
  const handleSelectPerson = (person: Person) => {
    setSelectedPerson(person);
    setJerryAutoRead(true);
    setJerryTriggerKey((prev) => prev + 1);
    setScreen('message');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('to', person.id);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleTriggerJerryRead = () => {
    setJerryTriggerKey((prev) => prev + 1);
  };

  // Back to dashboard
  const handleBackToDashboard = () => {
    setScreen('directory');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('to');
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Reset selection & return to clean dashboard
  const handleResetToDashboard = () => {
    setSelectedPerson(null);
    setSearchQuery('');
    setScreen('directory');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('to');
      url.searchParams.delete('id');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Prev / Next Colleague navigation
  const currentIndex = useMemo(() => {
    if (!selectedPerson) return -1;
    return people.findIndex((p) => p.id === selectedPerson.id);
  }, [people, selectedPerson]);

  const handlePrevPerson = () => {
    if (people.length === 0) return;
    const nextIdx = currentIndex <= 0 ? people.length - 1 : currentIndex - 1;
    handleSelectPerson(people[nextIdx]);
  };

  const handleNextPerson = () => {
    if (people.length === 0) return;
    const nextIdx = currentIndex >= people.length - 1 ? 0 : currentIndex + 1;
    handleSelectPerson(people[nextIdx]);
  };

  // Switch to Admin
  const handleOpenAdmin = () => {
    setScreen('admin');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('admin', 'true');
      window.history.pushState({}, '', url.toString());
    }
  };

  // Exit Admin
  const handleExitAdmin = () => {
    setScreen('directory');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('admin');
      window.history.pushState({}, '', url.toString());
    }
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-[#020204] text-[#f1f5f9] overflow-hidden select-none">
      {/* Cinematic Ambient Background (Interstellar Gargantua & Endurance Video) */}
      <CinematicBackground
        onAdminClick={handleOpenAdmin}
        cinemaMode={isCinemaMode}
        onToggleCinemaMode={setIsCinemaMode}
      />

      {/* Floating Exit Cinema Mode Banner */}
      {isCinemaMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
        >
          <button
            onClick={() => setIsCinemaMode(false)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-black/80 hover:bg-black/95 text-amber-300 hover:text-white border border-amber-400/40 hover:border-amber-400 text-xs font-mono tracking-widest uppercase transition-all shadow-2xl shadow-black backdrop-blur-xl"
          >
            <span>Exit Cinema Mode</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">ESC</span>
          </button>
        </motion.div>
      )}

      {/* Main Top Header (Hidden in Cinema Mode) */}
      {!isCinemaMode && screen !== 'intro' && screen !== 'transition' && screen !== 'admin' && (
        <header className="h-16 px-4 sm:px-8 lg:px-12 flex items-center justify-between z-30 border-b border-cyan-500/20 bg-[#040816]/90 backdrop-blur-xl shrink-0">
          <div className="flex items-center space-x-3">
            {/* ONE LAST WALK Site Brand Button */}
            <button
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2.5 text-left group focus:outline-none py-1 px-2 rounded-lg hover:bg-white/5 transition-colors"
              title="ONE LAST WALK — Home"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-950/70 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-sm group-hover:border-cyan-300 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-[0.16em] text-xs sm:text-sm font-semibold uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-sky-300 block leading-tight">
                  ONE LAST WALK
                </span>
                <span className="text-[9px] font-mono text-cyan-400/70 tracking-wider hidden sm:block">
                  Mugunthan • 17.09.2026
                </span>
              </div>
            </button>

            {screen === 'message' && (
              <>
                <span className="text-cyan-500/30 hidden sm:inline">/</span>
                <button
                  onClick={handleBackToDashboard}
                  className="inline-flex items-center space-x-1.5 text-xs text-cyan-300 hover:text-white transition-colors py-1.5 px-3 rounded-lg hover:bg-cyan-500/15 border border-cyan-500/30"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden xs:inline">Colleague</span>
                  <span>Dashboard</span>
                </button>
              </>
            )}

            {screen === 'final' && (
              <>
                <span className="text-cyan-500/30 hidden sm:inline">/</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBackToDashboard}
                    className="inline-flex items-center space-x-1.5 text-xs text-cyan-200 hover:text-white transition-colors py-1 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 shadow-sm shadow-black/40"
                  >
                    <Users className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Return to Notes</span>
                  </button>
                  <button
                    onClick={() => setScreen('intro')}
                    className="inline-flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white transition-colors py-1 px-2.5 rounded-lg hover:bg-white/10"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Replay</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2.5 sm:space-x-4 ml-auto">
            {/* Replay Intro button */}
            <button
              onClick={() => setScreen('intro')}
              className="text-[11px] font-mono text-cyan-300/80 hover:text-cyan-200 transition-colors py-1.5 px-2.5 rounded-full border border-cyan-500/25 hover:border-cyan-400/50 bg-cyan-950/25 hidden sm:inline-flex items-center space-x-1"
              title="Replay cinematic intro"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Intro</span>
            </button>

            {/* Ambient Sound Synthesizer Control */}
            <button
              onClick={handleToggleAudio}
              className="flex items-center space-x-1.5 text-xs text-cyan-200/80 hover:text-white transition-colors py-1.5 px-3 rounded-full border border-cyan-500/25 hover:border-cyan-400/50 bg-cyan-950/25"
              title={isAudioPlaying ? 'Mute ambient sound' : 'Turn on ambient sound'}
            >
              {isAudioPlaying ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span className="text-[11px] text-cyan-300 font-mono hidden sm:inline">Audio On</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">Sound</span>
                </>
              )}
            </button>

            <span className="text-xs font-mono text-cyan-200/60 tracking-wider hidden md:inline">
              Sept 2026
            </span>
          </div>
        </header>
      )}

      {/* Main Content Area (Hidden in Cinema Mode) */}
      {!isCinemaMode && (
        <main className="flex-1 flex overflow-hidden z-20 relative">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <IntroScreen
              key="screen-intro"
              onEnter={() => setScreen('directory')}
              onSkip={() => setScreen('directory')}
            />
          )}

          {screen === 'transition' && (
            <TransitionScreen
              key="screen-transition"
              onContinue={() => setScreen('directory')}
            />
          )}

          {screen === 'final' && (
            <FinalScreen
              key="screen-final"
              onReturnToDirectory={handleBackToDashboard}
              onReplayIntro={() => setScreen('intro')}
            />
          )}

          {screen === 'admin' && (
            <div className="h-full w-full overflow-y-auto">
              <AdminScreen
                key="screen-admin"
                people={people}
                onUpdatePeople={setPeople}
                onExitAdmin={handleExitAdmin}
                onPreviewPerson={(p) => {
                  setSelectedPerson(p);
                  setScreen('message');
                }}
              />
            </div>
          )}

          {/* 1. Full-Screen Dashboard Screen */}
          {screen === 'directory' && (
            <motion.div
              key="dashboard-screen-container"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="flex-1 w-full h-full overflow-hidden flex flex-col"
            >
              <DirectoryScreen
                people={people}
                selectedPersonId={selectedPerson?.id}
                onSelectPerson={handleSelectPerson}
                onViewFinalScreen={() => setScreen('final')}
                onViewIntro={() => setScreen('intro')}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onClearSearch={() => setSearchQuery('')}
              />
            </motion.div>
          )}

          {/* 2. Full-Screen Dedicated Colleague Message View with Back & Reset */}
          {screen === 'message' && selectedPerson && (
            <motion.div
              key={`message-screen-${selectedPerson.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="flex-1 w-full h-full overflow-hidden flex flex-col"
            >
              <PersonalMessageScreen
                person={selectedPerson}
                activeParagraphIndex={activeParagraphIndex}
                onTriggerMugunthanRead={handleTriggerJerryRead}
                onBack={handleBackToDashboard}
                onReset={handleResetToDashboard}
                onPrevPerson={handlePrevPerson}
                onNextPerson={handleNextPerson}
                onNextScreen={() => setScreen('final')}
              />
            </motion.div>
          )}
        </AnimatePresence>
        </main>
      )}

      {/* Jerry Cartoon "Mugunthan" Voice Reader in Right Top Corner */}
      {!isCinemaMode && screen !== 'intro' && screen !== 'transition' && screen !== 'admin' && (
        <JerryMugunthan
          person={selectedPerson}
          autoRead={jerryAutoRead}
          triggerReadKey={jerryTriggerKey}
          onParagraphChange={setActiveParagraphIndex}
        />
      )}
    </div>
  );
}
