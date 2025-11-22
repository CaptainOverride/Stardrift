import { create } from 'zustand'
import { Vector3 } from 'three'

export const useStore = create((set) => ({
    score: 0,
    gameStarted: false,
    shipPosition: new Vector3(0, 0, 0),
    explosionData: null, // { position: Vector3, id: number }
    increaseScore: () => set((state) => ({ score: state.score + 1 })),
    startGame: () => set({ gameStarted: true }),
    setShipPosition: (pos) => set({ shipPosition: pos }),
    triggerExplosion: (position) => set({ explosionData: { position, id: Math.random() } }),
}))
