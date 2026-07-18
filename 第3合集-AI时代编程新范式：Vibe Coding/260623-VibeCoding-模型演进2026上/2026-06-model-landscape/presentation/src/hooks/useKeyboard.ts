import { useEffect } from "react";
import type { PlaybackMode } from "./useAudioPlayer";
import type { StepperState } from "./useStepper";

interface Options {
  stepper: StepperState;
  mode: PlaybackMode;
  autoStarted: boolean;
  cycleMode(): void;
  setAutoStarted(v: boolean): void;
  chapters: { narrations: unknown[] }[];
}

/**
 * Single keyboard handler for the entire presentation.
 *
 * Consolidates navigation (arrows, Home/End, 1-9), mode cycling (M),
 * and auto-start gating (Space) so there's no ambiguity about which
 * handler wins a key press.
 *
 * Space behavior by mode:
 *   manual / audio → advance step
 *   auto (gated)   → start auto playback (does NOT advance)
 *   auto (started) → no-op (audio player drives advancement)
 */
export function useKeyboard({
  stepper,
  mode,
  autoStarted,
  cycleMode,
  setAutoStarted,
  chapters,
}: Options) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          if (mode === "auto" && !autoStarted) {
            setAutoStarted(true);
          } else if (mode !== "auto") {
            stepper.next();
          }
          break;
        case "ArrowRight":
          e.preventDefault();
          stepper.next();
          break;
        case "ArrowLeft":
        case "Backspace":
          e.preventDefault();
          stepper.prev();
          break;
        case "m":
        case "M":
          e.preventDefault();
          cycleMode();
          break;
        case "Home":
          stepper.jumpToChapter(0, 0);
          break;
        case "End": {
          const last = chapters.length - 1;
          stepper.jumpToChapter(last, chapters[last]!.narrations.length - 1);
          break;
        }
        default:
          if (e.key >= "1" && e.key <= "9") {
            const n = Number(e.key) - 1;
            if (n < chapters.length) stepper.jumpToChapter(n, 0);
          }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepper, mode, autoStarted, cycleMode, setAutoStarted, chapters]);
}
