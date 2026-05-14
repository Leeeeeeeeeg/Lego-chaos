# Brick Rigs Clone MVP

A browser-based LEGO-style multiplayer game where you can build, drive, fly, and fight.

## Features
- **First-Person Gameplay**: Walk, run, and jump around the world.
- **Blocky Player Model**: LEGO-like character with face and limbs.
- **Multiplayer**: Real-time synchronization of players, blocks, and vehicles.
- **Building System**: Place and remove blocks with grid snapping, rotation, and edges.
- **Vehicle System**: Build cars and planes. The game automatically detects seats, engines, and wheels/wings.
- **Combat**: Blaster weapon with recoil, muzzle flash, and damage.
- **Visual Improvements**: Tiled ground, block edges, and grid helper.
- **Effects**: Low-HP vignette and camera shake for players, smoke for damaged vehicles.

## Tech Stack
- **Frontend**: React, Three.js, @react-three/fiber, @react-three/rapier (Physics)
- **Backend**: Node.js, Socket.IO, Express
- **Shared**: Common TypeScript types and catalogs

## Installation

1. Install dependencies from the root:
   ```bash
   npm install
   ```

2. Build the project:
   ```bash
   npm run build
   ```

## Running the Game Locally

To run both client and server:
```bash
npm run dev
```

Or separately:
```bash
npm run dev:client
npm run dev:server
```

Open `http://localhost:3000` in multiple tabs to test multiplayer.

## Server Deployment

To install and run the game on a remote server:

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd brick-rigs-clone
   ```

2. **Install dependencies and build:**
   ```bash
   npm install
   npm run build
   ```

3. **Running with a Process Manager (Recommended):**
   ```bash
   npm install -g pm2
   pm2 start server/dist/index.js --name "game-server"
   ```

4. **Serving the Client:**
   ```bash
   npm install -g serve
   serve -s client/dist -l 3000
   ```

## Controls
- **WASD**: Move player / Drive vehicle
- **Space**: Jump
- **Shift**: Sprint
- **Mouse**: Look
- **Left Click / ACTION Button**: Action (Shoot / Place Block / Remove Block)
- **B**: Build Mode
- **X / Delete**: Remove Mode
- **0**: Weapon Mode
- **1-9**: Select different blocks from the catalog
- **R**: Rotate block (Build mode)
- **E**: Enter/Exit Vehicle (Look at a 'Seat' block to enter)
- **Arrow Keys**: Pitch and Roll for Planes
- **ESC**: Unlock Mouse

## Building a Vehicle
1. Place a **Seat** block.
2. Place an **Engine** block connected to the seat.
3. Place at least 4 **Wheels** for a Car, or 2 **Wings** for a Plane.
4. Look at the **Seat** and press **E** to start driving/flying.

## MVP Limitations
- Simplified "arcade" physics for vehicles.
- Building grid is world-aligned.
- No client-side prediction (linear interpolation only).
- Max 10 players per server.
- Max 200 blocks per player.
