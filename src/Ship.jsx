import { useRef, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { GameContext } from './App'
import { Line } from '@react-three/drei'

export function Ship() {
    const shipRef = useRef()
    const trailRef = useRef()
    const speed = 0.15
    const friction = 0.92
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

        // 1. Calculate Thrust - Simple 2D top-down controls
        if (gameStarted) {
            // Up/Down on screen = Y axis
            if (keys.current.ArrowUp || keys.current.w) velocity.current.y += speed * 0.1
            if (keys.current.ArrowDown || keys.current.s) velocity.current.y -= speed * 0.1

            // Left/Right on screen = X axis
            if (keys.current.ArrowLeft || keys.current.a) velocity.current.x -= speed * 0.1
            if (keys.current.ArrowRight || keys.current.d) velocity.current.x += speed * 0.1
        }

        // 2. Apply Physics
        velocity.current.multiplyScalar(friction)
        shipRef.current.position.add(velocity.current)

        // 3. Rotate ship to face movement direction (like asteroids/top-down shooters)
        if (velocity.current.length() > 0.01) {
            const angle = Math.atan2(velocity.current.x, velocity.current.y)
            shipRef.current.rotation.z = -angle
        }

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
                    lineWidth={3}
                    transparent
                    opacity={0.6}
                />
            )}

            {/* Main Futuristic Ship Body */}
            <group>
                {/* Central Hull - Sleek elongated body */}
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

                {/* Cockpit - Front section */}
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

                {/* Nose Cone - Sharp front */}
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
                    <meshStandardMaterial
                        color="#0f3460"
                        metalness={0.8}
                        roughness={0.3}
                    />
                </mesh>

                {/* Engine Nacelles - Right */}
                <mesh position={[0.35, -0.5, 0]}>
                    <cylinderGeometry args={[0.15, 0.15, 1.2, 6]} />
                    <meshStandardMaterial
                        color="#0f3460"
                        metalness={0.8}
                        roughness={0.3}
                    />
                </mesh>

                {/* Engine Glow - Left */}
                <mesh position={[-0.35, -1.1, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial
                        color="#ff00ff"
                        toneMapped={false}
                    />
                </mesh>

                {/* Engine Glow - Right */}
                <mesh position={[0.35, -1.1, 0]}>
                    <sphereGeometry args={[0.2, 16, 16]} />
                    <meshBasicMaterial
                        color="#ff00ff"
                        toneMapped={false}
                    />
                </mesh>

                {/* Central Engine Glow */}
                <mesh position={[0, -0.9, 0]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshBasicMaterial
                        color="#ff00ff"
                        toneMapped={false}
                    />
                </mesh>

                {/* Accent Lines - Left side */}
                <mesh position={[-0.15, 0.5, 0.16]}>
                    <boxGeometry args={[0.05, 1.5, 0.05]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>

                {/* Accent Lines - Right side */}
                <mesh position={[0.15, 0.5, 0.16]}>
                    <boxGeometry args={[0.05, 1.5, 0.05]} />
                    <meshBasicMaterial color="#00ffff" />
                </mesh>
            </group>
        </group>
    )
}
