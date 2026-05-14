import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { GameWorld } from './components/GameWorld';
import { networkManager } from './network';
import { useGameStore, ToolMode } from './store';
import { BLOCK_CATALOG } from '@game/shared';

function App() {
  const [joined, setJoined] = useState(false);
  const [nickname, setNickname] = useState('');
  const localPlayerId = useGameStore((state) => state.localPlayerId);
  const players = useGameStore((state) => state.gameState.players);
  const toolMode = useGameStore((state) => state.toolMode);
  const selectedBlockType = useGameStore((state) => state.selectedBlockType);
  const setSelectedBlockType = useGameStore((state) => state.setSelectedBlockType);

  const localPlayer = localPlayerId ? players[localPlayerId] : null;

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim()) {
      networkManager.connect(nickname);
      setJoined(true);
    }
  };

  if (!joined) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
        background: '#222', color: 'white', fontFamily: 'sans-serif'
      }}>
        <form onSubmit={handleJoin} style={{ textAlign: 'center', padding: '40px', background: '#333', borderRadius: '10px' }}>
          <h1>BRICK RIGS CLONE</h1>
          <input
            type="text"
            placeholder="Nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{ padding: '10px', fontSize: '18px', marginBottom: '20px', borderRadius: '5px', border: 'none' }}
          /><br/>
          <button
            type="submit"
            style={{ padding: '10px 20px', fontSize: '18px', background: '#0077ff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
          >
            Join Game
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      boxShadow: localPlayer?.lowHpState ? 'inset 0 0 100px rgba(255,0,0,0.5)' : 'none'
    }}>
      <Canvas shadows camera={{ fov: 75, near: 0.1, far: 1000 }}>
        <GameWorld />
      </Canvas>

      <div style={{
        position: 'absolute', bottom: '20px', left: '20px', color: 'white',
        fontFamily: 'sans-serif', pointerEvents: 'none'
      }}>
        {localPlayer && (
          <div>
            <div style={{ fontSize: '24px', marginBottom: '5px', textShadow: '2px 2px 2px black' }}>HP: {Math.round(localPlayer.hp)}</div>
            <div style={{ width: '200px', height: '20px', background: '#333', border: '2px solid white' }}>
              <div style={{
                width: `${localPlayer.hp}%`, height: '100%',
                background: localPlayer.hp > 30 ? '#00ff00' : '#ff0000',
                transition: 'width 0.3s'
              }} />
            </div>
            <div style={{ marginTop: '10px', fontSize: '18px', textShadow: '2px 2px 2px black' }}>
              Mode: <span style={{ color: '#00ccff' }}>{toolMode.toUpperCase()}</span>
            </div>
            {toolMode === ToolMode.Build && (
              <div style={{ marginTop: '5px', textShadow: '2px 2px 2px black' }}>
                Block: <span style={{ color: '#ffcc00' }}>{BLOCK_CATALOG[selectedBlockType].name}</span>
              </div>
            )}
            {!localPlayer.isAlive && (
              <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '64px', color: 'red', fontWeight: 'bold', textShadow: '4px 4px 4px black' }}>
                YOU DIED
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '20px', height: '20px', border: '2px solid white', borderRadius: '50%',
        pointerEvents: 'none'
      }} />

      {toolMode === ToolMode.Build && (
        <div style={{
          position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '10px',
          background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '10px', pointerEvents: 'auto'
        }}>
          {Object.values(BLOCK_CATALOG).map(block => (
            <div
              key={block.id}
              onClick={() => setSelectedBlockType(block.id)}
              style={{
                width: '40px', height: '40px', background: block.color, border: selectedBlockType === block.id ? '3px solid white' : '1px solid black',
                cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '10px', color: 'black', fontWeight: 'bold',
                textAlign: 'center'
              }}
              title={block.name}
            >
              {block.name.split(' ')[0]}
            </div>
          ))}
        </div>
      )}

      <div style={{
        position: 'absolute', top: '20px', right: '20px', color: 'white',
        fontFamily: 'sans-serif', background: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '5px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Players:</div>
        {Object.values(players).map(p => (
          <div key={p.id} style={{ fontSize: '14px', color: p.isAlive ? 'white' : 'red' }}>
            {p.nickname} {p.id === localPlayerId ? '(You)' : ''}
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
        color: 'white', fontFamily: 'sans-serif', pointerEvents: 'none', textAlign: 'center',
        textShadow: '1px 1px 1px black'
      }}>
        <div style={{ fontSize: '14px', opacity: 0.8 }}>
          WASD: move | Space: jump | Shift: run<br/>
          1: Weapon | 2: Build | 3: Remove | E: Enter/Exit<br/>
          Arrows: Pitch/Roll (Planes) | Click: action | ESC: unlock mouse
        </div>
      </div>
    </div>
  );
}

export default App;
