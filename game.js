const Engine = Matter.Engine;
const Render = Matter.Render;
const World = Matter.World;
const Bodies = Matter.Bodies;
const Events = Matter.Events;
const Body = Matter.Body;

// Game constants
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
// ---- CANVAS full màn hình
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const GAME_OVER_LINE_Y = canvas.height * 0.2; // 20% from top // 80% of canvas height

// ---- WALL_THICKNESS linh hoạt
let WALL_THICKNESS = Math.max(40, Math.floor(canvas.height * 0.05));

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Xóa tất cả vật thể cũ
    Matter.World.clear(world, false);
    createWalls();
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const DICE_TYPES = {// Dice types and their properties
  'D2':       { radius: 25, img: '/Suika-game_dengkai_ver1/img/idol1.png', next: 'D4' },
  'D4':       { radius: 30, img: '/Suika-game_dengkai_ver1/img/idol2.png', next: 'D6' },
  'D6':       { radius: 35, img: '/Suika-game_dengkai_ver1/img/idol3.png', next: 'D8' },
  'D8':       { radius: 40, img: '/Suika-game_dengkai_ver1/img/idol4.png', next: 'D10' },
  'D10':      { radius: 45, img: '/Suika-game_dengkai_ver1/img/idol5.png', next: 'D12' },
  'D12':      { radius: 50, img: '/Suika-game_dengkai_ver1/img/idol6.png', next: 'D16' },
  'D16':      { radius: 55, img: '/Suika-game_dengkai_ver1/img/idol7.png', next: 'D20' },
  'D20':      { radius: 60, img: '/Suika-game_dengkai_ver1/img/idol8.png', next: 'D100' },
  'D100':     { radius: 70, img: '/Suika-game_dengkai_ver1/img/idol9.png', next: 'D256' },
  'D256':     { radius: 80, img: '/Suika-game_dengkai_ver1/img/idol10.png', next: 'D1000' },
  'D1000':    { radius: 90, img: '/Suika-game_dengkai_ver1/img/idol11.png', next: 'DULTIMATE' },
  'DULTIMATE':{ radius: 100, img: '/Suika-game_dengkai_ver1/img/idol12.png', next: null }
};

// Game state
let engine = null;
let render = null;
let world = null;
let currentDice = null;
let nextDiceType = 'D2';
let score = 0;
let gameActive = true;
let isInitialized = false;

// Initialize the game
function init() {
    console.log('Initializing game...');
    // Clean up everything first
    cleanup();
    
    // Create fresh engine and world
    engine = Engine.create();
    world = engine.world;
    world.gravity.y = 1;
    
    // Set initial random dice type
    nextDiceType = getRandomDiceType();
    
    console.log('Game state after init:', {
        nextDiceType,
        gameActive,
        score
    });

    // Create renderer
    render = Render.create({
        canvas: document.getElementById('gameCanvas'),
        engine: engine,
        options: {
            width: canvas.width,
            height: canvas.height,
            wireframes: false,
            background: '#34495e'
        }
    });

    // Create walls
    function getWallThickness() {
    return Math.max(30, canvas.width * 0.02);
    }
    createWalls();
    Events.on(engine, 'collisionStart', handleCollision);
    requestAnimationFrame(gameLoop);
}
  
function createWalls() {
    const WALL_THICKNESS = getWallThickness();
    const GAME_OVER_LINE_Y = canvas.height * 0.2; // ví dụ: 20% chiều cao

    const walls = [
        // Tường dưới
        Matter.Bodies.rectangle(canvas.width / 2, canvas.height + WALL_THICKNESS / 2, canvas.width, WALL_THICKNESS, {
            isStatic: true
        }),
        // Tường trái
        Matter.Bodies.rectangle(-WALL_THICKNESS / 2, canvas.height / 2, WALL_THICKNESS, canvas.height, {
            isStatic: true
        }),
        // Tường phải
        Matter.Bodies.rectangle(canvas.width + WALL_THICKNESS / 2, canvas.height / 2, WALL_THICKNESS, canvas.height, {
            isStatic: true
        }),
        // Đường giới hạn Game Over
        Matter.Bodies.rectangle(canvas.width / 2, GAME_OVER_LINE_Y, canvas.width - WALL_THICKNESS * 2, 4, {
            isStatic: true,
            isSensor: true,
            render: {
                fillStyle: '#c0392b',
                opacity: 0.8
            },
            label: 'gameOverLine'
        })
    ];

    Matter.World.add(world, walls);
}


function createDice(x, y, type, isPreview = false) {
    console.log('Creating dice:', { x, y, type, isPreview });
    const diceProps = DICE_TYPES[type];
    if (!diceProps) {
        console.error('Invalid dice type:', type);
        return null;
    }

    const dice = Bodies.circle(x, y, diceProps.radius, {
        label: type,
        isStatic: isPreview,
        render: {
            sprite: {
                texture: diceProps.img,
                xScale: 0.2,
                yScale: 0.2
            }
        },
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.001,
        angularDamping: 0.05,
        angle: Math.random() * Math.PI * 2,
        collisionFilter: {
            group: isPreview ? -1 : 0,
            category: isPreview ? 0x0002 : 0x0001,
            mask: isPreview ? 0x0000 : 0x0001
        },
        isSensor: isPreview
    });

    return dice;
}
// Event handler functions
function handleMouseMove(e) {
    if (currentDice && gameActive) {
        const rect = render.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const currentType = currentDice.label;
        Body.setPosition(currentDice, {
            x: Math.min(Math.max(x, DICE_TYPES[currentType].radius), 
                canvas.width - DICE_TYPES[currentType].radius),
            y: 50
        });
    }
}

