import { WeaponDefinition, WeaponType } from './types';

export const WEAPON_CATALOG: Record<string, WeaponDefinition> = {
  'blaster': {
    id: 'blaster',
    type: WeaponType.Blaster,
    damage: 20,
    fireRate: 300,
    range: 100,
    mountType: 'player',
  },
  'rocket_tool': {
    id: 'rocket_tool',
    type: WeaponType.RocketTool,
    damage: 50,
    fireRate: 60,
    range: 150,
    projectileSpeed: 30,
    mountType: 'player',
  },
  'vehicle_gun': {
    id: 'vehicle_gun',
    type: WeaponType.VehicleGun,
    damage: 15,
    fireRate: 600,
    range: 120,
    mountType: 'vehicle',
  },
};
