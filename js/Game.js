import { CONFIG } from './Constants.js';
import { Map } from './Map.js';
import { Economy } from './Economy.js';
import { Enemy } from './Enemy.js';
import { Tower } from './Tower.js';
import { WaveManager } from './WaveManager.js';
import { BuildMenu } from './BuildMenu.js';

export class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    preload() {
        // Load assets here
        this.load.image('tower', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        this.load.image('grass', 'assets/grass.png');
    }

    create() {
        // Add background
        this.add.tileSprite(0, 0, CONFIG.width, CONFIG.height, 'grass').setOrigin(0, 0);

        this.map = new Map(this);
        this.economy = new Economy(this);
        
        this.enemies = this.add.group({ runChildUpdate: true });
        this.towers = this.add.group({ runChildUpdate: true });
        this.projectiles = this.add.group({ runChildUpdate: true });

        this.waveManager = new WaveManager(this);
        this.buildMenu = new BuildMenu(this);

        this.input.on('pointerdown', this.onMapClick, this);
    }

    update(time, delta) {
        this.economy.update(time, delta);
        this.waveManager.update();
        
        this.towers.children.entries.forEach(tower => {
            tower.update(time, delta);
        });
    }

    spawnEnemy(type) {
        const enemy = new Enemy(this, type);
        this.enemies.add(enemy);
    }

    onMapClick(pointer) {
        console.log(`Click at ${pointer.x}, ${pointer.y}`);
        
        // Ignore clicks on the menu area
        if (pointer.y > 650) {
            console.log("Click ignored: Menu area");
            return;
        }

        if (this.map.isOnPath(pointer.x, pointer.y)) {
            console.log("Click ignored: On path");
            return;
        }
        
        const type = this.buildMenu.getSelectedType();
        console.log(`Selected tower type: ${type}`);
        
        // Check cost
        const tempTower = new Tower(this, -100, -100, type);
        const cost = tempTower.stats.cost;
        tempTower.destroy();
        
        console.log(`Tower cost: ${cost}, Current Money: ${this.economy.money}`);

        if (this.economy.spendMoney(cost)) {
            const tower = new Tower(this, pointer.x, pointer.y, type);
            this.towers.add(tower);
            console.log("Tower placed");
        } else {
            this.economy.showFloatingText('Not enough money!', 0xff0000);
            console.log("Not enough money");
        }
    }

    gameOver() {
        this.scene.pause();
        this.add.text(CONFIG.width / 2, CONFIG.height / 2, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000'
        }).setOrigin(0.5);
    }
}

const config = {
    type: Phaser.AUTO,
    width: CONFIG.width,
    height: CONFIG.height,
    parent: 'game-container',
    backgroundColor: CONFIG.backgroundColor,
    scene: GameScene,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    }
};

export const game = new Phaser.Game(config);
