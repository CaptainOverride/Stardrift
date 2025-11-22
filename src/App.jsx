import { useState, useEffect, createContext, useContext } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Ship } from './Ship'
import { Background } from './Background'
import { GridFloor } from './GridFloor'
import { SpaceDust } from './SpaceDust'
import { Collectibles } from './Collectibles'
import { ParticleSystem } from './ParticleSystem'
import './App.css'

// Create a context for game state
export const GameContext = createContext()

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [playerName, setPlayerName] = useState('Pilot')
  const [shipPosition, setShipPosition] = useState({ x: 0, y: 0, z: 0 })
  const [shipVelocity, setShipVelocity] = useState({ x: 0, y: 0, z: 0 })
  const [explosionData, setExplosionData] = useState(null)
  const [nearestOrbDistance, setNearestOrbDistance] = useState(null)

  const gameState = {
    gameStarted,
    score,
    playerName,
    shipPosition,
    shipVelocity,
    explosionData,
    startGame: () => setGameStarted(true),
    increaseScore: () => setScore(s => s + 100),
    setShipPosition,
    setShipVelocity,
    setNearestOrbDistance,
    triggerExplosion: (position) => setExplosionData({ position, id: Math.random() })
  }

  // Keyboard listener for game start is removed in favor of UI button

  return (
    <GameContext.Provider value={gameState}>
      <div className="game-container">
        <Canvas shadows camera={{ position: [0, -10, 10], fov: 60 }}>
          <color attach="background" args={['#050505']} />
          <fog attach="fog" args={['#050505', 10, 50]} />

          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

          <Background />
          <SpaceDust />
          <Ship />
          {gameStarted && <Collectibles />}
          {gameStarted && <ParticleSystem />}

          <EffectComposer>
            <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
          </EffectComposer>
        </Canvas>

        {/* HUD - Only visible when game started */}
        {gameStarted && (
          <div className="hud-container">
            <div className="score-board">
              <div className="score-label">SCORE</div>
              <div className="score-value">{score.toLocaleString()}</div>
            </div>

            <div className="pilot-info">
              <div className="pilot-label">PILOT</div>
              <div className="pilot-name">{playerName}</div>
            </div>

            {nearestOrbDistance !== null && (
              <div className="distance-indicator">
                <div className="distance-label">TARGET</div>
                <div className="distance-value">{nearestOrbDistance.toFixed(0)}m</div>
                <div className="distance-bar">
                  <div
                    className="distance-fill"
                    style={{ width: `${Math.max(0, Math.min(100, (1000 / (nearestOrbDistance + 1)) * 100))}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Start Screen Overlay */}
        {!gameStarted && (
          <div className="start-screen">
            <div className="glass-panel">
              <h1 className="game-title">STARDRIFT</h1>
              <div className="input-group">
                <label>ENTER PILOT NAME</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  maxLength={12}
                  placeholder="PILOT NAME"
                />
              </div>

              <div className="controls-grid">
                <div className="control-item">
                  <div className="key-icon">W</div>
                  <span>THRUST</span>
                </div>
                <div className="control-item">
                  <div className="key-icon">S</div>
                  <span>REVERSE</span>
                </div>
                <div className="control-item">
                  <div className="key-icon">A</div>
                  <div className="key-icon">D</div>
                  <span>TURN</span>
                </div>
                <div className="control-item">
                  <div className="key-icon wide">SPACE</div>
                  <span>ASCEND</span>
                </div>
                <div className="control-item">
                  <div className="key-icon wide">SHIFT</div>
                  <span>DESCEND</span>
                </div>
              </div>

              <button className="start-btn" onClick={() => setGameStarted(true)}>
                INITIATE LAUNCH
              </button>
            </div>
          </div>
        )}
      </div>
    </GameContext.Provider>
  )
}

export default App
