import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import { Volume2, VolumeX } from 'lucide-react';
import { SITE_CONFIG } from '../config';

const SESSION_PREF_KEY = 'bfl_music_pref';

export interface MusicControllerHandle {
  playSyncFromGesture: () => void;
}

export const MusicController = forwardRef<MusicControllerHandle>(
  function MusicController(_props, ref) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [needsUnlockPill, setNeedsUnlockPill] = useState(false);

    // Start music
    const attemptSyncPlay = () => {
      const audio = audioRef.current;

      if (!audio) return;

      if (sessionStorage.getItem(SESSION_PREF_KEY) === 'off') {
        setIsPlaying(false);
        setNeedsUnlockPill(false);
        return;
      }

      audio.volume = 0.65;

      audio.play()
        .then(() => {
          setIsPlaying(true);
          setNeedsUnlockPill(false);
          sessionStorage.setItem(SESSION_PREF_KEY, 'on');
        })
        .catch((error) => {
          console.warn('Music playback blocked:', error);
          setIsPlaying(false);
          setNeedsUnlockPill(true);
        });
    };

    // Expose function to parent component
    useImperativeHandle(ref, () => ({
      playSyncFromGesture: attemptSyncPlay,
    }));

    // Retry music after user interaction
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

        audio.play()
          .then(() => {
            setIsPlaying(true);
            setNeedsUnlockPill(false);
            sessionStorage.setItem(SESSION_PREF_KEY, 'on');
          })
          .catch((error) => {
            console.warn('Music retry failed:', error);
          });
      };

      document.addEventListener('pointerdown', handleNextTap, {
        capture: true,
        once: true,
      });

      return () => {
        document.removeEventListener(
          'pointerdown',
          handleNextTap,
          true
        );
      };
    }, [needsUnlockPill]);

    // Music ON/OFF
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

        audio.play()
          .then(() => {
            setIsPlaying(true);
            setNeedsUnlockPill(false);
          })
          .catch((error) => {
            console.warn('Music playback failed:', error);
            setIsPlaying(false);
            setNeedsUnlockPill(true);
          });
      }
    };

    return (
      <>
        {/* Background Music */}
        <audio
          ref={audioRef}
          src={SITE_CONFIG.music.src}
          loop
          preload="auto"
          playsInline
        />

        {/* Music Enable Prompt */}
        {needsUnlockPill && (
          <button
            type="button"
            onClick={attemptSyncPlay}
            className="fixed bottom-20 left-4 z-[65] rounded-full bg-[#FAF5EB] text-[#1F1316] px-4 py-2 text-xs font-label font-medium tracking-[0.12em] uppercase shadow-[0_8px_24px_rgba(0,0,0,0.45)] border border-[#C59B4E]/60 active:scale-95 transition-transform"
          >
            {SITE_CONFIG.music.enablePrompt}
          </button>
        )}

        {/* Floating Music ON/OFF Button */}
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
          {isPlaying ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      </>
    );
  }
);

MusicController.displayName = 'MusicController';
