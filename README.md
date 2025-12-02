# Tower Defense JS

A tower defense game built with Phaser 3, inspired by Flash Element TD 2.

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

This will start a local server at `http://localhost:8080` and open it in your browser.

### Manual Setup (Alternative)

If you prefer not to use npm, you can simply open `index.html` in a browser. The project uses the Phaser CDN, so no build step is required.

## Project Structure

```
TowerDefenseJS/
├── index.html          # Main HTML file
├── js/
│   └── main.js        # Main game logic and Phaser configuration
├── package.json        # Project dependencies
└── README.md          # This file
```

## Current Features

- ✅ Basic Phaser 3 setup
- ✅ Enemy path system
- ✅ Enemy spawning and movement
- ✅ Tower placement (click to place)
- ✅ Tower targeting and shooting
- ✅ Projectile system
- ✅ Basic health system

## Next Steps

To build out the full Flash Element TD 2 experience, you'll need to implement:

1. **Economy System**
   - Money management
   - Interest system (earn more by spending less)
   - Tower costs

2. **Enemy Types**
   - Different enemy types with varying health/speed
   - Elemental resistances
   - Invisibility mechanics
   - Healing abilities

3. **Tower Types**
   - Basic towers
   - Chain lightning towers
   - Splash damage towers
   - Slow towers
   - Sniper towers (can target invisible)

4. **Game Systems**
   - Wave management
   - Lives system
   - Win/lose conditions
   - UI improvements

5. **Polish**
   - Sprites and graphics
   - Sound effects
   - Particle effects
   - Animations

## Controls

- **Click** anywhere on the map to place a tower
- Towers automatically target and shoot at enemies in range

## Development Notes

- The game uses Phaser 3.80.1
- Currently uses simple shapes (circles/rectangles) for graphics
- Path is defined in the `createPath()` function
- All game logic is in `js/main.js`

## License

MIT

