import { io, Socket } from 'socket.io-client';
import { SocketEvents, GameState } from '@game/shared';
import { useGameStore } from './store';

class NetworkManager {
  socket: Socket | null = null;

  connect(nickname: string) {
    this.socket = io('http://localhost:3001');

    this.socket.on('connect', () => {
      console.log('Connected to server');
      useGameStore.getState().setLocalPlayerId(this.socket!.id!);
      this.socket?.emit(SocketEvents.Join, { nickname });
    });

    this.socket.on(SocketEvents.GameStateUpdate, (state: GameState) => {
      useGameStore.getState().setGameState(state);
    });

    this.socket.on('error', (msg: string) => {
      alert(msg);
    });
  }

  sendInput(position: { x: number, y: number, z: number }, rotation: { x: number, y: number, z: number, w: number }) {
    this.socket?.emit(SocketEvents.PlayerInput, { position, rotation });
  }

  placeBlock(blockData: any) {
    this.socket?.emit(SocketEvents.PlaceBlock, blockData);
  }

  removeBlock(blockId: string) {
    this.socket?.emit(SocketEvents.RemoveBlock, { blockId });
  }

  shoot(data: any) {
    this.socket?.emit(SocketEvents.Shoot, data);
  }
}

export const networkManager = new NetworkManager();
