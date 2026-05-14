import { PointerLockControls, Sky, Environment } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { PlayerController } from './PlayerController';
import { useGameStore } from '../store';
import { RemotePlayer } from './RemotePlayer';
import { MAP_SIZE } from '@game/shared';
import { BuildSystem } from './BuildSystem';
import { Block } from './Block';
import { Vehicle } from './Vehicle';
import { Blaster } from './Blaster';
import * as THREE from 'three';
import { useMemo } from 'react';

export function GameWorld() {
  const players = useGameStore((state) => state.gameState.players);
  const blocks = useGameStore((state) => state.gameState.blocks);
  const vehicles = useGameStore((state) => state.gameState.vehicles);
  const localPlayerId = useGameStore((state) => state.localPlayerId);

  const tiles = useMemo(() => {
    const t = [];
    const tileSize = 10;
    for (let x = -MAP_SIZE/2; x < MAP_SIZE/2; x += tileSize) {
      for (let z = -MAP_SIZE/2; z < MAP_SIZE/2; z += tileSize) {
        const color = (Math.floor(x / tileSize) + Math.floor(z / tileSize)) % 2 === 0 ? "#44aa44" : "#3e993e";
        t.push({ x: x + tileSize/2, z: z + tileSize/2, color });
      }
    }
    return t;
  }, []);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />

      <Physics gravity={[0, -9.81, 0]}>
        {/* Ground */}
        <RigidBody type="fixed">
          {tiles.map((tile, i) => (
            <mesh key={i} receiveShadow position={[tile.x, -0.5, tile.z]}>
              <boxGeometry args={[10, 1, 10]} />
              <meshStandardMaterial color={tile.color} />
            </mesh>
          ))}
          <gridHelper args={[MAP_SIZE, MAP_SIZE / 2, "#228822", "#228822"]} position={[0, 0.01, 0]} />
        </RigidBody>

        <PlayerController />
        <Blaster />

        {Object.values(players).map((player) => (
          player.id !== localPlayerId && player.isAlive && !player.currentVehicleId && (
            <RemotePlayer key={player.id} player={player} />
          )
        ))}

        {Object.values(blocks).map((block) => (
          !block.vehicleId && <Block key={block.id} block={block} />
        ))}

        {Object.values(vehicles).map((vehicle) => (
          <Vehicle key={vehicle.id} vehicle={vehicle} />
        ))}
      </Physics>

      <BuildSystem />
      <PointerLockControls />
    </>
  );
}
