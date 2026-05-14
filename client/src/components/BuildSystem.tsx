import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useGameStore, ToolMode } from '../store';
import { BLOCK_CATALOG, GRID_SIZE, BUILD_DISTANCE, WEAPON_CATALOG } from '@game/shared';
import { networkManager } from '../network';

export function BuildSystem() {
  const { camera, scene } = useThree();
  const toolMode = useGameStore((state) => state.toolMode);
  const selectedBlockType = useGameStore((state) => state.selectedBlockType);
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const localPlayer = useGameStore((state) => (localPlayerId ? state.gameState.players[localPlayerId] : null));
  const previewRef = useRef<THREE.Mesh>(null);
  const [previewPos, setPreviewPos] = useState<THREE.Vector3 | null>(null);

  const raycaster = new THREE.Raycaster();

  useFrame(() => {
    if (toolMode !== ToolMode.Build) {
      if (previewPos) setPreviewPos(null);
      return;
    }

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const validIntersects = intersects.filter(i =>
      i.object !== previewRef.current &&
      i.distance <= BUILD_DISTANCE
    );

    if (validIntersects.length > 0) {
      const hit = validIntersects[0];
      const pos = hit.point.clone().add(hit.face!.normal.clone().multiplyScalar(0.5));

      const snappedPos = new THREE.Vector3(
        Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
        Math.round(pos.y / GRID_SIZE) * GRID_SIZE,
        Math.round(pos.z / GRID_SIZE) * GRID_SIZE
      );

      setPreviewPos(snappedPos);
    } else {
      setPreviewPos(null);
    }
  });

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== document.body) return;
      if (!localPlayer || !localPlayer.isAlive) return;

      if (e.button === 0) {
        if (toolMode === ToolMode.Build && previewPos) {
          networkManager.placeBlock({
            type: selectedBlockType,
            position: { x: previewPos.x, y: previewPos.y, z: previewPos.z },
            rotation: { x: 0, y: 0, z: 0, w: 1 },
            hp: BLOCK_CATALOG[selectedBlockType].maxHp,
            vehicleId: null,
          });
        } else if (toolMode === ToolMode.Remove) {
           raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
           const intersects = raycaster.intersectObjects(scene.children, true);
           const blockHit = intersects.find(i => i.object.userData.blockId && i.distance <= BUILD_DISTANCE);
           if (blockHit) {
             networkManager.removeBlock(blockHit.object.userData.blockId);
           }
        } else if (toolMode === ToolMode.Weapon) {
          const weapon = WEAPON_CATALOG[localPlayer.selectedWeaponId];
          raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
          const intersects = raycaster.intersectObjects(scene.children, true);

          const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(0, 0, 0),
              new THREE.Vector3(0, 0, -weapon.range)
          ]);
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
          const line = new THREE.Line(lineGeometry, lineMaterial);
          camera.add(line);
          setTimeout(() => camera.remove(line), 50);

          if (intersects.length > 0 && intersects[0].distance <= weapon.range) {
              const hit = intersects[0];
              let hitData: any = { damage: weapon.damage };

              if (hit.object.userData.playerId) {
                  hitData = { ...hitData, hitType: 'player', hitId: hit.object.userData.playerId };
              } else if (hit.object.userData.blockId) {
                  hitData = { ...hitData, hitType: 'block', hitId: hit.object.userData.blockId };
              } else if (hit.object.userData.vehicleId) {
                  hitData = { ...hitData, hitType: 'vehicle', hitId: hit.object.userData.vehicleId };
              }

              networkManager.shoot(hitData);
          } else {
              networkManager.shoot({ damage: 0 });
          }
        }
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    return () => window.removeEventListener('mousedown', handleMouseDown);
  }, [toolMode, previewPos, selectedBlockType, camera, scene, localPlayer]);

  if (toolMode !== ToolMode.Build || !previewPos) return null;

  const blockDef = BLOCK_CATALOG[selectedBlockType];

  return (
    <mesh ref={previewRef} position={previewPos}>
      <boxGeometry args={[blockDef.size.x, blockDef.size.y, blockDef.size.z]} />
      <meshStandardMaterial color={blockDef.color} transparent opacity={0.5} />
    </mesh>
  );
}