function handleClick(e) {
    // Only handle clicks if they're on the canvas
    const canvas = document.getElementById('gameCanvas');
    if (e.target !== canvas) return;

    console.log('Canvas clicked, current state:', {
        hasCurrentDice: !!currentDice,
        currentDiceType: currentDice ? currentDice.label : null,
        gameActive,
        nextDiceType
    });

    if (currentDice && gameActive) {
        console.log('Dropping dice:', currentDice.label);
        // Remove the preview dice
        World.remove(world, currentDice);
        
        // Create a new physical dice at the same position
        const pos = currentDice.position;
        const newDice = createDice(pos.x, pos.y, currentDice.label, false);
        
        // Add random angular velocity when dropping
        const randomAngularVelocity = (Math.random() - 0.5) * 0.2;
        Body.setAngularVelocity(newDice, randomAngularVelocity);
        World.add(world, newDice);
        
        lastDropTime = Date.now(); // Record the drop time
        currentDice = null;
        createNextDice();
    }
}



function handleCollision(event) {
    // Create a Set to track processed bodies in this collision step
    const processedBodies = new Set();
    
    event.pairs.forEach((pair) => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        // Skip if either body has already been processed
        if (processedBodies.has(bodyA.id) || processedBodies.has(bodyB.id)) {
            return;
        }
        
        console.log('Collision detected:', {
            bodyAType: bodyA.label,
            bodyBType: bodyB.label,
            currentDiceType: currentDice ? currentDice.label : null,
            nextDiceType
        });
        
        if (bodyA.label === bodyB.label) {
            const type = bodyA.label;
            const nextType = DICE_TYPES[type].next;
            
            if (nextType) {
                console.log('Merging dice:', { type, nextType });
                // Mark both bodies as processed
                processedBodies.add(bodyA.id);
                processedBodies.add(bodyB.id);
                
                const position = {
                    x: (bodyA.position.x + bodyB.position.x) / 2,
                    y: (bodyA.position.y + bodyB.position.y) / 2
                };
                
                // Remove the old dice first
                World.remove(world, [bodyA, bodyB]);
                
                // Create and add the new dice
                const newDice = createDice(position.x, position.y, nextType);
                World.add(world, newDice);
                
                score += 10;
                document.getElementById('score').textContent = score;
                console.log('Dice merged, new score:', score);
            }
        }
    });
}

// Array of initial dice types to randomly choose from
const INITIAL_DICE = ['D2', 'D4', 'D6', 'D8'];

function getRandomDiceType() {
    const randomIndex = Math.floor(Math.random() * INITIAL_DICE.length);
    return INITIAL_DICE[randomIndex];
}

function createNextDice() {
    // Select a random dice type for the next dice
    nextDiceType = getRandomDiceType();
    
    console.log('Creating next dice with type:', nextDiceType);
    console.log('Current game state:', { 
        gameActive, 
        currentDice: currentDice ? currentDice.label : null,
        score,
        nextDiceType
    });
    
    const dice = createDice(canvas.width/2, 50, nextDiceType, true); // Mark as preview
    if (dice) {
        dice.isStatic = true;
        currentDice = dice;
        World.add(world, dice);
        updateNextDiceDisplay();
        console.log('New dice created:', dice.label);
    }
}

function updateNextDiceDisplay() {
    const nextDiceElement = document.getElementById('next-dice');
    if (nextDiceElement) {
        nextDiceElement.textContent = nextDiceType;
    }
}

// Track time since dice was last dropped
let lastDropTime = 0;

function gameLoop() {
    if (!gameActive) return;

    if (!currentDice) {
        createNextDice();
    }

    // Check for game over condition
    const bodies = Matter.Composite.allBodies(world);
    const currentTime = Date.now();

    for (let body of bodies) {
        // Skip walls, game over line, and current falling dice
        if (body.isStatic || body === currentDice || body.label === 'gameOverLine') continue;

        // Only check for game over if enough time has passed since last drop
        if (currentTime - lastDropTime > 1000) {
            // Check if the dice has settled (very low velocity)
            const isSettled = Math.abs(body.velocity.y) < 0.1 && Math.abs(body.velocity.x) < 0.1;
            
            // If a settled dice crosses the game over line
            if (isSettled && body.bounds.min.y <= GAME_OVER_LINE_Y) {
                gameActive = false;
                alert('Game Over! Score: ' + score);
                return;
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

function cleanup() {
    // Remove all event listeners
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('click', handleClick);
    if (engine) {
        Events.off(engine);
    }

    // Cleanup engine and world
    if (engine) {
        World.clear(world);
        Engine.clear(engine);
    }

    // Cleanup renderer
    if (render) {
        Render.stop(render);
    }

    // Reset game state
    currentDice = null;
}

function resetGame() {
    console.log('Resetting game...');
    gameActive = true;
    score = 0;
    document.getElementById('score').textContent = '0';
    cleanup();
    init(); // This will set a random nextDiceType
    console.log('Game reset complete');
}

// Start the game when the page loads
window.addEventListener('load', () => {
    if (!isInitialized) {
        init();
        const resetButton = document.getElementById('resetButton');
        if (resetButton) {
            // Prevent reset button click from propagating to canvas
            resetButton.addEventListener('click', (e) => {
                e.stopPropagation();
                resetGame();
            });
        }
        isInitialized = true;
    }
});
