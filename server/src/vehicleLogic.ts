import { BlockState, BLOCK_CATALOG, VehicleType } from '@game/shared';

export interface VehicleAssembly {
  type: VehicleType;
  blockIds: string[];
  seatBlockId: string;
}

export function detectVehicle(blocks: Record<string, BlockState>, startBlockId: string): VehicleAssembly | null {
  const connectedBlockIds = findConnectedBlocks(blocks, startBlockId);

  let seatBlockId: string | null = null;
  let wheelCount = 0;
  let engineCount = 0;
  let wingCount = 0;

  for (const id of connectedBlockIds) {
    const block = blocks[id];
    if (block.type === 'seat') seatBlockId = id;
    if (block.type === 'wheel') wheelCount++;
    if (block.type === 'engine') engineCount++;
    if (block.type === 'wing') wingCount++;
  }

  if (!seatBlockId || engineCount === 0) return null;

  if (wingCount >= 2) {
    return { type: VehicleType.Plane, blockIds: connectedBlockIds, seatBlockId };
  } else if (wheelCount >= 3) {
    return { type: VehicleType.Car, blockIds: connectedBlockIds, seatBlockId };
  }

  return null;
}

function findConnectedBlocks(blocks: Record<string, BlockState>, startId: string): string[] {
  const connected = new Set<string>();
  const queue = [startId];

  const blockArray = Object.values(blocks);

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (connected.has(currentId)) continue;
    connected.add(currentId);

    const currentBlock = blocks[currentId];
    const currentDef = BLOCK_CATALOG[currentBlock.type];

    for (const other of blockArray) {
      if (connected.has(other.id)) continue;

      const dist = Math.sqrt(
        Math.pow(currentBlock.position.x - other.position.x, 2) +
        Math.pow(currentBlock.position.y - other.position.y, 2) +
        Math.pow(currentBlock.position.z - other.position.z, 2)
      );

      const otherDef = BLOCK_CATALOG[other.type];
      const minDist = (Math.max(currentDef.size.x, currentDef.size.y, currentDef.size.z) +
                       Math.max(otherDef.size.x, otherDef.size.y, otherDef.size.z)) * 0.6;

      if (dist < minDist) {
        queue.push(other.id);
      }
    }
  }

  return Array.from(connected);
}
