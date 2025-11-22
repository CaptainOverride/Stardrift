import { useRef, useContext, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'
import { GameContext } from './App'
import { Line, Html } from '@react-three/drei'

export function Ship() {
    const shipRef = useRef()
    const bodyRef = useRef()

    // Physics Constants - "Driftier" feel
    const speed = 0.08 // Lower thrust force
    const friction = 0.98 // Higher friction (less drag) = more drift
    const rotationSpeed = 0.04

    const velocity = useRef(new Vector3(0, 0, 0))
    const trailPoints = useRef([])

    // Thruster Refs for visual effects
    const mainEngineRef = useRef()
    const leftEngineRef = useRef()
    const rightEngineRef = useRef()

    const { gameStarted, setShipPosition, setShipVelocity, playerName } = useContext(GameContext)

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

    if (typeof window !== 'undefined') {
        window.onkeydown = (e) => (keys.current[e.key] = true)
        window.onkeyup = (e) => (keys.current[e.key] = false)
    }

    useFrame((state) => {
        if (!shipRef.current) return

        let isTurning = 0 // -1 left, 1 right
        let isThrusting = false
        let isReversing = false
        let isAscending = false
        let isDescending = false

        // 1. Input Handling
        if (gameStarted) {
            // Rotation
            if (keys.current.ArrowLeft || keys.current.a) {
                shipRef.current.rotation.z += rotationSpeed
                isTurning = 1
            }
            if (keys.current.ArrowRight || keys.current.d) {
                shipRef.current.rotation.z -= rotationSpeed
                isTurning = -1
            }

            const angle = shipRef.current.rotation.z

            // Forward/Back Thrust
            if (keys.current.ArrowUp || keys.current.w) {
                velocity.current.x += Math.sin(-angle) * speed
                velocity.current.y += Math.cos(angle) * speed
                isThrusting = true
            }
            if (keys.current.ArrowDown || keys.current.s) {
                velocity.current.x -= Math.sin(-angle) * (speed * 0.5)
                velocity.current.y -= Math.cos(angle) * (speed * 0.5)
                isReversing = true
            }

            // Vertical Thrust
            if (keys.current[' ']) {
                velocity.current.z += speed
                isAscending = true
            }
            if (keys.current.Shift) {
                velocity.current.z -= speed
                isDescending = true
            }
        }

        // 2. Physics Update
        velocity.current.multiplyScalar(friction)
        shipRef.current.position.add(velocity.current)

        // 3. Visual Tilt & Banking (Plane-like physics visuals)
        if (bodyRef.current) {
            // Roll (Banking) on turns
            const targetRoll = isTurning * 0.8 // Stronger bank
            bodyRef.current.rotation.y = MathUtils.lerp(bodyRef.current.rotation.y, targetRoll, 0.1)

            // Pitch (Nose Up/Down)
            // Pitch Up when Ascending (Space) OR when pulling back (S - optional, but Space is better)
            // Pitch Down when Descending (Shift)
            let targetPitch = 0
            if (isAscending) targetPitch = 0.5 // Nose up
            if (isDescending) targetPitch = -0.5 // Nose down

            // Also add a bit of pitch based on forward acceleration (nose up when accelerating?)
            // Actually, usually nose goes UP when accelerating in space games? No, let's stick to vertical inputs.

            bodyRef.current.rotation.x = MathUtils.lerp(bodyRef.current.rotation.x, targetPitch, 0.1)
        }

        // 4. Thruster Visuals
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
