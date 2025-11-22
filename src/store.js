import { create } from 'zustand'

export const useStore = create((set) => ({
    score: 0,
    gameStarted: false,
    shipPosition: { x: 0, y: 0, z: 0 }, // Plain object instead of Vector3
    explosionData: null, // { position: {x, y, z}, id: number }
    increaseScore: () => set((state) => ({ score: state.score + 1 })),
    startGame: () => set({ gameStarted: true }),
    setShipPosition: (pos) => set({ shipPosition: { x: pos.x, y: pos.y, z: pos.z } }),
    triggerExplosion: (position) => set({
        explosionData: {
            position: { x: position.x, y: position.y, z: position.z },
            id: Math.random()
        }
    }),
}))
