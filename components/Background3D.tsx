
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

const DNAHelixOptimized = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  const count = 80;
  const radius = 2.5;
  const height = 18;

  const { particles, linePositions, colors } = useMemo(() => {
    const tempParticles = [];
    const tempLinePos = [];
    const tempColors = new Float32Array(count * 2 * 3);
    const color1 = new THREE.Color('#22d3ee');
    const color2 = new THREE.Color('#a855f7');

    for (let i = 0; i < count; i++) {
      const t = i / (count / 8);
      const y = (i / count) * height - height / 2;
      
      const x1 = Math.cos(t) * radius;
      const z1 = Math.sin(t) * radius;
      
      const x2 = Math.cos(t + Math.PI) * radius;
      const z2 = Math.sin(t + Math.PI) * radius;

      tempParticles.push({ x: x1, y, z: z1, color: color1 });
      tempParticles.push({ x: x2, y, z: z2, color: color2 });

      tempLinePos.push(x1, y, z1);
      tempLinePos.push(x2, y, z2);

      color1.toArray(tempColors, i * 6);
      color2.toArray(tempColors, i * 6 + 3);
    }
    return { particles: tempParticles, linePositions: new Float32Array(tempLinePos), colors: tempColors };
  }, []);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current) return;

    const time = state.clock.elapsedTime;
    
    groupRef.current.rotation.y = time * 0.2;
    groupRef.current.position.y = Math.sin(time * 0.5) * 0.5;
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
      
      if(meshRef.current.instanceColor) {
         for (let i = 0; i < particles.length; i++) {
             meshRef.current.setColorAt(i, particles[i].color);
         }
         meshRef.current.instanceColor.needsUpdate = true;
      }
    }
  }, [particles]);

  return (
    <group ref={groupRef} rotation={[0, 0, Math.PI / 8]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff"
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.8}
        />
      </instancedMesh>

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
      <Canvas camera={{ position: [0, 0, 14], fov: 40 }} dpr={[1, 1.5]} performance={{ min: 0.5 }}>
        <fog attach="fog" args={['#000000', 10, 30]} />
        <ambientLight intensity={0.5} />
        
        <DNAHelixOptimized />
        
        <Stars radius={80} depth={40} count={2000} factor={3} saturation={0} fade speed={0.5} />
        
        <gridHelper args={[50, 50, 0x222222, 0x111111]} position={[0, -8, 0]} rotation={[0, 0, 0]} />
      </Canvas>
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none"></div>
    </div>
  );
};

export default Background3D;
