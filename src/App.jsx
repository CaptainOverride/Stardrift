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
    <div id="canvas-container">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        <Background />
        <Ship />
      </Canvas>
    </div>
  )
}

export default App
