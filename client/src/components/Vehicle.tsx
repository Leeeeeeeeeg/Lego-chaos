import { useRef, useMemo } from 'react';
import { VehicleState, BLOCK_CATALOG, VehicleType } from '@game/shared';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import { networkManager } from '../network';
import { Html } from '@react-three/drei';

export function Vehicle({ vehicle }: { vehicle: VehicleState }) {
  const rb = useRef<RapierRigidBody>(null);
  const { camera } = useThree();
  const blocks = useGameStore((state) => state.gameState.blocks);
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const keys = useGameStore((state) => state.keys);
  const isDriver = vehicle.driverId === localPlayerId;

  const vehicleBlocks = useMemo(() => {
    return vehicle.blockIds.map(id => blocks[id]).filter(Boolean);
  }, [vehicle.blockIds, blocks]);

  const center = useMemo(() => {
    if (vehicleBlocks.length === 0) return new THREE.Vector3();
    const sum = new THREE.Vector3();
    vehicleBlocks.forEach(b => sum.add(new THREE.Vector3(b.position.x, b.position.y, b.position.z)));
    return sum.divideScalar(vehicleBlocks.length);
  }, [vehicleBlocks]);

  useFrame((state, delta) => {
    if (!rb.current) return;

    if (isDriver) {
      const rotation = rb.current.rotation();
      const currentRotation = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(currentRotation);

      if (vehicle.vehicleType === VehicleType.Car) {
        let throttle = 0;
        if (keys['KeyW']) throttle = 20;
        if (keys['KeyS']) throttle = -10;

        let steer = 0;
        if (keys['KeyA']) steer = 1.5;
        if (keys['KeyD']) steer = -1.5;

        const linvel = rb.current.linvel();
        const velocityMagnitude = new THREE.Vector3(linvel.x, linvel.y, linvel.z).length();

        rb.current.applyImpulse(forward.clone().multiplyScalar(throttle), true);
        rb.current.setAngvel({ x: 0, y: steer * Math.min(velocityMagnitude * 0.2, 1), z: 0 }, true);
      } else if (vehicle.vehicleType === VehicleType.Plane) {
        let throttle = 0;
        if (keys['KeyW']) throttle = 30;
        if (keys['KeyS']) throttle = -5;

        let pitch = 0;
        if (keys['ArrowUp']) pitch = 1;
        if (keys['ArrowDown']) pitch = -1;

        let roll = 0;
        if (keys['KeyA']) roll = 1;
        if (keys['KeyD']) roll = -1;

        rb.current.applyImpulse(forward.clone().multiplyScalar(throttle), true);

        const linvel = rb.current.linvel();
        const localVelocity = new THREE.Vector3(linvel.x, linvel.y, linvel.z).applyQuaternion(currentRotation.clone().invert());
        if (localVelocity.z < -5) {
            rb.current.applyImpulse({ x: 0, y: Math.abs(localVelocity.z) * 0.5, z: 0 }, true);
        }

        rb.current.setAngvel({ x: pitch * 2, y: roll * 1, z: -roll * 2 }, true);
      }

      const pos = rb.current.translation();
      const rot = rb.current.rotation();

      camera.position.set(pos.x, pos.y + 2, pos.z + 5);
      camera.lookAt(pos.x, pos.y, pos.z);

      networkManager.sendInput(
        { x: pos.x, y: pos.y, z: pos.z },
        { x: rot.x, y: rot.y, z: rot.z, w: rot.w }
      );
    } else {
        const targetPos = new THREE.Vector3(vehicle.position.x, vehicle.position.y, vehicle.position.z);
        const targetRot = new THREE.Quaternion(vehicle.rotation.x, vehicle.rotation.y, vehicle.rotation.z, vehicle.rotation.w);

        rb.current.setNextKinematicTranslation(targetPos);
        rb.current.setNextKinematicRotation(targetRot);
    }
  });

  return (
    <RigidBody
      ref={rb}
      type={isDriver ? "dynamic" : "kinematicPosition"}
      colliders="cuboid"
      position={[vehicle.position.x, vehicle.position.y, vehicle.position.z]}
      quaternion={[vehicle.rotation.x, vehicle.rotation.y, vehicle.rotation.z, vehicle.rotation.w]}
      userData={{ vehicleId: vehicle.id }}
    >
      {vehicleBlocks.map(block => {
        const blockDef = BLOCK_CATALOG[block.type];
        const relPos = [
            block.position.x - center.x,
            block.position.y - center.y,
            block.position.z - center.z
        ];
        return (
          <mesh key={block.id} position={relPos as [number, number, number]} castShadow receiveShadow userData={{ blockId: block.id }}>
            <boxGeometry args={[blockDef.size.x, blockDef.size.y, blockDef.size.z]} />
            <meshStandardMaterial color={blockDef.color} />
          </mesh>
        );
      })}

      {vehicle.isSmoking && (
        <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.5]} />
            <meshStandardMaterial color="gray" transparent opacity={0.6} />
        </mesh>
      )}

      <Html position={[0, 2, 0]} center>
          <div style={{ width: '60px', height: '6px', background: '#333', border: '1px solid #000' }}>
            <div style={{
              width: `${(vehicle.hp / vehicle.maxHp) * 100}%`,
              height: '100%',
              background: (vehicle.hp / vehicle.maxHp) > 0.3 ? '#ffff00' : '#ff0000',
              transition: 'width 0.3s'
            }} />
          </div>
      </Html>
    </RigidBody>
  );
}
