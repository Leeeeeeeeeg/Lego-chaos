import { BlockState, BLOCK_CATALOG } from '@game/shared';
import * as THREE from 'three';

export function Block({ block }: { block: BlockState }) {
  const blockDef = BLOCK_CATALOG[block.type];
  if (!blockDef) return null;

  return (
    <group
      position={[block.position.x, block.position.y, block.position.z]}
      rotation={new THREE.Euler().setFromQuaternion(new THREE.Quaternion(block.rotation.x, block.rotation.y, block.rotation.z, block.rotation.w))}
      userData={{ blockId: block.id }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[blockDef.size.x, blockDef.size.y, blockDef.size.z]} />
        <meshStandardMaterial color={blockDef.color} />
      </mesh>

      {/* Edges */}
      <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(blockDef.size.x, blockDef.size.y, blockDef.size.z)]} />
          <lineBasicMaterial color="black" transparent opacity={0.2} />
      </lineSegments>

      {blockDef.shape === 'box' && (
          <group position={[0, blockDef.size.y/2, 0]}>
              <mesh rotation={[-Math.PI/2, 0, 0]}>
                  <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
                  <meshStandardMaterial color={blockDef.color} />
              </mesh>
          </group>
      )}
    </group>
  );
}
