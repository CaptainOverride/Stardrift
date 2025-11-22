import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Grid } from '@react-three/drei'

export function GridFloor() {
    const gridRef = useRef()

    useFrame((state) => {
        if (!gridRef.current) return
        // Move grid with camera to create infinite illusion
        gridRef.current.position.x = state.camera.position.x
        gridRef.current.position.y = state.camera.position.y
    })

    return (
        <group ref={gridRef}>
            <Grid
                position={[0, 0, -5]}
                args={[100, 100]}
                cellSize={2}
                cellThickness={0.5}
                cellColor="#00ffff"
                sectionSize={10}
                sectionThickness={1}
                sectionColor="#0088ff"
                fadeDistance={50}
                fadeStrength={1}
                infiniteGrid
            />
        </group>
    )
}
