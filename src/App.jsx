import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Ship } from './Ship'
import './App.css'

function App() {
  const [gameStarted, setGameStarted] = useState(false)

  return (
    <div id="canvas-container" onClick={() => !gameStarted && setGameStarted(true)}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Ship />
      </Canvas>

      <div className={`ui-layer ${gameStarted ? 'game-active' : 'game-start'}`}>
        <div className="header">
          <h1>STARDRIFT</h1>
          {!gameStarted && <p className="blink">CLICK TO START</p>}
        </div>
      </div>
    </div>
  )
}

export default App
