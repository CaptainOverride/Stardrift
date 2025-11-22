import { useRef, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { GameContext } from './App'
import { Line } from '@react-three/drei'

export function Ship() {
    const shipRef = useRef()
    const bodyRef = useRef()
    const speed = 0.15
    const friction = 0.95
    const rotationSpeed = 0.04
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
        d: false,
        ' ': false,
        Shift: false
    })

    // Event listeners for controls
    if (typeof window !== 'undefined') {
        window.onkeydown = (e) => (keys.current[e.key] = true)
        window.onkeyup = (e) => (keys.current[e.key] = false)
    }

    useFrame((state) => {
        if (!shipRef.current) return

        let isTurning = 0 // -1 left, 1 right

        // 1. Rotation Controls - A/D rotate the ship
        if (gameStarted) {
            if (keys.current.ArrowLeft || keys.current.a) {
                shipRef.current.rotation.z += rotationSpeed
                isTurning = 1 // Left turn (positive rotation)
            }
            if (keys.current.ArrowRight || keys.current.d) {
                shipRef.current.rotation.z -= rotationSpeed
                isTurning = -1 // Right turn (negative rotation)
            }
        }

        // 2. Thrust Controls - W/S thrust forward/backward
        if (gameStarted) {
            const angle = shipRef.current.rotation.z
            const thrustPower = speed * 0.1

            // Horizontal Thrust
            if (keys.current.ArrowUp || keys.current.w) {
                velocity.current.x += Math.sin(-angle) * thrustPower
                velocity.current.y += Math.cos(angle) * thrustPower
            }
            if (keys.current.ArrowDown || keys.current.s) {
                velocity.current.x -= Math.sin(-angle) * thrustPower
                velocity.current.y -= Math.cos(angle) * thrustPower
            }

            // Vertical Thrust
            if (keys.current[' ']) {
                velocity.current.z += thrustPower // Up
            }
            if (keys.current.Shift) {
                velocity.current.z -= thrustPower // Down
            }
        }

        // 3. Apply Physics
        velocity.current.multiplyScalar(friction)
        shipRef.current.position.add(velocity.current)

        // 4. Visual Banking (Roll)
        if (bodyRef.current) {
            // Target roll angle based on turning
            const targetRoll = isTurning * 0.5 // 0.5 radians bank
            // Smoothly interpolate current roll to target
            bodyRef.current.rotation.y += (targetRoll - bodyRef.current.rotation.y) * 0.1
        }

        // 5. Update trail
        if (gameStarted && velocity.current.length() > 0.01) {
            trailPoints.current.unshift(shipRef.current.position.clone())
            if (trailPoints.current.length > 20) {
                trailPoints.current.pop()
            }
        }

        // 6. Third-Person Chase Camera
        const angle = shipRef.current.rotation.z
        const dist = 8
        const height = 3

        // Calculate ideal camera position (behind and above)
        const idealCx = shipRef.current.position.x - (-Math.sin(angle) * dist)
        const idealCy = shipRef.current.position.y - (Math.cos(angle) * dist)
        const idealCz = shipRef.current.position.z + height

        state.camera.position.x += (idealCx - state.camera.position.x) * 0.1
        state.camera.position.y += (idealCy - state.camera.position.y) * 0.1
        state.camera.position.z += (idealCz - state.camera.position.z) * 0.1

        state.camera.up.set(0, 0, 1) // Keep Z as up
        state.camera.lookAt(shipRef.current.position)

        // 7. Update position in context
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

            {/* Main Futuristic Ship Body - Wrapped for banking */}
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
