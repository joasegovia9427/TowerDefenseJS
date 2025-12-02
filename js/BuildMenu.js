import { Tower } from './Tower.js';

export class BuildMenu {
    constructor(scene) {
        this.scene = scene;
        this.selectedTowerType = 'BASIC';
        this.buttons = [];
        
        this.createMenu();
    }

    createMenu() {
        const types = ['BASIC', 'SNIPER', 'CHAIN', 'SPLASH', 'SLOW'];
        const startX = 150;
        const startY = 700;
        const padding = 120;

        types.forEach((type, index) => {
            const x = startX + (index * padding);
            const y = startY;
            
            // Get stats for preview
            const tempTower = new Tower(this.scene, -100, -100, type); // Hidden temp tower
            const stats = tempTower.stats;
            tempTower.destroy();

            const container = this.scene.add.container(x, y);
            
            // Button Background
            const bg = this.scene.add.rectangle(0, 0, 100, 60, 0x34495e)
                .setInteractive({ useHandCursor: true })
                .on('pointerdown', () => this.selectTower(type, bg));
            
            // Highlight if selected
            if (type === this.selectedTowerType) {
                bg.setStrokeStyle(2, 0xffff00);
            }

            // Text
            const text = this.scene.add.text(0, -10, stats.name, { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
            const costText = this.scene.add.text(0, 10, `$${stats.cost}`, { fontSize: '12px', fill: '#f1c40f' }).setOrigin(0.5);

            container.add([bg, text, costText]);
            this.buttons.push({ type, bg });
        });
        
        this.scene.add.text(20, 650, 'Select Tower:', { fontSize: '16px', fill: '#fff', backgroundColor: '#34495e', padding: { left: 10, right: 10 } });
    }

    selectTower(type, bg) {
        this.selectedTowerType = type;
        
        // Update visuals
        this.buttons.forEach(btn => {
            btn.bg.setStrokeStyle(0);
        });
        bg.setStrokeStyle(2, 0xffff00);
    }

    getSelectedType() {
        return this.selectedTowerType;
    }
}
