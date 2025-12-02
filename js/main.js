// Main game configuration
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 768,
    parent: 'game-container',
    backgroundColor: '#2c3e50',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

// Initialize the game
const game = new Phaser.Game(config);

// Game variables
let pathGraphics;
let enemies;
let towers;
let projectiles;
let pathPoints = [];
let selectedTower = null;

// Preload assets
function preload() {
    // For now, we'll use simple shapes
    // Later you can add sprite images here
    this.load.image('tower', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
}

// Create game scene
function create() {
    // Create path for enemies to follow
    createPath();
    
    // Initialize groups
    enemies = this.add.group();
    towers = this.add.group();
    projectiles = this.add.group();
    
    // Create UI
    createUI(this);
    
    // Add click listener for tower placement
    this.input.on('pointerdown', placeTower, this);
    
    // Start spawning enemies (for testing)
    this.time.addEvent({
        delay: 2000,
        callback: spawnEnemy,
        callbackScope: this,
        loop: true
    });
}

// Create the path enemies will follow
function createPath() {
    // Define path points (you can customize this)
    pathPoints = [
        { x: 0, y: 384 },
        { x: 200, y: 384 },
        { x: 200, y: 200 },
        { x: 600, y: 200 },
        { x: 600, y: 500 },
        { x: 900, y: 500 },
        { x: 900, y: 150 },
        { x: 1024, y: 150 }
    ];
    
    // Draw the path
    pathGraphics = game.scene.scenes[0].add.graphics();
    pathGraphics.lineStyle(60, 0x8B4513, 0.5); // Brown path
    pathGraphics.beginPath();
    pathGraphics.moveTo(pathPoints[0].x, pathPoints[0].y);
    
    for (let i = 1; i < pathPoints.length; i++) {
        pathGraphics.lineTo(pathPoints[i].x, pathPoints[i].y);
    }
    
    pathGraphics.strokePath();
}

// Create UI elements
function createUI(scene) {
    // Game info text
    scene.add.text(10, 10, 'Tower Defense JS', {
        fontSize: '24px',
        fill: '#fff',
        fontFamily: 'Arial',
        backgroundColor: '#34495e',
    });
    
    // Money display
    scene.moneyText = scene.add.text(10, 50, 'Money: $500', {
        fontSize: '18px',
        fill: '#fff',
        backgroundColor: '#34495e',
    });
    
    // Lives display
    scene.livesText = scene.add.text(10, 80, 'Lives: 20', {
        fontSize: '18px',
        fill: '#fff'
    });
    
    // Wave display
    scene.waveText = scene.add.text(10, 110, 'Wave: 1', {
        fontSize: '18px',
        fill: '#fff'
    });
    
    // Tower selection buttons
    const buttonY = 150;
    const buttonStyle = {
        fontSize: '14px',
        fill: '#fff',
        backgroundColor: '#34495e',
        padding: { x: 10, y: 5 }
    };
    
    scene.add.text(10, buttonY, 'Click to place tower', {
        fontSize: '14px',
        fill: '#ecf0f1'
    });
}

// Spawn an enemy
function spawnEnemy() {
    const scene = game.scene.scenes[0];
    
    // Create a simple enemy (red circle for now)
    const enemy = scene.add.circle(pathPoints[0].x, pathPoints[0].y, 15, 0xff0000);
    enemy.pathIndex = 0;
    enemy.speed = 100; // pixels per second
    enemy.health = 100;
    enemy.maxHealth = 100;
    enemy.reachedEnd = false;
    
    // Add to enemies group
    enemies.add(enemy);
}

// Place a tower
function placeTower(pointer) {
    // Don't place towers on UI area or path
    if (pointer.y < 200 || isOnPath(pointer.x, pointer.y)) {
        return;
    }
    
    const scene = game.scene.scenes[0];
    
    // Create a simple tower (blue square for now)
    const tower = scene.add.rectangle(pointer.x, pointer.y, 40, 40, 0x3498db);
    tower.range = 150;
    tower.damage = 25;
    tower.fireRate = 1000; // milliseconds
    tower.lastFired = 0;
    tower.target = null;
    
    // Draw range circle (for debugging)
    const rangeCircle = scene.add.circle(pointer.x, pointer.y, tower.range, 0x3498db, 0.1);
    tower.rangeCircle = rangeCircle;
    
    towers.add(tower);
}

// Check if a point is on the path
function isOnPath(x, y) {
    const pathWidth = 60;
    for (let i = 0; i < pathPoints.length - 1; i++) {
        const p1 = pathPoints[i];
        const p2 = pathPoints[i + 1];
        
        // Simple distance check (can be improved)
        const dist = distanceToLineSegment(x, y, p1.x, p1.y, p2.x, p2.y);
        if (dist < pathWidth / 2) {
            return true;
        }
    }
    return false;
}

// Calculate distance to line segment
function distanceToLineSegment(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq != 0) param = dot / lenSq;
    
    let xx, yy;
    
    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    return Math.sqrt(dx * dx + dy * dy);
}

