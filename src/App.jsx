import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Ship } from './Ship'
import { Background } from './Background'
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

        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        </EffectComposer>
      </Canvas>

      <div className="ui-layer">
        <h1>STARDRIFT</h1>
        <p>System Initialized</p>
      </div>
    </div>
  )
}

export default App
