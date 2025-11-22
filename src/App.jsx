import { Canvas } from '@react-three/fiber'
import { Ship } from './Ship'
import './App.css'

function App() {
  return (
    <div id="canvas-container">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Ship />
      </Canvas>

      <div className="ui-layer game-start">
        <div className="header">
          <h1>STARDRIFT</h1>
          <p className="blink">PRESS WASD TO FLY</p>
        </div>
      </div>
    </div>
  )
}

export default App
