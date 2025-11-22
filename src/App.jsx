import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import './App.css'

function App() {
  return (
    <div id="canvas-container">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
        
        <OrbitControls />
      </Canvas>
      
      <div className="ui-layer">
        <h1>STARDRIFT</h1>
        <p>System Initialized</p>
      </div>
    </div>
  )
}

export default App
