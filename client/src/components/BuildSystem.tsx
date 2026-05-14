import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect, useState, useCallback } from 'react';
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
  const previewRef = useRef<THREE.Group>(null);
  const [previewPos, setPreviewPos] = useState<THREE.Vector3 | null>(null);
  const [previewRot, setPreviewRot] = useState<number>(0);

  const raycaster = new THREE.Raycaster();

  useFrame(() => {
    if (toolMode !== ToolMode.Build) {
      if (previewPos) setPreviewPos(null);
      return;
    }

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    const validIntersects = intersects.filter(i => {
        // Find if object or its parent has blockId or if it's the floor
        let obj: THREE.Object3D | null = i.object;
        while(obj) {
            if (obj === previewRef.current) return false;
            obj = obj.parent;
        }
        return i.distance <= BUILD_DISTANCE;
    });

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

  const performAction = useCallback(() => {
    if (!localPlayer || !localPlayer.isAlive) return;

    if (toolMode === ToolMode.Build && previewPos) {
      const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, previewRot, 0));
      networkManager.placeBlock({
        type: selectedBlockType,
        position: { x: previewPos.x, y: previewPos.y, z: previewPos.z },
        rotation: { x: quat.x, y: quat.y, z: quat.z, w: quat.w },
        hp: BLOCK_CATALOG[selectedBlockType].maxHp,
        vehicleId: null,
      });
    } else if (toolMode === ToolMode.Remove) {
       raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
       const intersects = raycaster.intersectObjects(scene.children, true);
       const blockHit = intersects.find(i => {
           let obj: THREE.Object3D | null = i.object;
           while(obj) {
               if (obj.userData.blockId) return true;
               obj = obj.parent;
           }
           return false;
       });
       if (blockHit) {
           let obj: THREE.Object3D | null = blockHit.object;
           while(obj && !obj.userData.blockId) obj = obj.parent;
           if (obj) networkManager.removeBlock(obj.userData.blockId);
       }
    } else if (toolMode === ToolMode.Weapon) {
      const weapon = WEAPON_CATALOG[localPlayer.selectedWeaponId];
      raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Weapon effects logic moved to a dedicated component later,
      // but keeping basic shooting here for now.
      if (intersects.length > 0 && intersects[0].distance <= weapon.range) {
          const hit = intersects[0];
          let hitData: any = { damage: weapon.damage };

          let obj: THREE.Object3D | null = hit.object;
          let hitFound = false;
          while(obj) {
              if (obj.userData.playerId) {
                  hitData = { ...hitData, hitType: 'player', hitId: obj.userData.playerId };
                  hitFound = true;
                  break;
              } else if (obj.userData.blockId) {
                  hitData = { ...hitData, hitType: 'block', hitId: obj.userData.blockId };
                  hitFound = true;
                  break;
              } else if (obj.userData.vehicleId) {
                  hitData = { ...hitData, hitType: 'vehicle', hitId: obj.userData.vehicleId };
                  hitFound = true;
                  break;
              }
              obj = obj.parent;
          }

          if (hitFound) networkManager.shoot(hitData);
      }
    }
  }, [localPlayer, toolMode, previewPos, previewRot, selectedBlockType, camera, scene]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement !== document.body) return;
      if (e.button === 0) performAction();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'KeyR') setPreviewRot(r => r + Math.PI / 2);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [performAction]);

  // Expose performAction to global for UI button
  useEffect(() => {
      (window as any).performGameAction = performAction;
  }, [performAction]);

  if (toolMode !== ToolMode.Build || !previewPos) return null;

  const blockDef = BLOCK_CATALOG[selectedBlockType];

  return (
    <group ref={previewRef} position={previewPos} rotation={[0, previewRot, 0]}>
      <mesh>
        <boxGeometry args={[blockDef.size.x, blockDef.size.y, blockDef.size.z]} />
        <meshStandardMaterial color={blockDef.color} transparent opacity={0.5} />
      </mesh>
      <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(blockDef.size.x, blockDef.size.y, blockDef.size.z)]} />
          <lineBasicMaterial color="white" />
      </lineSegments>
    </group>
  );
}
