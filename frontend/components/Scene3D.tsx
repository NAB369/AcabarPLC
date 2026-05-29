'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PresentationControls, Environment, ContactShadows, Torus, Octahedron, Sphere } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedShapes() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Torus args={[1.5, 0.4, 16, 64]} rotation={[Math.PI / 3, 0, 0]} position={[0, 0, 0]}>
          <meshStandardMaterial color="#3b82f6" roughness={0.2} metalness={0.8} />
        </Torus>
      </Float>
      
      <Float speed={1.5} rotationIntensity={1} floatIntensity={2}>
        <Octahedron args={[0.5]} position={[-2, 1, 1]} rotation={[Math.PI / 4, Math.PI / 4, 0]}>
          <meshStandardMaterial color="#8b5cf6" roughness={0.1} metalness={0.9} />
        </Octahedron>
      </Float>

      <Float speed={2.5} rotationIntensity={0.8} floatIntensity={1.5}>
        <Sphere args={[0.4, 32, 32]} position={[2, -1, 0.5]}>
          <meshStandardMaterial color="#06b6d4" roughness={0.3} metalness={0.7} />
        </Sphere>
      </Float>
    </group>
  );
}

export default function Scene3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
        <color attach="background" args={['#ffffff']} />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <PresentationControls 
          global={false} 
          cursor={true} 
          snap={true} 
          speed={1.5} 
          zoom={1} 
          rotation={[0, 0, 0]} 
          polar={[-Math.PI / 4, Math.PI / 4]} 
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <AnimatedShapes />
        </PresentationControls>

        <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />
        
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}
