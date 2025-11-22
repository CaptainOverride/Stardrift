import { useRef, useContext, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { GameContext } from './App'
import { Line } from '@react-three/drei'

export function Ship() {
    const shipRef = useRef()
    const trailRef = useRef()
    const speed = 0.1
    const friction = 0.95
    const velocity = useRef(new Vector3(0, 0, 0))
    const trailPoints = useRef([])

    const { gameStarted, setShipPosition } = useContext(GameContext)

    // Track keys
    const keys = useRef({
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        w: false,
        a: false,
        s: false,
        d: false
    })

    // Event listeners for controls
    if (typeof window !== 'undefined') {
        window.onkeydown = (e) => (keys.current[e.key] = true)
        window.onkeyup = (e) => (keys.current[e.key] = false)
    }

    useFrame((state) => {
        if (!shipRef.current) return

        // 1. Calculate Thrust (only if game started)
        if (gameStarted) {
            if (keys.current.ArrowUp || keys.current.w) velocity.current.y += speed * 0.1
            if (keys.current.ArrowDown || keys.current.s) velocity.current.y -= speed * 0.1
            if (keys.current.ArrowLeft || keys.current.a) velocity.current.x -= speed * 0.1
            if (keys.current.ArrowRight || keys.current.d) velocity.current.x += speed * 0.1
        }

        // 2. Apply Physics
        velocity.current.multiplyScalar(friction)
        shipRef.current.position.add(velocity.current)

        // 3. Tilt/Bank effect
        shipRef.current.rotation.z = -velocity.current.x * 2
        shipRef.current.rotation.x = velocity.current.y * 2

        // 4. Update trail
        if (gameStarted && velocity.current.length() > 0.01) {
            trailPoints.current.unshift(shipRef.current.position.clone())
            if (trailPoints.current.length > 20) {
                trailPoints.current.pop()
            }
        }

        // 5. Camera Follow (smooth)
        state.camera.position.x += (shipRef.current.position.x * 0.5 - state.camera.position.x) * 0.1
        state.camera.position.y += (shipRef.current.position.y * 0.5 - state.camera.position.y) * 0.1
        state.camera.lookAt(shipRef.current.position.x, shipRef.current.position.y, 0)

        // 6. Update position in context
        setShipPosition({
            x: shipRef.current.position.x,
            y: shipRef.current.position.y,
            z: shipRef.current.position.z
        })
    })

    return (
        <group ref={shipRef}>
            {/* Velocity trail */}
            {trailPoints.current.length > 1 && (
                <Line
                    points={trailPoints.current}
                    color="#00ffff"
                    lineWidth={2}
                    transparent
                    opacity={0.5}
                />
            )}

            {/* Main Body - Cone pointing UP to show direction */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.5, 2, 4]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} roughness={0.1} />
            </mesh>

            {/* Directional Indicator - Bright tip to show "front" */}
            <mesh position={[0, 1.2, 0]}>
                <sphereGeometry args={[0.25]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Direction arrow for clarity */}
            <mesh position={[0, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
                <coneGeometry args={[0.15, 0.4, 3]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Engine Glow at back */}
            <mesh position={[0, -1, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshBasicMaterial color="#ff00ff" />
            </mesh>

            {/* Wing indicators for orientation */}
            <mesh position={[-0.4, 0, 0]}>
                <boxGeometry args={[0.3, 0.1, 0.1]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0.4, 0, 0]}>
                <boxGeometry args={[0.3, 0.1, 0.1]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.3} />
            </mesh>
        </group>
    )
}
