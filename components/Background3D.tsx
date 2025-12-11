
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const DNAHelixOptimized = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const count = 80; // Number of pairs (reduced slightly for performance without losing look)
  const radius = 2.5;
  const height = 18;

  // Generate data once
  const { particles, linePositions, colors } = useMemo(() => {
    const tempParticles = [];
    const tempLinePos = [];
    const tempColors = new Float32Array(count * 2 * 3);
    const color1 = new THREE.Color('#22d3ee'); // Cyan
    const color2 = new THREE.Color('#a855f7'); // Purple

    for (let i = 0; i < count; i++) {
      const t = i / (count / 8); // Tweak for spiral tightness
      const y = (i / count) * height - height / 2;
      
      // Strand 1 Position
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      
      // Strand 2 Position (Opposite)
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      tempParticles.push({ x: x1, y, z: z1, color: color1 });
      tempParticles.push({ x: x2, y, z: z2, color: color2 });

      // Line connections (Base pairs)
      tempLinePos.push(x1, y, z1);
      tempLinePos.push(x2, y, z2);

      // Instanced Color Array
      color1.toArray(tempColors, i * 6);
      color2.toArray(tempColors, i * 6 + 3);
    }
    return { particles: tempParticles, linePositions: new Float32Array(tempLinePos), colors: tempColors };
  }, []);

  // Update logic for positioning instances
  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;

    const time = state.clock.elapsedTime;
    
    // Rotate entire DNA
    groupRef.current.rotation.y = time * 0.2;
    // Gentle floating
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.5;

    // We don't need to update individual instances every frame if they are static relative to the group
    // This saves HUGE performance. The group rotation handles the movement.
  });

  useEffect(() => {
    if (meshRef.current) {
      const dummy = new THREE.Object3D();
      particles.forEach((p, i) => {
        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
      
      // Set colors for instances
      if(meshRef.current.instanceColor) {
         // Three.js r152+ handling, but for safety in older r3f versions we might need a custom attribute.
         // However, standard mesh doesn't support instanceColor easily without custom shader or recent three versions.
         // For reliability and speed, let's just make them all white/glowy or use a trick.
         // Actually, let's just use the loop to set colors if supported, otherwise default.
         for (let i = 0; i < particles.length; i++) {
             meshRef.current.setColorAt(i, particles[i].color);
         }
         meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [particles]);

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 8]}>
      {/* Atoms - Instanced for Performance */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]}>
        <sphereGeometry args={[0.12, 8, 8]} /> {/* Reduced segments from 16 to 8 */}
        <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.8}
        />
      </instancedMesh>

      {/* Connections - Lines instead of Tubes */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffffff" opacity={0.15} transparent />
      </lineSegments>
    </group>
  );
};

const Background3D: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      {/* dpr={[1, 2]} ensures it doesn't render too high res on mobile screens, saving battery and GPU */}
      <Canvas camera={{ position: [0, 0, 14], fov: 40 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        <fog attach="fog" args={['#000000', 10, 30]} />
        <ambientLight intensity={0.5} />
        
        <DNAHelixOptimized />
        
        {/* Optimized Stars: Lower count, reduced factor to keep them in background */}
        <Stars radius={80} depth={40} count={2000} factor={3} saturation={0} fade speed={0.5} />
        
        {/* Subtle grid floor */}
        <gridHelper args={[50, 50, 0x222222, 0x111111]} position={[0, -8, 0]} rotation={[0, 0, 0]} />
      </Canvas>
      
      {/* CSS Gradient Overlay for text readability - cheap for GPU */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none"></div>
    </div>
  );
};

export default Background3D;
