import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Ship } from './Ship'
import { Background } from './Background'
import { useStore } from './store'
import './App.css'

function App() {
  const { gameStarted, startGame } = useStore((state) => ({
    gameStarted: state.gameStarted,
    startGame: state.startGame
  }))

  return (
    <div id="canvas-container" onClick={() => !gameStarted && startGame()}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <color attach="background" args={['#050505']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />

        {/* <Background /> */}
        <Ship />

        {/* <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        </EffectComposer> */}
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
