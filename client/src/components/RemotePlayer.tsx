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
      <mesh position={[0, 0.9, 0]} castShadow userData={{ playerId: player.id }}>
        <capsuleGeometry args={[0.4, 1.0]} />
        <meshStandardMaterial color={player.isAlive ? "royalblue" : "red"} />
      </mesh>

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