// Update game loop
function update(time, delta) {
    // Update enemies
    enemies.children.entries.forEach(enemy => {
        if (enemy.reachedEnd) return;
        
        updateEnemy(enemy, delta);
    });
    
    // Update towers
    towers.children.entries.forEach(tower => {
        updateTower(tower, time);
    });
    
    // Update projectiles
    projectiles.children.entries.forEach(projectile => {
        updateProjectile(projectile, delta);
    });
}

// Update enemy movement along path
function updateEnemy(enemy, delta) {
    if (enemy.pathIndex >= pathPoints.length - 1) {
        // Enemy reached the end
        enemy.reachedEnd = true;
        enemy.destroy();
        // TODO: Decrease lives
        return;
    }
    
    const currentPoint = pathPoints[enemy.pathIndex];
    const nextPoint = pathPoints[enemy.pathIndex + 1];
    
    const dx = nextPoint.x - enemy.x;
    const dy = nextPoint.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 5) {
        // Reached the next point
        enemy.pathIndex++;
        if (enemy.pathIndex >= pathPoints.length - 1) {
            enemy.reachedEnd = true;
            enemy.destroy();
            return;
        }
    } else {
        // Move towards next point
        const moveDistance = (enemy.speed * delta) / 1000;
        const moveX = (dx / distance) * moveDistance;
        const moveY = (dy / distance) * moveDistance;
        
        enemy.x += moveX;
        enemy.y += moveY;
    }
    
    // Check if enemy is dead
    if (enemy.health <= 0) {
        enemy.destroy();
        // TODO: Add money reward
    }
}

// Update tower targeting and shooting
function updateTower(tower, time) {
    // Find target in range
    let closestEnemy = null;
    let closestDistance = tower.range;
    
    enemies.children.entries.forEach(enemy => {
        if (enemy.reachedEnd) return;
        
        const distance = Phaser.Math.Distance.Between(
            tower.x, tower.y,
            enemy.x, enemy.y
        );
        
        if (distance < closestDistance) {
            closestDistance = distance;
            closestEnemy = enemy;
        }
    });
    
    tower.target = closestEnemy;
    
    // Shoot at target
    if (tower.target && time - tower.lastFired > tower.fireRate) {
        shootProjectile(tower, tower.target);
        tower.lastFired = time;
    }
}

// Shoot a projectile
function shootProjectile(tower, target) {
    const scene = game.scene.scenes[0];
    
    const projectile = scene.add.circle(tower.x, tower.y, 5, 0xffff00);
    projectile.target = target;
    projectile.speed = 400;
    projectile.damage = tower.damage;
    projectile.tower = tower;
    
    projectiles.add(projectile);
}

// Update projectile movement
function updateProjectile(projectile, delta) {
    if (!projectile.target || projectile.target.reachedEnd) {
        projectile.destroy();
        return;
    }
    
    const dx = projectile.target.x - projectile.x;
    const dy = projectile.target.y - projectile.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) {
        // Hit target
        projectile.target.health -= projectile.damage;
        
        // Update health bar (simple visual)
        if (projectile.target.healthBar) {
            projectile.target.healthBar.destroy();
        }
        
        const healthPercent = projectile.target.health / projectile.target.maxHealth;
        const scene = game.scene.scenes[0];
        const barWidth = 30;
        const barHeight = 4;
        const healthBar = scene.add.rectangle(
            projectile.target.x,
            projectile.target.y - 25,
            barWidth * healthPercent,
            barHeight,
            healthPercent > 0.5 ? 0x00ff00 : healthPercent > 0.25 ? 0xffff00 : 0xff0000
        );
        projectile.target.healthBar = healthBar;
        
        projectile.destroy();
    } else {
        // Move towards target
        const moveDistance = (projectile.speed * delta) / 1000;
        const moveX = (dx / distance) * moveDistance;
        const moveY = (dy / distance) * moveDistance;
        
        projectile.x += moveX;
        projectile.y += moveY;
    }
}

