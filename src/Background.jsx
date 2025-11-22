import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'

export function Background() {
    const starsRef = useRef()

    useFrame((state) => {
        if (!starsRef.current) return
        // Move stars with camera to create infinite illusion
        // We only copy X and Y so depth (Z) still feels real
        starsRef.current.position.x = state.camera.position.x
        starsRef.current.position.y = state.camera.position.y
    })

    return (
        <group ref={starsRef}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    )
}
