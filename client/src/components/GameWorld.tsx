import { PointerLockControls, Sky, Environment } from '@react-three/drei';
import { Physics, RigidBody } from '@react-three/rapier';
import { PlayerController } from './PlayerController';
import { useGameStore } from '../store';
import { RemotePlayer } from './RemotePlayer';
import { MAP_SIZE } from '@game/shared';
import { BuildSystem } from './BuildSystem';
import { Block } from './Block';
import { Vehicle } from './Vehicle';

export function GameWorld() {
  const players = useGameStore((state) => state.gameState.players);
  const blocks = useGameStore((state) => state.gameState.blocks);
  const vehicles = useGameStore((state) => state.gameState.vehicles);
  const localPlayerId = useGameStore((state) => state.localPlayerId);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} castShadow />

      <Physics gravity={[0, -9.81, 0]}>
        <RigidBody type="fixed">
          <mesh receiveShadow position={[0, -0.5, 0]}>
            <boxGeometry args={[MAP_SIZE, 1, MAP_SIZE]} />
            <meshStandardMaterial color="#44aa44" />
          </mesh>
        </RigidBody>

        <PlayerController />

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
