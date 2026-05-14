import { useThree, useFrame } from '@react-three/fiber';
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { RigidBody, CapsuleCollider, RapierRigidBody } from '@react-three/rapier';
import { networkManager } from '../network';
import { useGameStore, ToolMode } from '../store';
import { SocketEvents, BUILD_DISTANCE } from '@game/shared';

export function PlayerController() {
  const { camera, scene } = useThree();
  const rb = useRef<RapierRigidBody>(null);
  const setToolMode = useGameStore((state) => state.setToolMode);
  const setKey = useGameStore((state) => state.setKey);
  const keys = useGameStore((state) => state.keys);
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const localPlayer = useGameStore((state) => (localPlayerId ? state.gameState.players[localPlayerId] : null));

  const moveSpeed = 5;
  const sprintSpeed = 10;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setKey(e.code, true);
      if (e.code === 'KeyB') setToolMode(ToolMode.Build);
      if (e.code === 'KeyV') setToolMode(ToolMode.Remove);
      if (e.code === 'Digit1') setToolMode(ToolMode.Weapon);
      if (e.code === 'Digit2') setToolMode(ToolMode.Build);
      if (e.code === 'Digit3') setToolMode(ToolMode.Remove);

      if (e.code === 'KeyE') {
          if (localPlayer?.currentVehicleId) {
              networkManager.socket?.emit(SocketEvents.ExitVehicle);
          } else {
              const raycaster = new THREE.Raycaster();
              raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
              const intersects = raycaster.intersectObjects(scene.children, true);
              const seatHit = intersects.find(i => i.object.userData.blockId && i.distance <= BUILD_DISTANCE);
              if (seatHit) {
                  networkManager.socket?.emit(SocketEvents.EnterVehicle, { blockId: seatHit.object.userData.blockId });
              }
          }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      setKey(e.code, false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setToolMode, setKey, localPlayer, camera, scene]);

  useFrame((state) => {
    if (!rb.current || (localPlayer && localPlayer.currentVehicleId)) {
        if (localPlayer && localPlayer.currentVehicleId) {
            rb.current?.setTranslation({ x: 0, y: -100, z: 0 }, true);
        }
        return;
    };

    const velocity = rb.current.linvel();
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    forward.y = 0;
    right.y = 0;
    forward.normalize();
    right.normalize();

    const speed = keys['ShiftLeft'] ? sprintSpeed : moveSpeed;
    const inputVelocity = new THREE.Vector3();

    if (keys['KeyW']) inputVelocity.add(forward);
    if (keys['KeyS']) inputVelocity.sub(forward);
    if (keys['KeyA']) inputVelocity.sub(right);
    if (keys['KeyD']) inputVelocity.add(right);

    inputVelocity.normalize().multiplyScalar(speed);

    rb.current.setLinvel({ x: inputVelocity.x, y: velocity.y, z: inputVelocity.z }, true);

    if (keys['Space'] && Math.abs(velocity.y) < 0.1) {
      rb.current.applyImpulse({ x: 0, y: 5, z: 0 }, true);
    }

    const pos = rb.current.translation();
    camera.position.set(pos.x, pos.y + 0.8, pos.z);

    networkManager.sendInput(
      { x: pos.x, y: pos.y, z: pos.z },
      { x: camera.quaternion.x, y: camera.quaternion.y, z: camera.quaternion.z, w: camera.quaternion.w }
    );
  });

  return (
    <RigidBody
      ref={rb}
      colliders={false}
      position={[0, 5, 0]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.4, 0.4]} />
    </RigidBody>
  );
}
