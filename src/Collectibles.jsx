import { useRef, useMemo, useContext } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, MathUtils } from 'three'
import { GameContext } from './App'
import { audio } from './SoundManager'
import { Line, Text } from '@react-three/drei'

export function Collectibles({ count = 20 }) {
    const { shipPosition, increaseScore, triggerExplosion } = useContext(GameContext)

    // Generate random initial positions
    const orbs = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new Vector3(
                MathUtils.randFloatSpread(100),
                MathUtils.randFloatSpread(100),
                MathUtils.randFloatSpread(40) // Random height between -20 and 20
            )
        }))
    }, [count])

    // We need refs to animate orbs individually
    const orbRefs = useRef([])
    const nearestOrbRef = useRef(null)
    const distanceLineRef = useRef(null)

    useFrame((state) => {
        let nearestDist = Infinity
        let nearestOrb = null

        orbRefs.current.forEach((group, i) => {
            if (!group) return

            // 1. Animation: Bob up and down
            group.position.y += Math.sin(state.clock.elapsedTime * 2 + i) * 0.01

            // 2. Find nearest orb
            const shipPos = new Vector3(shipPosition.x, shipPosition.y, shipPosition.z)
            const dist = shipPos.distanceTo(group.position)

            if (dist < nearestDist) {
                nearestDist = dist
                nearestOrb = group
            }

            // 3. Collision Detection
            if (dist < 2) {
                // Collected!
                increaseScore()
                audio.playCollectSound()
                triggerExplosion(group.position)

                // Respawn far away
                group.position.x = shipPosition.x + MathUtils.randFloatSpread(50) + (Math.random() > 0.5 ? 20 : -20)
                group.position.y = shipPosition.y + MathUtils.randFloatSpread(50) + (Math.random() > 0.5 ? 20 : -20)
                group.position.z = shipPosition.z + MathUtils.randFloatSpread(30)
            }
        })

        nearestOrbRef.current = nearestOrb
    })

    return (
        <>
            {/* Distance line to nearest orb */}
            {nearestOrbRef.current && (
                <>
                    <Line
                        points={[
                            [shipPosition.x, shipPosition.y, shipPosition.z],
                            [nearestOrbRef.current.position.x, nearestOrbRef.current.position.y, nearestOrbRef.current.position.z]
                        ]}
                        color="#ffaa00"
                        lineWidth={1}
                        dashed
                        dashScale={2}
                        transparent
                        opacity={0.4}
                    />
                    <Text
                        position={[
                            (shipPosition.x + nearestOrbRef.current.position.x) / 2,
                            (shipPosition.y + nearestOrbRef.current.position.y) / 2 + 1,
                            0
                        ]}
                        fontSize={0.5}
                        color="#ffaa00"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {Math.floor(new Vector3(shipPosition.x, shipPosition.y, shipPosition.z)
                            .distanceTo(nearestOrbRef.current.position))}m
                    </Text>
                </>
            )}

            {orbs.map((orb, i) => (
                <group
                    key={i}
                    position={orb.position}
                    ref={(el) => (orbRefs.current[i] = el)}
                >
                    <mesh>
                        <sphereGeometry args={[0.5, 16, 16]} />
                        <meshStandardMaterial
                            color="#ffaa00"
                            emissive="#ffaa00"
                            emissiveIntensity={2}
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Distance indicator ring */}
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.8, 1.0, 32]} />
                        <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} />
                    </mesh>
                </group>
            ))}
        </>
    )
}
