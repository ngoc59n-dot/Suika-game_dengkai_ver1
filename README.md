# Suika Game Clone - Dice Edition

A browser-based clone of the Suika game, featuring various shaped dice instead of fruits. Built using HTML5 Canvas and Matter.js physics engine, and developed with Windsurf AI.

## How to Play

1. Click anywhere on the canvas to drop the current dice
2. Move the dice left or right before dropping
3. When two dice of the same type collide, they merge into the next type
4. The game ends if a settled dice crosses the red line at the top

## Dice Progression

The game features 11 different dice types, progressing from small to large:
- D2 (Coin) → D4 (Triangle) → D6 (Square) → D8 (Diamond) → D10 (Pentagon)
- D12 (Hexagon) → D16 (Octagon) → D20 (Decagon) → D100 (16-sided)
- D256 (24-sided) → D1000 (32-sided)

## Running the Game

### Using Docker

1. Pull the latest image:
```bash
docker pull duhblinn/suika-js-vibe:latest
```

2. Run the container:
```bash
docker run -p 8080:80 duhblinn/suika-js-vibe:latest
```

3. Open your browser and visit:
```
http://localhost:8080
```

### Local Development

1. Clone the repository
2. Open `index.html` in your browser

## Development

This project was developed using Windsurf AI, an advanced coding assistant. The game logic is implemented in `game.js` using Matter.js for physics simulation and collision detection.
