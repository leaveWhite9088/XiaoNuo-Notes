import { create } from 'zustand';

interface PlayerState {
  currentBvid: string | null;
  currentAid: number | null;
  currentCid: number | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  setVideo: (bvid: string, aid: number, cid: number) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  currentBvid: null,
  currentAid: null,
  currentCid: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  setVideo: (bvid, aid, cid) => set({ currentBvid: bvid, currentAid: aid, currentCid: cid }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),
}));
