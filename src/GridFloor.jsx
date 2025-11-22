import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export function GridFloor() {
    const gridRef = useRef()

    useFrame((state) => {
        if (!gridRef.current) return
        // Move grid with camera to create infinite illusion
        gridRef.current.position.x = Math.floor(state.camera.position.x / 2) * 2
        gridRef.current.position.y = Math.floor(state.camera.position.y / 2) * 2
    })

    return (
        <group ref={gridRef}>
            <gridHelper
                args={[100, 50, '#0088ff', '#00ffff']}
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, 0, -5]}
            />
        </group>
    )
}
