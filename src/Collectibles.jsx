import { useRef, useMemo, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, MathUtils, Object3D } from 'three'
import { GameContext } from './App'
import { audio } from './SoundManager'
import { Line } from '@react-three/drei'

export function Collectibles({ count = 30 }) {
    const instancedMeshRef = useRef()
    const { shipPosition, increaseScore, triggerExplosion, setNearestOrbDistance } = useContext(GameContext)
    const nearestOrbRef = useRef(null)

    // Generate random initial positions
    const orbs = useRef(new Array(count).fill(0).map(() => ({
        position: new Vector3(
            MathUtils.randFloatSpread(200),
            MathUtils.randFloatSpread(200),
            MathUtils.randFloatSpread(60)
        ),
        scale: 1,
        active: true
    })))

    const dummy = useMemo(() => new Object3D(), [])

    useFrame((state) => {
        if (!instancedMeshRef.current) return

        const time = state.clock.getElapsedTime()
        let minDistance = Infinity
        let nearestOrbPos = null
        const shipPos = new Vector3(shipPosition.x, shipPosition.y, shipPosition.z)

        orbs.current.forEach((orb, i) => {
            // Animate: Bob up and down
            const yOffset = Math.sin(time * 2 + i) * 0.5

            dummy.position.copy(orb.position)
            dummy.position.z += yOffset

            // Rotate
            dummy.rotation.x = time
            dummy.rotation.y = time * 0.5

            dummy.scale.setScalar(orb.scale)
            dummy.updateMatrix()
            instancedMeshRef.current.setMatrixAt(i, dummy.matrix)

            // Collision & Distance Logic
            const distance = dummy.position.distanceTo(shipPos)

            if (distance < 2.5) {
                // Collected!
                increaseScore()
                if (audio && audio.playCollectSound) audio.playCollectSound()
                triggerExplosion(dummy.position.clone())

                // Respawn far away
                orb.position.x = shipPos.x + MathUtils.randFloatSpread(100) + (Math.random() > 0.5 ? 40 : -40)
                orb.position.y = shipPos.y + MathUtils.randFloatSpread(100) + (Math.random() > 0.5 ? 40 : -40)
                orb.position.z = shipPos.z + MathUtils.randFloatSpread(60)
            }

            if (distance < minDistance) {
                minDistance = distance
                nearestOrbPos = dummy.position.clone()
            }
        })

        instancedMeshRef.current.instanceMatrix.needsUpdate = true

        // Update Context for HUD
        if (setNearestOrbDistance) {
            setNearestOrbDistance(minDistance)
        }

        nearestOrbRef.current = nearestOrbPos
    })

    return (
        <>
            <instancedMesh ref={instancedMeshRef} args={[null, null, count]}>
                <sphereGeometry args={[0.8, 16, 16]} />
                <meshStandardMaterial
                    color="#ffd700"
                    emissive="#ffaa00"
                    emissiveIntensity={1.5}
                    toneMapped={false}
                    roughness={0.1}
                    metalness={1}
                />
            </instancedMesh>

            {/* Guide Line to nearest orb */}
            {nearestOrbRef.current && (
                <Line
                    points={[
                        [shipPosition.x, shipPosition.y, shipPosition.z],
                        [nearestOrbRef.current.x, nearestOrbRef.current.y, nearestOrbRef.current.z]
                    ]}
                    color="#ffd700"
                    lineWidth={2}
                    dashed
                    dashScale={1}
                    dashSize={2}
                    gapSize={1}
                    opacity={0.4}
                    transparent
                />
            )}
        </>
    )
}
