'use client';
import { Canvas } from "@react-three/fiber";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { useEffect, useMemo, useState } from "react";
import type { BufferGeometry } from "three";

export default function STLModel({
    url,
    color,
    rotation,
    scale = 1,
} : {
    url: string,
    color: string,
    rotation?: [number, number, number],
    scale?: number,
}) {
    const [geometry, setGeometry] = useState<BufferGeometry | null>(null);
    const loader = useMemo(() => new STLLoader(), []);

    useEffect(() => {
        loader.load(url, (geometry) => {
            geometry.computeVertexNormals();
            geometry.center();
            setGeometry(geometry);
        }, undefined, (error) => {
            console.error("Failed to load STL:", error);
        });
    }, [loader, url]);

    return (
        <Canvas
            className="rounded-lg border border-gray-700 h-full max-h-[50vh]"
            camera={{ fov: 10, near: 0.1, far: 1000, position: [0, 0, 50] }}
            gl={{ alpha: true, antialias: true }}
            onCreated={({ gl, camera }) => {
                gl.setClearColor(0x000000, 0);
                camera.lookAt(0, 0, 0);
            }}
        >
            <ambientLight intensity={100} />
            <directionalLight position={[1, 1, 1]} intensity={1} />
            <directionalLight position={[0, 0, 5]} intensity={1} />
            <directionalLight position={[0, 5, 0]} intensity={1} />
            <directionalLight position={[-1, -1, -1]} intensity={0.5} />
            {geometry && (
                <mesh geometry={geometry} rotation={rotation} scale={scale}>
                    <meshStandardMaterial color={color} metalness={1} roughness={0.5} />
                </mesh>
            )}
        </Canvas>
    );
}