import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, RotateCcw, X, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Person } from '../types.ts';
import { playJerryCartoonSound } from '../utils/audio.ts';

interface JerryMugunthanProps {
  person: Person | null;
  autoRead?: boolean;
  triggerReadKey?: number;
  onParagraphChange?: (paragraphIndex: number) => void;
}

export const JerryMugunthan: React.FC<JerryMugunthanProps> = ({
  person,
  autoRead = false,
  triggerReadKey = 0,
  onParagraphChange,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentTextIndex, setCurrentTextIndex] = useState<number>(-1);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [mouthOpen, setMouthOpen] = useState<boolean>(false);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const mouthIntervalRef = useRef<number | null>(null);
  const prevPersonIdRef = useRef<string | null>(null);

  // Stop any active speech
  const stopReading = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    setCurrentTextIndex(-1);
    setCurrentSentence('');
    setMouthOpen(false);
    if (mouthIntervalRef.current) {
      clearInterval(mouthIntervalRef.current);
      mouthIntervalRef.current = null;
    }
    if (onParagraphChange) onParagraphChange(-1);
  }, [onParagraphChange]);

  // Mouth flapping animation when speaking
  useEffect(() => {
    if (isSpeaking && !isPaused) {
      mouthIntervalRef.current = window.setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 160);
    } else {
      setMouthOpen(false);
      if (mouthIntervalRef.current) {
        clearInterval(mouthIntervalRef.current);
        mouthIntervalRef.current = null;
      }
    }
    return () => {
      if (mouthIntervalRef.current) {
        clearInterval(mouthIntervalRef.current);
      }
    };
  }, [isSpeaking, isPaused]);

  // Read the selected person's note
  const startReading = useCallback(() => {
    if (!person || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    playJerryCartoonSound('pop');
    setHasUserInteracted(true);

    const personName = person ? (person.shortName || person.name) : 'friend';
    const paragraphs = person?.message || [
      'Welcome to my farewell archive! Click any colleague card below to read and hear their personalized farewell message.'
    ];
    const fullText = paragraphs.join(' \n\n ');

    const introGreeting = person
      ? `Hey ${personName}! Mugunthan here to read your farewell note. `
      : `Hey there! Mugunthan here in Jerry cartoon mode! Pick any colleague to hear their note. `;
    const speechScript = `${introGreeting} ${fullText}`;

    const utterance = new SpeechSynthesisUtterance(speechScript);
    utteranceRef.current = utterance;

    // Pick the sweetest, clearest child/youth/female English voice for an adorable baby voice
    const voices = window.speechSynthesis.getVoices();
    const sweetBabyVoice =
      voices.find((v) =>
        v.lang.startsWith('en') && (
          v.name.includes('Junior') ||
          v.name.includes('Eddy') ||
          v.name.includes('Flo') ||
          v.name.includes('Samantha') ||
          v.name.includes('Victoria') ||
          v.name.includes('Zira') ||
          v.name.includes('Jenny') ||
          v.name.includes('Aria') ||
          v.name.includes('Google US English') ||
          v.name.includes('Natural')
        )
      ) ||
      voices.find((v) => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.includes('Woman'))) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (sweetBabyVoice) {
      utterance.voice = sweetBabyVoice;
    }

    // Sweet, cute baby voice settings:
    // High pitch (1.52) transforms the voice into an adorable, innocent cartoon baby tone
    utterance.pitch = 1.52;
    // Clear and bouncy pacing
    utterance.rate = 0.96;
    // Loud and clear volume
    utterance.volume = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
      setCurrentSentence(person ? `Reading for ${person.name}...` : 'Welcome to Mugunthan’s farewell notes...');
    };

    utterance.onboundary = (event) => {
      if (event.name === 'sentence' || event.name === 'word') {
        const spokenSoFar = speechScript.substring(0, event.charIndex + (event.charLength || 10));
        // Find which paragraph matches roughly
        let matchedIndex = 0;
        for (let i = 0; i < paragraphs.length; i++) {
          if (spokenSoFar.includes(paragraphs[i].substring(0, 20))) {
            matchedIndex = i;
          }
        }
        setCurrentTextIndex(matchedIndex);
        if (onParagraphChange) onParagraphChange(matchedIndex);

        // Preview snippet
        const snippet = speechScript.substring(event.charIndex, event.charIndex + 45);
        if (snippet.trim()) {
          setCurrentSentence(snippet + '...');
        }
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setCurrentTextIndex(-1);
      setCurrentSentence('Thanks for listening! Keep in touch always!');
      playJerryCartoonSound('chime');
      if (onParagraphChange) onParagraphChange(-1);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setMouthOpen(false);
    };

    // Ensure synthesis queue is running smoothly
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.speak(utterance);
  }, [person, onParagraphChange]);

  const togglePlayPause = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (!isSpeaking) {
      startReading();
    } else if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      playJerryCartoonSound('pop');
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setMouthOpen(false);
    }
  };

  // When selected person changes, pop in Jerry and optionally start reading
  useEffect(() => {
    if (!person) return;

    if (prevPersonIdRef.current !== person.id) {
      prevPersonIdRef.current = person.id;
      stopReading();
      setIsOpen(true);
      setIsMinimized(false);
      setCurrentSentence(`Hey ${person.name}! Click Play to hear my note.`);
      playJerryCartoonSound('pop');

      // If user has already interacted before or autoRead is flagged, attempt read
      if (autoRead || hasUserInteracted) {
        const timer = setTimeout(() => {
          startReading();
        }, 450);
        return () => clearTimeout(timer);
      }
    }
  }, [person, autoRead, hasUserInteracted, startReading, stopReading]);

  // Handle explicit read triggers from page buttons
  useEffect(() => {
    if (triggerReadKey > 0) {
      setIsOpen(true);
      setIsMinimized(false);
      startReading();
    }
  }, [triggerReadKey, startReading]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopReading();
    };
  }, [stopReading]);

  if (!isOpen) {
    return (
      <div className="fixed top-18 sm:top-20 right-3 sm:right-6 z-50 pointer-events-auto">
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
            playJerryCartoonSound('pop');
          }}
          className="flex items-center space-x-2 px-3.5 py-1.5 bg-[#050b1a]/95 hover:bg-cyan-500/20 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 rounded-full shadow-2xl shadow-black/90 text-xs font-mono backdrop-blur-xl transition-all group"
          title="Open Mugunthan (Jerry Cartoon)"
        >
          <span className="text-base group-hover:rotate-12 transition-transform">🐭</span>
          <span className="font-bold text-xs">Jerry</span>
        </motion.button>
      </div>
    );
  }

  return (
    <div className="fixed top-18 sm:top-20 right-3 sm:right-6 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="pointer-events-auto bg-[#050b1a]/95 backdrop-blur-xl border border-cyan-500/35 rounded-2xl p-4 shadow-2xl shadow-black/90 max-w-[330px] sm:max-w-[370px] w-full mb-3 text-slate-100"
          >
            {/* Jerry speech bubble header */}
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider font-mono">
                  Jerry Cartoon &bull; Mugunthan
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-colors"
                  title="Minimize Mugunthan"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    stopReading();
                    setIsOpen(false);
                  }}
                  className="p-1 hover:bg-white/10 text-slate-400 hover:text-cyan-400 rounded-lg transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Jerry character row & live speech */}
            <div className="flex items-center gap-3.5">
              {/* Animated Jerry Character SVG */}
              <div
                onClick={togglePlayPause}
                className="relative cursor-pointer shrink-0 group select-none"
                title={isSpeaking ? 'Click Mugunthan to pause' : 'Click Mugunthan to read aloud!'}
              >
                <motion.div
                  animate={
                    isSpeaking && !isPaused
                      ? {
                          y: [0, -4, 0],
                          rotate: [-1.5, 1.5, -1.5],
                          transition: { repeat: Infinity, duration: 0.45 },
                        }
                      : {
                          y: [0, -2, 0],
                          transition: { repeat: Infinity, duration: 2.2 },
                        }
                  }
                  className="relative w-24 h-32 sm:w-28 sm:h-36 rounded-2xl overflow-hidden border border-cyan-400/40 shadow-xl shadow-cyan-950/40 bg-gradient-to-b from-[#6A87AE] via-[#7B6DA8] to-[#927EB8] flex items-center justify-center group"
                >
                  <svg
                    viewBox="0 0 200 240"
                    className="w-full h-full select-none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      {/* Fur Gradients */}
                      <linearGradient id="jerryFur" x1="20%" y1="0%" x2="80%" y2="100%">
                        <stop offset="0%" stopColor="#DE9555" />
                        <stop offset="40%" stopColor="#C87A36" />
                        <stop offset="80%" stopColor="#A8591C" />
                        <stop offset="100%" stopColor="#7E3D0E" />
                      </linearGradient>

                      {/* Ear Pink */}
                      <linearGradient id="jerryEarPink" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FFA6B4" />
                        <stop offset="100%" stopColor="#F07C8E" />
                      </linearGradient>

                      {/* Cream Cheeks & Tummy */}
                      <linearGradient id="jerryCream" x1="30%" y1="0%" x2="70%" y2="100%">
                        <stop offset="0%" stopColor="#FFF4E2" />
                        <stop offset="60%" stopColor="#F9E2C4" />
                        <stop offset="100%" stopColor="#ECCAA4" />
                      </linearGradient>

                      {/* Red Bow Tie Gradient */}
                      <linearGradient id="bowTieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D82A26" />
                        <stop offset="50%" stopColor="#B31B18" />
                        <stop offset="100%" stopColor="#7F0E0B" />
                      </linearGradient>

                      {/* Wood Baseboard Gradient */}
                      <linearGradient id="woodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#D9A86E" />
                        <stop offset="50%" stopColor="#BD8B51" />
                        <stop offset="100%" stopColor="#9C6B32" />
                      </linearGradient>
                    </defs>

                    {/* ============ ROOM BACKGROUND ============ */}
                    {/* Blue Upper Wall */}
                    <rect x="0" y="0" width="200" height="78" fill="#6582A6" />
                    {/* Wall highlight / soft ambient lighting */}
                    <rect x="0" y="0" width="200" height="35" fill="#7593B8" opacity="0.4" />

                    {/* Table / Furniture legs in background */}
                    <rect x="96" y="0" width="10" height="100" rx="4" fill="#7D572F" />
                    <rect x="97" y="0" width="3" height="100" fill="#9E7244" opacity="0.6" />
                    <rect x="136" y="0" width="10" height="100" rx="4" fill="#6E4A25" />
                    <rect x="137" y="0" width="3" height="100" fill="#8F6335" opacity="0.5" />

                    {/* Warm Wood Baseboard trim */}
                    <rect x="0" y="70" width="200" height="24" fill="url(#woodGrad)" />
                    <line x1="0" y1="70" x2="200" y2="70" stroke="#E6C49E" strokeWidth="1.2" />
                    <line x1="0" y1="94" x2="200" y2="94" stroke="#5E3F1A" strokeWidth="1.5" />

                    {/* Purple / Lavender Carpet Floor */}
                    <rect x="0" y="94" width="200" height="146" fill="#8E7BB5" />
                    {/* Subtle carpet texture lines */}
                    <rect x="0" y="94" width="200" height="146" fill="#7E68A6" opacity="0.25" />

                    {/* Soft contact shadow under Jerry */}
                    <ellipse cx="106" cy="208" rx="38" ry="8" fill="#584577" opacity="0.6" />

                    {/* ============ JERRY MOUSE ============ */}
                    {/* Tail curving behind */}
                    <path
                      d="M 92 178 C 76 184 56 182 46 172 C 40 166 45 160 50 164 C 60 172 74 174 88 170"
                      stroke="#8C4E22"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Left Mouse Ear (Large rounded) */}
                    <g id="leftEar">
                      <circle
                        cx="50"
                        cy="82"
                        r="25"
                        fill="url(#jerryFur)"
                        stroke="#3A1C06"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="50"
                        cy="82"
                        r="18"
                        fill="url(#jerryEarPink)"
                        stroke="#3A1C06"
                        strokeWidth="1.2"
                      />
                    </g>

                    {/* Right Mouse Ear (Angled right) */}
                    <g id="rightEar">
                      <circle
                        cx="128"
                        cy="60"
                        r="26"
                        fill="url(#jerryFur)"
                        stroke="#3A1C06"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="127"
                        cy="60"
                        r="18"
                        fill="url(#jerryEarPink)"
                        stroke="#3A1C06"
                        strokeWidth="1.2"
                      />
                    </g>

                    {/* Torso & Little Mouse Body */}
                    <path
                      d="M 82 142 C 78 162 76 185 86 198 C 96 206 124 204 130 188 C 136 172 135 152 130 140 C 122 136 94 136 82 142 Z"
                      fill="url(#jerryFur)"
                      stroke="#3A1C06"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />

                    {/* Cream Belly */}
                    <path
                      d="M 94 145 C 88 162 88 184 96 195 C 104 202 120 198 124 186 C 128 172 126 156 120 145 C 112 142 100 142 94 145 Z"
                      fill="url(#jerryCream)"
                      stroke="#3A1C06"
                      strokeWidth="1.5"
                    />

                    {/* Feet Standing on Floor */}
                    {/* Left Foot */}
                    <path
                      d="M 85 198 C 80 198 76 204 80 208 C 84 212 98 210 102 206 C 103 203 98 198 94 198 Z"
                      fill="url(#jerryFur)"
                      stroke="#3A1C06"
                      strokeWidth="2"
                    />
                    {/* Left Toes */}
                    <line x1="86" y1="204" x2="86" y2="209" stroke="#3A1C06" strokeWidth="1.2" />
                    <line x1="91" y1="204" x2="91" y2="209" stroke="#3A1C06" strokeWidth="1.2" />

                    {/* Right Foot */}
                    <path
                      d="M 106 196 C 102 196 102 202 106 206 C 112 210 124 208 126 204 C 127 200 122 196 116 196 Z"
                      fill="url(#jerryFur)"
                      stroke="#3A1C06"
                      strokeWidth="2"
                    />
                    {/* Right Toes */}
                    <line x1="114" y1="202" x2="114" y2="207" stroke="#3A1C06" strokeWidth="1.2" />
                    <line x1="119" y1="201" x2="119" y2="206" stroke="#3A1C06" strokeWidth="1.2" />

                    {/* Arms in Confident "Hands on Hips" Pose */}
                    {/* Left Arm & Paw */}
                    <path
                      d="M 85 138 C 74 145 74 162 82 170 C 85 173 90 170 88 165 C 82 160 82 148 88 142"
                      fill="url(#jerryFur)"
                      stroke="#3A1C06"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    {/* Left Paw resting on hip */}
                    <ellipse cx="88" cy="166" rx="4.5" ry="3.5" fill="url(#jerryFur)" stroke="#3A1C06" strokeWidth="1.5" />

                    {/* Right Arm & Paw (Elbow poking out) */}
                    <path
                      d="M 124 136 C 136 142 140 156 132 166 C 129 170 125 166 126 162 C 132 155 130 144 122 139"
                      fill="url(#jerryFur)"
                      stroke="#3A1C06"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    />
                    {/* Right Paw resting on hip */}
                    <ellipse cx="126" cy="163" rx="4.5" ry="3.5" fill="url(#jerryFur)" stroke="#3A1C06" strokeWidth="1.5" />

                    {/* ============ JERRY HEAD & FACE ============ */}
                    {/* Head Base */}
                    <path
                      d="M 72 108 C 66 84 84 62 106 66 C 126 70 138 90 134 112 C 130 132 108 142 90 138 C 76 134 74 120 72 108 Z"
                      fill="url(#jerryFur)"
                      stroke="#3A1C06"
                      strokeWidth="2.5"
                    />

                    {/* Head Tuft / Hair strands */}
                    <path
                      d="M 98 67 C 94 56 102 54 104 64 C 108 55 116 57 112 68"
                      stroke="#3A1C06"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Cream Muzzle / Cheeks */}
                    <path
                      d="M 80 114 C 74 104 80 96 92 98 C 98 94 110 94 116 100 C 122 108 120 120 110 124 C 98 128 88 124 80 114 Z"
                      fill="url(#jerryCream)"
                      stroke="#3A1C06"
                      strokeWidth="1.8"
                    />

                    {/* EYES - Looking Upward to the Right Dreamily */}
                    {/* Left Eye */}
                    <g>
                      <ellipse
                        cx="94"
                        cy="90"
                        rx="6.5"
                        ry="11"
                        transform="rotate(-5 94 90)"
                        fill="#FFFFFF"
                        stroke="#3A1C06"
                        strokeWidth="1.8"
                      />
                      {/* Pupil looking up-right */}
                      <ellipse
                        cx="96"
                        cy="86"
                        rx="4"
                        ry="6"
                        transform="rotate(2 96 86)"
                        fill="#1C0D04"
                      />
                      {/* Catchlight */}
                      <circle cx="95" cy="84" r="1.6" fill="#FFFFFF" />
                    </g>

                    {/* Right Eye */}
                    <g>
                      <ellipse
                        cx="114"
                        cy="86"
                        rx="6.5"
                        ry="11"
                        transform="rotate(10 114 86)"
                        fill="#FFFFFF"
                        stroke="#3A1C06"
                        strokeWidth="1.8"
                      />
                      {/* Pupil looking up-right */}
                      <ellipse
                        cx="116"
                        cy="82"
                        rx="4"
                        ry="6"
                        transform="rotate(12 116 82)"
                        fill="#1C0D04"
                      />
                      {/* Catchlight */}
                      <circle cx="115" cy="80" r="1.6" fill="#FFFFFF" />
                    </g>

                    {/* Classic Cartoon Eyebrows */}
                    <path
                      d="M 88 77 C 92 72 98 74 100 78"
                      stroke="#3A1C06"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 112 73 C 116 68 122 70 124 74"
                      stroke="#3A1C06"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />

                    {/* Black Button Nose */}
                    <ellipse cx="109" cy="101" rx="4.2" ry="3.2" fill="#1C0D04" />
                    <circle cx="108" cy="100" r="1" fill="#FFFFFF" opacity="0.8" />

                    {/* Whiskers */}
                    <path
                      d="M 88 106 L 72 104 M 87 110 L 70 112 M 88 114 L 73 118"
                      stroke="#3A1C06"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 118 103 L 134 101 M 119 107 L 136 108 M 118 111 L 133 115"
                      stroke="#3A1C06"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />

                    {/* Mouth (Smiling or Speaking) */}
                    {mouthOpen ? (
                      <g>
                        <path
                          d="M 96 112 C 96 122 110 122 110 112 Z"
                          fill="#661414"
                          stroke="#3A1C06"
                          strokeWidth="1.6"
                        />
                        <rect x="100" y="112" width="6" height="3" rx="1" fill="#FFFFFF" />
                        <ellipse cx="103" cy="119" rx="4" ry="2" fill="#E86565" />
                      </g>
                    ) : (
                      /* Sweet proud smile */
                      <path
                        d="M 94 112 C 100 120 110 118 114 112"
                        stroke="#3A1C06"
                        strokeWidth="2"
                        strokeLinecap="round"
                        fill="none"
                      />
                    )}

                    {/* ============ RED BOW TIE ============ */}
                    <g id="redBowTie">
                      {/* Left Bow Wing */}
                      <path
                        d="M 103 130 C 90 122 84 132 87 142 C 92 145 100 138 103 134 Z"
                        fill="url(#bowTieGrad)"
                        stroke="#4A0B09"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      {/* Left Bow inner crease */}
                      <path d="M 96 132 C 92 136 94 140 98 138" stroke="#FF7B78" strokeWidth="1" fill="none" opacity="0.7" />

                      {/* Right Bow Wing */}
                      <path
                        d="M 107 130 C 120 122 126 132 123 142 C 118 145 110 138 107 134 Z"
                        fill="url(#bowTieGrad)"
                        stroke="#4A0B09"
                        strokeWidth="1.8"
                        strokeLinejoin="round"
                      />
                      {/* Right Bow inner crease */}
                      <path d="M 114 132 C 118 136 116 140 112 138" stroke="#FF7B78" strokeWidth="1" fill="none" opacity="0.7" />

                      {/* Central Bow Knot */}
                      <ellipse
                        cx="105"
                        cy="132"
                        rx="5"
                        ry="6"
                        fill="#B31B18"
                        stroke="#4A0B09"
                        strokeWidth="1.8"
                      />
                      <circle cx="104" cy="130" r="1.5" fill="#FFA3A1" opacity="0.8" />
                    </g>
                  </svg>

                  {/* Sound Wave Ripple Effect when Speaking */}
                  {isSpeaking && !isPaused && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full border-2 border-cyan-400 pointer-events-none"
                    />
                  )}
                </motion.div>

                {/* Name Label Below Jerry */}
                <div className="text-center mt-1">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold tracking-wider font-mono border border-cyan-400/30">
                    Mugunthan
                  </span>
                </div>
              </div>

              {/* Speech & Live Dialogue Bubble */}
              <div className="flex-1 min-w-0">
                <div className="relative bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200">
                  {/* Bubble Tail */}
                  <div className="absolute top-4 -left-1.5 w-3 h-3 bg-[#050b1a] border-l border-b border-white/10 rotate-45" />

                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-medium">
                      {isSpeaking ? (isPaused ? 'Paused' : 'Reading aloud…') : 'Ready to read'}
                    </span>
                    {isSpeaking && (
                      <div className="flex items-center space-x-0.5">
                        <span className="w-1 h-2.5 bg-cyan-400 animate-pulse rounded-full" />
                        <span className="w-1 h-4 bg-cyan-400 animate-pulse delay-75 rounded-full" />
                        <span className="w-1 h-3 bg-cyan-400 animate-pulse delay-150 rounded-full" />
                      </div>
                    )}
                  </div>

                  <p className="line-clamp-3 text-slate-200 font-sans leading-relaxed italic text-[11px] sm:text-xs">
                    &ldquo;{currentSentence || (person ? 'Click Read Aloud to hear Mugunthan read your note!' : 'Welcome! Click Read Aloud or pick a colleague below!')}&rdquo;
                  </p>
                </div>

                {/* Interactive Controls */}
                <div className="flex items-center justify-between mt-3 pt-1">
                  <button
                    onClick={togglePlayPause}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20"
                  >
                    {isSpeaking && !isPaused ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isPaused ? 'Resume' : 'Read Aloud'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={startReading}
                    className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs flex items-center space-x-1"
                    title="Read from beginning"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Replay</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized / Floating Quick Access Button in Top Right Corner */}
      {isMinimized && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsMinimized(false);
            playJerryCartoonSound('pop');
          }}
          className="pointer-events-auto flex items-center space-x-2.5 px-3.5 py-2 bg-gradient-to-r from-cyan-400 to-sky-400 text-slate-950 rounded-full shadow-xl shadow-black/80 border border-cyan-300 font-bold text-xs group"
          title="Open Mugunthan (Jerry Cartoon)"
        >
          {/* Mini Jerry Avatar with Red Bow Tie */}
          <div className="w-6 h-6 rounded-full bg-[#8E7BB5] border border-cyan-300 flex items-center justify-center text-[10px] shadow-inner overflow-hidden relative">
            <span className="text-[12px] leading-none select-none">🐭</span>
            <span className="absolute -bottom-0.5 -right-0.5 text-[9px] leading-none select-none">🎀</span>
          </div>
          <span className="font-bold">Mugunthan (Jerry)</span>
          {isSpeaking && (
            <span className="flex space-x-0.5 items-center">
              <span className="w-1 h-2 bg-slate-950 animate-pulse rounded-full" />
              <span className="w-1 h-3 bg-slate-950 animate-pulse delay-75 rounded-full" />
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-slate-950 group-hover:translate-y-0.5 transition-transform" />
        </motion.button>
      )}
    </div>
  );
};
