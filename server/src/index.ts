import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { nanoid } from 'nanoid';
import {
  GameState,
  PlayerState,
  SocketEvents,
  TICK_INTERVAL,
  MAX_PLAYERS,
  VehicleState,
  VehicleType,
} from '@game/shared';
import { detectVehicle } from './vehicleLogic';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const gameState: GameState = {
  players: {},
  blocks: {},
  vehicles: {},
};

io.on('connection', (socket: Socket) => {
  console.log('Player connected:', socket.id);

  if (Object.keys(gameState.players).length >= MAX_PLAYERS) {
    socket.emit('error', 'Server full');
    socket.disconnect();
    return;
  }

  socket.on(SocketEvents.Join, ({ nickname }: { nickname: string }) => {
    console.log(`Player ${nickname} joined`);

    const player: PlayerState = {
      id: socket.id,
      nickname,
      position: { x: (Math.random() - 0.5) * 10, y: 1, z: (Math.random() - 0.5) * 10 },
      rotation: { x: 0, y: 0, z: 0, w: 1 },
      hp: 100,
      maxHp: 100,
      selectedBlockId: 'cube_1x1x1',
      selectedWeaponId: 'blaster',
      currentVehicleId: null,
      isAlive: true,
      lowHpState: false,
    };

    gameState.players[socket.id] = player;
    socket.emit(SocketEvents.GameStateUpdate, gameState);
  });

  socket.on(SocketEvents.PlayerInput, (input: { position: any, rotation: any }) => {
    const player = gameState.players[socket.id];
    if (player && player.isAlive) {
      player.position = input.position;
      player.rotation = input.rotation;
    }
  });

  socket.on(SocketEvents.PlaceBlock, (blockData: any) => {
    const player = gameState.players[socket.id];
    if (!player || !player.isAlive) return;

    const blockId = nanoid();
    gameState.blocks[blockId] = {
      ...blockData,
      id: blockId,
      ownerId: socket.id,
    };
  });

  socket.on(SocketEvents.RemoveBlock, ({ blockId }: { blockId: string }) => {
    const player = gameState.players[socket.id];
    if (!player || !player.isAlive) return;

    const block = gameState.blocks[blockId];
    if (block && block.vehicleId) {
        const vehicle = gameState.vehicles[block.vehicleId];
        if (vehicle) {
            vehicle.blockIds = vehicle.blockIds.filter(id => id !== blockId);
            if (vehicle.blockIds.length === 0) {
                delete gameState.vehicles[block.vehicleId];
            }
        }
    }
    delete gameState.blocks[blockId];
  });

  socket.on(SocketEvents.EnterVehicle, ({ blockId }: { blockId: string }) => {
      const player = gameState.players[socket.id];
      if (!player || !player.isAlive || player.currentVehicleId) return;

      const block = gameState.blocks[blockId];
      if (!block || block.type !== 'seat') return;

      let vehicleId = block.vehicleId;

      if (!vehicleId) {
          const assembly = detectVehicle(gameState.blocks, blockId);
          if (assembly) {
              vehicleId = nanoid();
              const firstBlock = gameState.blocks[assembly.blockIds[0]];
              gameState.vehicles[vehicleId] = {
                  id: vehicleId,
                  ownerId: socket.id,
                  position: { ...firstBlock.position },
                  rotation: { ...firstBlock.rotation },
                  velocity: { x: 0, y: 0, z: 0 },
                  hp: 300,
                  maxHp: 300,
                  blockIds: assembly.blockIds,
                  vehicleType: assembly.type,
                  isSmoking: false,
                  driverId: socket.id,
              };
              assembly.blockIds.forEach(id => {
                  gameState.blocks[id].vehicleId = vehicleId;
              });
          }
      }

      const vehicle = vehicleId ? gameState.vehicles[vehicleId] : null;
      if (vehicle && !vehicle.driverId) {
          vehicle.driverId = socket.id;
          player.currentVehicleId = vehicleId;
      }
  });

  socket.on(SocketEvents.ExitVehicle, () => {
      const player = gameState.players[socket.id];
      if (!player || !player.currentVehicleId) return;

      const vehicle = gameState.vehicles[player.currentVehicleId];
      if (vehicle) {
          vehicle.driverId = null;
          player.position = { x: vehicle.position.x, y: vehicle.position.y + 2, z: vehicle.position.z };
      }
      player.currentVehicleId = null;
  });

  socket.on(SocketEvents.Shoot, (data: any) => {
    const player = gameState.players[socket.id];
    if (!player || !player.isAlive) return;

    if (data.hitType === 'player' && data.hitId) {
      const targetPlayer = gameState.players[data.hitId];
      if (targetPlayer && targetPlayer.isAlive) {
        targetPlayer.hp -= data.damage;
        if (targetPlayer.hp <= 30) targetPlayer.lowHpState = true;
        if (targetPlayer.hp <= 0) {
          targetPlayer.hp = 0;
          targetPlayer.isAlive = false;
          targetPlayer.currentVehicleId = null;
          io.emit(SocketEvents.PlayerDied, { playerId: targetPlayer.id });

          setTimeout(() => {
            if (gameState.players[targetPlayer.id]) {
              gameState.players[targetPlayer.id].hp = 100;
              gameState.players[targetPlayer.id].isAlive = true;
              gameState.players[targetPlayer.id].lowHpState = false;
              gameState.players[targetPlayer.id].position = { x: (Math.random() - 0.5) * 10, y: 1, z: (Math.random() - 0.5) * 10 };
              io.emit(SocketEvents.PlayerRespawn, { playerId: targetPlayer.id, position: gameState.players[targetPlayer.id].position });
            }
          }, 5000);
        }
      }
    } else if (data.hitType === 'block' && data.hitId) {
        const targetBlock = gameState.blocks[data.hitId];
        if (targetBlock) {
            targetBlock.hp -= data.damage;
            if (targetBlock.hp <= 0) {
                if (targetBlock.vehicleId) {
                    const vehicle = gameState.vehicles[targetBlock.vehicleId];
                    if (vehicle) {
                        vehicle.hp -= data.damage;
                        if (vehicle.hp <= 30 * (vehicle.maxHp/100)) vehicle.isSmoking = true;
                        if (vehicle.hp <= 0) {
                            vehicle.blockIds.forEach(id => delete gameState.blocks[id]);
                            delete gameState.vehicles[targetBlock.vehicleId];
                        }
                    }
                }
                delete gameState.blocks[data.hitId];
            }
        }
    } else if (data.hitType === 'vehicle' && data.hitId) {
        const vehicle = gameState.vehicles[data.hitId];
        if (vehicle) {
            vehicle.hp -= data.damage;
            if (vehicle.hp <= 30 * (vehicle.maxHp/100)) vehicle.isSmoking = true;
            if (vehicle.hp <= 0) {
                vehicle.blockIds.forEach(id => delete gameState.blocks[id]);
                delete gameState.vehicles[data.hitId];
            }
        }
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    delete gameState.players[socket.id];
  });
});

setInterval(() => {
  io.emit(SocketEvents.GameStateUpdate, gameState);
}, TICK_INTERVAL);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
