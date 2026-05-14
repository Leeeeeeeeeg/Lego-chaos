import { useRef } from 'react';
import { PlayerState } from '@game/shared';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export function RemotePlayer({ player }: { player: PlayerState }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(new THREE.Vector3(player.position.x, player.position.y, player.position.z), 0.2);
      meshRef.current.quaternion.slerp(new THREE.Quaternion(player.rotation.x, player.rotation.y, player.rotation.z, player.rotation.w), 0.2);
    }
  });

  return (
    <group ref={meshRef}>
      <group position={[0, 0, 0]} userData={{ playerId: player.id }}>
        {/* Torso */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[0.6, 0.7, 0.3]} />
          <meshStandardMaterial color={player.isAlive ? "royalblue" : "red"} />
        </mesh>

        {/* Head */}
        <group position={[0, 1.3, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.35, 0.35, 0.35]} />
              <meshStandardMaterial color="#ffe0bd" />
            </mesh>
            {/* Face - Eyes */}
            <mesh position={[0.07, 0.05, -0.18]}>
                <boxGeometry args={[0.05, 0.05, 0.01]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[-0.07, 0.05, -0.18]}>
                <boxGeometry args={[0.05, 0.05, 0.01]} />
                <meshStandardMaterial color="black" />
            </mesh>
            {/* Mouth */}
            <mesh position={[0, -0.08, -0.18]}>
                <boxGeometry args={[0.1, 0.02, 0.01]} />
                <meshStandardMaterial color="black" />
            </mesh>
        </group>

        {/* Arms */}
        <mesh position={[0.4, 0.75, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#ffe0bd" />
        </mesh>
        <mesh position={[-0.4, 0.75, 0]} castShadow>
          <boxGeometry args={[0.2, 0.6, 0.2]} />
          <meshStandardMaterial color="#ffe0bd" />
        </mesh>

        {/* Legs */}
        <mesh position={[0.15, 0.2, 0]} castShadow>
          <boxGeometry args={[0.25, 0.4, 0.25]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        <mesh position={[-0.15, 0.2, 0]} castShadow>
          <boxGeometry args={[0.25, 0.4, 0.25]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      </group>

      <Html position={[0, 2, 0]} center>
        <div style={{ width: '50px', height: '5px', background: '#333', border: '1px solid #000' }}>
          <div style={{
            width: `${player.hp}%`,
            height: '100%',
            background: player.hp > 30 ? '#00ff00' : '#ff0000',
            transition: 'width 0.3s'
          }} />
        </div>
        <div style={{ color: 'white', fontSize: '10px', textAlign: 'center', textShadow: '1px 1px 1px black' }}>
          {player.nickname}
        </div>
      </Html>
    </group>
  );
}
