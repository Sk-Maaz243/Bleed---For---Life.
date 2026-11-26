import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { SITE_CONFIG } from '../config';

const SESSION_PREF_KEY = 'bfl_music_pref';

export interface MusicControllerHandle {
  playSyncFromGesture: () => void;
}

export const MusicController = forwardRef<MusicControllerHandle>(function MusicController(
  _props,
  ref
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsUnlockPill, setNeedsUnlockPill] = useState(false);

  const attemptSyncPlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const savedPref = sessionStorage.getItem(SESSION_PREF_KEY);
    if (savedPref === 'off') {
      setIsPlaying(false);
      setNeedsUnlockPill(false);
      return;
    }

    audio.volume = 0.65;
    // Call audio.play() directly inside the user click/touch handler with zero async delay
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setNeedsUnlockPill(false);
          sessionStorage.setItem(SESSION_PREF_KEY, 'on');
        })
        .catch(() => {
          setIsPlaying(false);
          setNeedsUnlockPill(true);
        });
    } else {
      setIsPlaying(true);
      setNeedsUnlockPill(false);
      sessionStorage.setItem(SESSION_PREF_KEY, 'on');
    }
  };

  useImperativeHandle(ref, () => ({
    playSyncFromGesture: () => {
      attemptSyncPlay();
    },
  }));

  // If initial play() failed, the next tap anywhere starts the music
  useEffect(() => {
    if (!needsUnlockPill) return;

    const handleNextTap = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (sessionStorage.getItem(SESSION_PREF_KEY) === 'off') {
        setNeedsUnlockPill(false);
        return;
      }

      audio.volume = 0.65;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setNeedsUnlockPill(false);
            sessionStorage.setItem(SESSION_PREF_KEY, 'on');
          })
          .catch(() => {
            // Keep pill visible if still blocked
          });
      }
    };

    document.addEventListener('pointerdown', handleNextTap, { capture: true });
    document.addEventListener('click', handleNextTap, { capture: true });

    return () => {
      document.removeEventListener('pointerdown', handleNextTap, { capture: true });
      document.removeEventListener('click', handleNextTap, { capture: true });
    };
  }, [needsUnlockPill]);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      setNeedsUnlockPill(false);
      sessionStorage.setItem(SESSION_PREF_KEY, 'off');
    } else {
      sessionStorage.setItem(SESSION_PREF_KEY, 'on');
      audio.volume = 0.65;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setNeedsUnlockPill(false);
          })
          .catch(() => {
            setIsPlaying(false);
            setNeedsUnlockPill(true);
          });
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src={SITE_CONFIG.music.src} loop preload="auto" playsInline />

      {/* Fallback ivory pill if autoplay on initial gesture was blocked */}
      {needsUnlockPill && (
        <button
          type="button"
          onClick={attemptSyncPlay}
          className="fixed bottom-20 left-4 z-[65] rounded-full bg-[#FAF5EB] text-[#1F1316] px-4 py-2 text-xs font-label font-medium tracking-[0.12em] uppercase shadow-[0_8px_24px_rgba(0,0,0,0.45)] border border-[#C59B4E]/60 active:scale-95 transition-transform"
        >
          {SITE_CONFIG.music.enablePrompt}
        </button>
      )}

      {/* Always-visible floating round ON/OFF music button at bottom-left */}
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? 'Turn music off' : 'Turn music on'}
        aria-pressed={isPlaying}
        className={`fixed bottom-5 left-4 z-[65] w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 shadow-[0_8px_26px_rgba(0,0,0,0.5)] border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C59B4E] ${
          isPlaying
            ? 'bg-gradient-to-b from-[#A61229] to-[#6E0717] text-[#FAF5EB] border-[#C59B4E]/65'
            : 'bg-[#1C050A]/90 text-[#FAF5EB]/80 border-[#C59B4E]/40 backdrop-blur-md'
        }`}
      >
        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>
    </>
  );
});
