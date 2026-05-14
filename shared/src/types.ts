export type Vector3 = { x: number; y: number; z: number };
export type Quaternion = { x: number; y: number; z: number; w: number };

export enum BlockShape {
  Box = 'box',
  Wedge = 'wedge',
  Cylinder = 'cylinder',
}

export enum BlockCategory {
  Basic = 'basic',
  Vehicle = 'vehicle',
  Aircraft = 'aircraft',
  Weapon = 'weapon',
}

export interface BlockDefinition {
  id: string;
  name: string;
  size: Vector3;
  shape: BlockShape;
  maxHp: number;
  mass: number;
  color: string;
  category: BlockCategory;
}

export interface BlockState {
  id: string;
  type: string; // id from blockCatalog
  position: Vector3;
  rotation: Quaternion;
  hp: number;
  ownerId: string;
  vehicleId: string | null;
}

export enum VehicleType {
  Car = 'car',
  Plane = 'plane',
  Custom = 'custom',
}

export interface VehicleState {
  id: string;
  ownerId: string;
  position: Vector3;
  rotation: Quaternion;
  velocity: Vector3;
  hp: number;
  maxHp: number;
  blockIds: string[];
  vehicleType: VehicleType;
  isSmoking: boolean;
  driverId: string | null;
}

export interface PlayerState {
  id: string;
  nickname: string;
  position: Vector3;
  rotation: Quaternion;
  hp: number;
  maxHp: number;
  selectedBlockId: string;
  selectedWeaponId: string;
  currentVehicleId: string | null;
  isAlive: boolean;
  lowHpState: boolean;
}

export enum WeaponType {
  Blaster = 'blaster',
  RocketTool = 'rocket_tool',
  VehicleGun = 'vehicle_gun',
}

export interface WeaponDefinition {
  id: string;
  type: WeaponType;
  damage: number;
  fireRate: number; // rounds per minute
  range: number;
  projectileSpeed?: number;
  mountType: 'player' | 'vehicle';
}

export interface GameState {
  players: Record<string, PlayerState>;
  blocks: Record<string, BlockState>;
  vehicles: Record<string, VehicleState>;
}

export enum SocketEvents {
  Connect = 'connect',
  Disconnect = 'disconnect',
  Join = 'join',
  GameStateUpdate = 'gameStateUpdate',
  PlayerInput = 'playerInput',
  PlaceBlock = 'placeBlock',
  RemoveBlock = 'removeBlock',
  Shoot = 'shoot',
  EnterVehicle = 'enterVehicle',
  ExitVehicle = 'exitVehicle',
  PlayerDamaged = 'playerDamaged',
  BlockDamaged = 'blockDamaged',
  VehicleDamaged = 'vehicleDamaged',
  PlayerDied = 'playerDied',
  PlayerRespawn = 'playerRespawn',
}
