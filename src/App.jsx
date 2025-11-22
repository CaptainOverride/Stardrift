import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Ship } from './Ship'
import { Background } from './Background'
import { Collectibles } from './Collectibles'
import { ParticleSystem } from './ParticleSystem'
import { useStore } from './store'
import './App.css'

function App() {
  return (
    <div id="canvas-container" style={{ width: '100vw', height: '100vh', background: 'red' }}>
      <Canvas>
        <ambientLight />
        <mesh>
          <boxGeometry />
          <meshBasicMaterial color="blue" />
        </mesh>
      </Canvas>
    </div>
  )
}

export default App
