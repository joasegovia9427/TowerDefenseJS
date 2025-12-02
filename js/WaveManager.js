export class WaveManager {
    constructor(scene) {
        this.scene = scene;
        this.currentWave = 0;
        this.isWaveActive = false;
        this.enemiesToSpawn = 0;
        
        this.waves = [
            { count: 5, type: 'NORMAL', interval: 1500 },
            { count: 8, type: 'FAST', interval: 1000 },
            { count: 4, type: 'TANK', interval: 2000 },
            { count: 10, type: 'SHIFTER', interval: 1200 },
            { count: 5, type: 'HEALER', interval: 2000 },
            { count: 15, type: 'NORMAL', interval: 800 },
        ];

        this.waveText = scene.add.text(20, 100, 'Wave: 0', { fontSize: '20px', fill: '#fff', backgroundColor: '#34495e', padding: { x: 10, y: 5 } });
        
        // Start Wave Button
        this.startBtnContainer = scene.add.container(140, 150);
        
        const btnBg = scene.add.rectangle(0, 0, 240, 40, 0x27ae60)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.tryStartWave());
            
        this.startBtnText = scene.add.text(0, 0, 'Start Wave (SPACE)', { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        
        this.startBtnContainer.add([btnBg, this.startBtnText]);
        this.nextWaveText = this.startBtnText; // Alias for compatibility with existing code
        
        // Input to start wave
        scene.input.keyboard.on('keydown-SPACE', () => {
            this.tryStartWave();
        });
    }

    tryStartWave() {
        console.log("Attempting to start wave. Active:", this.isWaveActive);
        if (!this.isWaveActive) {
            this.startNextWave();
        }
    }

    startNextWave() {
        if (this.currentWave >= this.waves.length) {
            this.nextWaveText.setText("VICTORY!");
            this.nextWaveText.setVisible(true);
            return;
        }

        this.isWaveActive = true;
        this.currentWave++;
        this.waveText.setText(`Wave: ${this.currentWave}`);
        this.startBtnContainer.setVisible(false);

        const waveData = this.waves[this.currentWave - 1];
        this.enemiesToSpawn = waveData.count;

        this.scene.time.addEvent({
            delay: waveData.interval,
            repeat: waveData.count - 1,
            callback: () => {
                this.scene.spawnEnemy(waveData.type);
                this.enemiesToSpawn--;
            }
        });
    }

    update() {
        if (this.isWaveActive) {
            if (this.enemiesToSpawn === 0 && this.scene.enemies.getLength() === 0) {
                this.endWave();
            }
        }
    }

    endWave() {
        this.isWaveActive = false;
        this.startBtnText.setText('Wave Complete! Start Next');
        this.startBtnContainer.setVisible(true);
    }
}
