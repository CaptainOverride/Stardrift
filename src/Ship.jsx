import { useRef, useContext, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'
import { GameContext } from './App'
if (mainEngineRef.current) {
    // Scale engines based on thrust
    const targetScale = isThrusting ? 1.5 : 0.5
    const currentScale = mainEngineRef.current.scale.x
    const newScale = MathUtils.lerp(currentScale, targetScale, 0.2)

    mainEngineRef.current.scale.setScalar(newScale)
    leftEngineRef.current.scale.setScalar(newScale)
    rightEngineRef.current.scale.setScalar(newScale)

    // Flicker effect
    if (isThrusting) {
        mainEngineRef.current.material.opacity = 0.8 + Math.random() * 0.2
    } else {
        mainEngineRef.current.material.opacity = 0.2
    }
}

// 5. Trail Update
if (gameStarted && velocity.current.length() > 0.05) {
    trailPoints.current.unshift(shipRef.current.position.clone())
    if (trailPoints.current.length > 30) { // Longer trail
        trailPoints.current.pop()
    }
}

// 6. Camera Chase
const angle = shipRef.current.rotation.z
const dist = 10 // Further back
const height = 4 // Higher up

// Smooth camera follow
const idealCx = shipRef.current.position.x - (-Math.sin(angle) * dist)
const idealCy = shipRef.current.position.y - (Math.cos(angle) * dist)
const idealCz = shipRef.current.position.z + height

state.camera.position.x += (idealCx - state.camera.position.x) * 0.05 // Smoother lag
state.camera.position.y += (idealCy - state.camera.position.y) * 0.05
state.camera.position.z += (idealCz - state.camera.position.z) * 0.05

state.camera.lookAt(shipRef.current.position)

// 7. Context Sync
setShipPosition({
    x: shipRef.current.position.x,
    y: shipRef.current.position.y,
    z: shipRef.current.position.z
})
setShipVelocity({
    x: velocity.current.x,
    y: velocity.current.y,
    z: velocity.current.z
})
    })

return (
    <group ref={shipRef}>
        {/* Player Name Tag */}
        {gameStarted && (
            <Html position={[0, 0, 2]} center>
                <div style={{
                    color: '#00ffff',
                    fontFamily: 'Orbitron',
                    fontSize: '12px',
                    textShadow: '0 0 5px #00ffff',
                    pointerEvents: 'none',
                    opacity: 0.8
                }}>
                    {playerName}
                </div>
            </Html>
        )}

        {/* Velocity trail */}
        {trailPoints.current.length > 1 && (
            <Line
                points={trailPoints.current}
                color="#00ffff"
                lineWidth={4}
                transparent
                opacity={0.4}
            />
        )}

        {/* Main Futuristic Ship Body - Wrapped for banking/pitching */}
        <group ref={bodyRef}>
            {/* Central Hull */}
            <mesh position={[0, 0.3, 0]}>
                <boxGeometry args={[0.6, 1.8, 0.3]} />
                <meshStandardMaterial
                    color="#1a1a2e"
                    metalness={0.9}
                    roughness={0.2}
                    emissive="#0a0a1a"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Cockpit */}
            <mesh position={[0, 1.1, 0.05]}>
                <boxGeometry args={[0.5, 0.6, 0.25]} />
                <meshStandardMaterial
                    color="#00ffff"
                    metalness={0.8}
                    roughness={0.1}
                    emissive="#00ffff"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.9}
                />
            </mesh>

            {/* Nose Cone */}
            <mesh position={[0, 1.6, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[0.25, 0.5, 4]} />
                <meshStandardMaterial
                    color="#ffffff"
                    emissive="#ffffff"
                    emissiveIntensity={1}
                    toneMapped={false}
                />
            </mesh>

            {/* Wings - Left */}
            <group position={[-0.5, 0, 0]}>
                <mesh rotation={[0, 0, -0.3]}>
                    <boxGeometry args={[0.8, 1.2, 0.1]} />
                    <meshStandardMaterial
                        color="#16213e"
                        metalness={0.9}
                        roughness={0.3}
                        emissive="#00ffff"
                        emissiveIntensity={0.2}
                    />
                </mesh>
                {/* Wing tip light */}
                <mesh position={[-0.4, 0, 0.1]}>
                    <sphereGeometry args={[0.1]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
            </group>

            {/* Wings - Right */}
            <group position={[0.5, 0, 0]}>
                <mesh rotation={[0, 0, 0.3]}>
                    <boxGeometry args={[0.8, 1.2, 0.1]} />
                    <meshStandardMaterial
                        color="#16213e"
                        metalness={0.9}
                        roughness={0.3}
                        emissive="#00ffff"
                        emissiveIntensity={0.2}
                    />
                </mesh>
                {/* Wing tip light */}
                <mesh position={[0.4, 0, 0.1]}>
                    <sphereGeometry args={[0.1]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
            </group>

            {/* Engine Nacelles - Left */}
            <mesh position={[-0.35, -0.5, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 1.2, 6]} />
                <meshStandardMaterial color="#0f3460" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Engine Nacelles - Right */}
            <mesh position={[0.35, -0.5, 0]}>
                <cylinderGeometry args={[0.15, 0.15, 1.2, 6]} />
                <meshStandardMaterial color="#0f3460" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* THRUSTER FLAMES */}
            {/* Left Engine Flame */}
            <mesh ref={leftEngineRef} position={[-0.35, -1.2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.1, 0.8, 8]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
            </mesh>

            {/* Right Engine Flame */}
            <mesh ref={rightEngineRef} position={[0.35, -1.2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.1, 0.8, 8]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.8} />
            </mesh>

            {/* Central Engine Flame */}
            <mesh ref={mainEngineRef} position={[0, -1.0, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[0.15, 1.0, 8]} />
                <meshBasicMaterial color="#ff00ff" transparent opacity={0.8} />
            </mesh>

            {/* Accent Lines */}
            <mesh position={[-0.15, 0.5, 0.16]}>
                <boxGeometry args={[0.05, 1.5, 0.05]} />
                <meshBasicMaterial color="#00ffff" />
            </mesh>
            <mesh position={[0.15, 0.5, 0.16]}>
                <boxGeometry args={[0.05, 1.5, 0.05]} />
                <meshBasicMaterial color="#00ffff" />
            </mesh>
        </group>
    </group>
)
}
