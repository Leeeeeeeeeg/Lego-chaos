import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore, ToolMode } from '../store';

export function Blaster() {
  const group = useRef<THREE.Group>(null);
  const muzzleFlash = useRef<THREE.Mesh>(null);
  const toolMode = useGameStore((state) => state.toolMode);
  const [recoil, setRecoil] = useState(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
        if (document.pointerLockElement !== document.body) return;
        if (e.button === 0 && toolMode === ToolMode.Weapon) {
            setRecoil(0.2);
            setFlash(true);
            setTimeout(() => setFlash(false), 50);
        }
    };
    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [toolMode]);

  useFrame((state, delta) => {
    if (group.current) {
        group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, 0.5 + recoil, 0.3);
        setRecoil(r => THREE.MathUtils.lerp(r, 0, 0.1));
    }
  });

  if (toolMode !== ToolMode.Weapon) return null;

  return (
    <group ref={group} position={[0.3, -0.3, 0.5]}>
      {/* Gun body */}
      <mesh castShadow>
        <boxGeometry args={[0.15, 0.2, 0.6]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Handle */}
      <mesh position={[0, -0.15, 0.15]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.1]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      {/* Barrel */}
      <mesh position={[0, 0.05, -0.35]}>
          <boxGeometry args={[0.1, 0.1, 0.4]} />
          <meshStandardMaterial color="#444" />
      </mesh>
      {/* Muzzle Flash */}
      {flash && (
          <mesh ref={muzzleFlash} position={[0, 0.05, -0.6]}>
              <sphereGeometry args={[0.15]} />
              <meshBasicMaterial color="yellow" transparent opacity={0.8} />
          </mesh>
      )}
      <pointLight position={[0, 0.05, -0.6]} intensity={flash ? 2 : 0} color="yellow" />
    </group>
  );
}
