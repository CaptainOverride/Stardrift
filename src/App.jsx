import { useState, useEffect, createContext, useContext } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Ship } from './Ship'
import { Background } from './Background'
import { Collectibles } from './Collectibles'
import { ParticleSystem } from './ParticleSystem'
import './App.css'

// Create a context for game state
export const GameContext = createContext()

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [shipPosition, setShipPosition] = useState({ x: 0, y: 0, z: 0 })
  const [explosionData, setExplosionData] = useState(null)

  const gameState = {
    gameStarted,
    score,
    shipPosition,
    explosionData,
    startGame: () => setGameStarted(true),
    increaseScore: () => setScore(s => s + 1),
    setShipPosition,
    triggerExplosion: (position) => setExplosionData({ position, id: Math.random() })
  }

  // Start game on any movement key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameStarted && ['w', 'a', 's', 'd', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        setGameStarted(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <GameContext.Provider value={gameState}>
      <div id="canvas-container">
        <Canvas camera={{ position: [0, 0, 5] }}>
          <color attach="background" args={['#050505']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          <Background />
          <Ship />
          {gameStarted && <Collectibles />}
          {gameStarted && <ParticleSystem />}

          <EffectComposer>
            <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
          </EffectComposer>
        </Canvas>

        <div className={`ui-layer ${gameStarted ? 'game-active' : 'game-start'}`}>
          <div className="header">
            <h1>STARDRIFT</h1>
            {!gameStarted && <p className="blink">PRESS WASD TO START</p>}
          </div>

          {gameStarted && <div className="score-board">SCORE: {score}</div>}
        </div>
      </div>
    </GameContext.Provider>
  )
}

export default App
