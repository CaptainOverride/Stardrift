import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { Trail } from '@react-three/drei'

export function Ship() {
    const shipRef = useRef()
    const speed = 0.1
    const friction = 0.95 // "Drift" factor (lower = slippery, higher = sharp)
    const velocity = useRef(new Vector3(0, 0, 0))

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
    window.onkeydown = (e) => (keys.current[e.key] = true)
    window.onkeyup = (e) => (keys.current[e.key] = false)

    useFrame(() => {
        if (!shipRef.current) return

        // 1. Calculate Thrust
        if (keys.current.ArrowUp || keys.current.w) velocity.current.y += speed * 0.1
        if (keys.current.ArrowDown || keys.current.s) velocity.current.y -= speed * 0.1
        if (keys.current.ArrowLeft || keys.current.a) velocity.current.x -= speed * 0.1
        if (keys.current.ArrowRight || keys.current.d) velocity.current.x += speed * 0.1
        // 2. Apply Physics (Velocity + Friction)
        velocity.current.multiplyScalar(friction)
        shipRef.current.position.add(velocity.current)

        // 3. Tilt/Bank effect based on velocity
        shipRef.current.rotation.z = -velocity.current.x * 2 // Bank left/right
        shipRef.current.rotation.x = velocity.current.y * 2  // Pitch up/down

        // 4. Camera Follow
        // We access the camera via the state object in useFrame, but we need to grab it from the context or pass it in.
        // Actually, useFrame provides state as the first argument.
    }, 1) // Priority 1 to ensure it runs after other updates if needed

    useFrame((state) => {
        if (!shipRef.current) return

        // Camera Follow Logic
        // Smoothly interpolate camera position to target
        state.camera.position.x += (shipRef.current.position.x * 0.5 - state.camera.position.x) * 0.1
        state.camera.position.y += (shipRef.current.position.y * 0.5 - state.camera.position.y) * 0.1
        state.camera.lookAt(shipRef.current.position.x, shipRef.current.position.y, 0)
    })

    return (
        <group ref={shipRef}>
            {/* Main Body */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.5, 2, 4]} />
                <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={0.5} roughness={0.1} />
            </mesh>

            {/* Engine Glow & Trail */}
            <mesh position={[0, -1, 0]}>
                <sphereGeometry args={[0.3]} />
                <meshBasicMaterial color="#ff00ff" />
            </mesh>

            <Trail
                width={1} // Width of the line
                length={8} // Length of the trail
                color={new Vector3(10, 0, 10)} // RGB values for color (High values = Bloom)
                attenuation={(t) => t * t} // Tapering function
            >
                <mesh position={[0, -1, 0]}>
                    <sphereGeometry args={[0.1]} />
                    <meshBasicMaterial color="hotpink" />
                </mesh>
            </Trail>
        </group>
    )
}
