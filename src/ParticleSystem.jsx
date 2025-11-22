import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Object3D, MathUtils, Vector3 } from 'three'

const PARTICLE_COUNT = 500
let particleIndex = 0

// We'll export this to call it from anywhere (simple global event bus style)
export const triggerExplosion = (position) => {
    // This will be assigned by the component
}

export function ParticleSystem() {
    const meshRef = useRef()
    const dummy = useMemo(() => new Object3D(), [])

    // Particle state: position, velocity, life
    const particles = useMemo(() => {
        return new Array(PARTICLE_COUNT).fill(0).map(() => ({
            position: new Vector3(0, 0, 0),
            velocity: new Vector3(0, 0, 0),
            life: 0, // 0 = dead, 1 = full life
            scale: 0
        }))
    }, [])

    useEffect(() => {
        // Assign the global trigger function
        triggerExplosion = (pos) => {
            // Spawn 20 particles per explosion
            for (let i = 0; i < 20; i++) {
                const p = particles[particleIndex]
                p.life = 1.0
                p.position.copy(pos)
                p.scale = Math.random() * 0.5 + 0.2

                // Random explosion velocity
                p.velocity.set(
                    MathUtils.randFloatSpread(0.5),
                    MathUtils.randFloatSpread(0.5),
                    MathUtils.randFloatSpread(0.5)
                )

                particleIndex = (particleIndex + 1) % PARTICLE_COUNT
            }
        }
    }, [particles])

    useFrame(() => {
        if (!meshRef.current) return

        particles.forEach((p, i) => {
            if (p.life > 0) {
                // Move
                p.position.add(p.velocity)

                // Drag/Friction
                p.velocity.multiplyScalar(0.95)

                // Fade life
                p.life -= 0.02

                // Update dummy object for InstancedMesh
                dummy.position.copy(p.position)
                dummy.scale.setScalar(p.scale * p.life) // Shrink as they die
                dummy.updateMatrix()

                meshRef.current.setMatrixAt(i, dummy.matrix)
            } else {
                // Hide dead particles
                dummy.scale.setScalar(0)
                dummy.updateMatrix()
                meshRef.current.setMatrixAt(i, dummy.matrix)
            }
        })

        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
            <boxGeometry args={[0.2, 0.2, 0.2]} />
            <meshBasicMaterial color="#ff00ff" toneMapped={false} />
        </instancedMesh>
    )
}
