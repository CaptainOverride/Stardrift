import { useRef, useMemo, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GameContext } from './App'

export function SpaceDust({ count = 1000 }) {
    const mesh = useRef()
    const { shipPosition } = useContext(GameContext)

    // Generate random initial positions
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 100
            const y = (Math.random() - 0.5) * 100
            const z = (Math.random() - 0.5) * 100
            temp.push({ x, y, z })
        }
        return temp
    }, [count])

    const dummy = useMemo(() => new THREE.Object3D(), [])

    useFrame((state) => {
        if (!mesh.current) return

        // Get ship velocity (approximate from camera movement or context if available, 
        // but here we'll just use the fact that we want dust to exist around the ship)

        // We want the dust to stay within a box around the ship
        // If a particle is too far, wrap it around

        const shipPos = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z)

        particles.forEach((particle, i) => {
            // Calculate relative position to ship
            let x = particle.x - shipPos.x
            let y = particle.y - shipPos.y
            let z = particle.z - shipPos.z

            // Wrap around logic (infinite dust)
            // Box size 60x60x60
            const size = 60
            const half = size / 2

            // Modulo-like wrapping to keep particles inside the box centered on ship
            x = ((x + half) % size + size) % size - half
            y = ((y + half) % size + size) % size - half
            z = ((z + half) % size + size) % size - half

            // Actual world position
            dummy.position.set(
                shipPos.x + x,
                shipPos.y + y,
                shipPos.z + z
            )

            // Scale based on distance/speed? 
            // For now just small specks
            dummy.scale.set(1, 1, 1)

            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)
        })

        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <boxGeometry args={[0.05, 0.05, 0.05]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </instancedMesh>
    )
}
