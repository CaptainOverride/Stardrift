import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'
import { useStore } from './store'
import { audio } from './SoundManager'
import { triggerExplosion } from './ParticleSystem'

export function Collectibles({ count = 20 }) {
    const { shipPosition, increaseScore } = useStore()

    // Generate random initial positions
    const orbs = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new Vector3(
                MathUtils.randFloatSpread(100),
                MathUtils.randFloatSpread(100),
                0
            ),
            ref: null // We'll attach refs dynamically if needed, or just use the position array
        }))
    }, [count])

    // We need refs to animate orbs individually
    const orbRefs = useRef([])

    useFrame((state) => {
        orbRefs.current.forEach((mesh, i) => {
            if (!mesh) return

            // 1. Animation: Bob up and down
            mesh.position.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.01

            // 2. Collision Detection
            if (shipPosition.distanceTo(mesh.position) < 2) {
                // Collected!
                increaseScore()
                audio.playCollectSound()
                triggerExplosion(mesh.position)

                // Respawn far away
                mesh.position.x = shipPosition.x + MathUtils.randFloatSpread(50) + (Math.random() > 0.5 ? 20 : -20)
                mesh.position.y = shipPosition.y + MathUtils.randFloatSpread(50) + (Math.random() > 0.5 ? 20 : -20)
            }
        })
    })

    return (
        <>
            {orbs.map((orb, i) => (
                <mesh
                    key={i}
                    position={orb.position}
                    ref={(el) => (orbRefs.current[i] = el)}
                >
                    <sphereGeometry args={[0.5, 16, 16]} />
                    <meshStandardMaterial
                        color="#ffaa00"
                        emissive="#ffaa00"
                        emissiveIntensity={2}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </>
    )
}
