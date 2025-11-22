import { useRef } from 'react'

export function Ship() {
    return (
        <mesh>
            <coneGeometry args={[0.5, 2, 4]} />
            <meshStandardMaterial color="cyan" />
        </mesh>
    )
}
