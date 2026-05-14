import { create } from 'zustand';
import { GameState, BlockCategory } from '@game/shared';

export enum ToolMode {
  Build = 'build',
  Remove = 'remove',
  Weapon = 'weapon',
}

interface GameStore {
  gameState: GameState;
  localPlayerId: string | null;
  toolMode: ToolMode;
  selectedBlockType: string;
  keys: Record<string, boolean>;

  setGameState: (state: GameState) => void;
  setLocalPlayerId: (id: string | null) => void;
  setToolMode: (mode: ToolMode) => void;
  setSelectedBlockType: (type: string) => void;
  setKey: (key: string, pressed: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  gameState: {
    players: {},
    blocks: {},
    vehicles: {},
  },
  localPlayerId: null,
  toolMode: ToolMode.Weapon,
  selectedBlockType: 'cube_1x1x1',
  keys: {},

  setGameState: (state) => set({ gameState: state }),
  setLocalPlayerId: (id) => set({ localPlayerId: id }),
  setToolMode: (mode) => set({ toolMode: mode }),
  setSelectedBlockType: (type) => set({ selectedBlockType: type }),
  setKey: (key, pressed) => set((state) => ({ keys: { ...state.keys, [key]: pressed } })),
}));
