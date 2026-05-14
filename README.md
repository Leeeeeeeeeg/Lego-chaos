# Brick Rigs Clone MVP

A browser-based LEGO-style multiplayer game where you can build, drive, fly, and fight.

## Features
- **First-Person Gameplay**: Walk, run, and jump around the world.
- **Multiplayer**: Real-time synchronization of players, blocks, and vehicles.
- **Building System**: Place and remove blocks with grid snapping.
- **Vehicle System**: Build cars and planes. The game automatically detects seats, engines, and wheels/wings to create drivable vehicles.
- **Combat**: Hitscan blaster to damage other players, blocks, and vehicles.
- **Destruction**: Blocks and vehicles have HP and can be destroyed.
- **Effects**: Low-HP vignette for players, smoke for damaged vehicles, and HP bars.

## Tech Stack
- **Frontend**: React, Three.js, @react-three/fiber, @react-three/rapier (Physics)
- **Backend**: Node.js, Socket.IO, Express
- **Shared**: Common TypeScript types and catalogs

## Installation

1. Install dependencies from the root:
   ```bash
   npm install
   ```

2. Build the shared package:
   ```bash
   npm run build -w shared
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

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the project:**
   ```bash
   npm run build
   ```

4. **Environment Variables:**
   Create a `.env` file in the `server` directory if you need to change the port or other settings (default is 3001).

5. **Running with a Process Manager (Recommended):**
   It's recommended to use `pm2` to keep the server running:
   ```bash
   npm install -g pm2
   pm2 start server/dist/index.js --name "game-server"
   ```

6. **Serving the Client:**
   The `client/dist` folder contains the built static files. You can serve them using Nginx, Apache, or a simple Node.js static server:
   ```bash
   npm install -g serve
   serve -s client/dist -l 3000
   ```

7. **Network Configuration:**
   - Ensure port `3000` (client) and `3001` (socket server) are open in your server's firewall.
   - Update the socket connection URL in `client/src/network.ts` if your server uses a different IP or domain.

## Controls
- **WASD**: Move player / Drive vehicle
- **Space**: Jump
- **Shift**: Sprint
- **Mouse**: Look
- **Left Click**: Action (Shoot / Place Block / Remove Block)
- **1**: Weapon Mode
- **2**: Build Mode
- **3**: Remove Mode
- **E**: Enter/Exit Vehicle (Look at a 'Seat' block to enter)
- **Arrow Keys**: Pitch and Roll for Planes
- **ESC**: Unlock Mouse

## Building a Vehicle
1. Place a **Seat** block.
2. Place an **Engine** block connected to the seat (directly or via other blocks).
3. Place at least 4 **Wheels** for a Car, or 2 **Wings** for a Plane.
4. Look at the **Seat** and press **E** to start driving/flying.

## MVP Limitations
- Simplified "arcade" physics for vehicles.
- Building grid is world-aligned.
- No client-side prediction (linear interpolation only).
- Max 10 players per server.
- Max 200 blocks per player.
