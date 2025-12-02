import { Enemy } from './Enemy.js';

export class Tower extends Phaser.GameObjects.Container {
    constructor(scene, x, y, type = 'BASIC') {
        super(scene, x, y);
        this.scene = scene;
        this.type = type;
        
        this.stats = this.getStats(type);
        this.lastFired = 0;
        
        // Visuals
        const base = scene.add.rectangle(0, 0, 40, 40, this.stats.color);
        this.add(base);
        
        // Range indicator (hidden by default)
        this.rangeCircle = scene.add.circle(0, 0, this.stats.range, 0xffffff, 0.1);
        this.rangeCircle.setVisible(false);
        this.add(this.rangeCircle);

        this.setSize(40, 40);
        scene.add.existing(this);
    }

    getStats(type) {
        switch(type) {
            case 'SNIPER': return { range: 400, damage: 150, fireRate: 2500, color: 0xe74c3c, cost: 200, name: 'Sniper' };
            case 'CHAIN': return { range: 180, damage: 40, fireRate: 1200, color: 0xf1c40f, cost: 175, name: 'Chain' };
            case 'SPLASH': return { range: 150, damage: 60, fireRate: 1500, color: 0xe67e22, cost: 150, name: 'Splash' };
            case 'SLOW': return { range: 150, damage: 10, fireRate: 1000, color: 0x3498db, cost: 125, name: 'Slow' };
            case 'BASIC': default: return { range: 150, damage: 30, fireRate: 800, color: 0x95a5a6, cost: 50, name: 'Basic' };
        }
    }

    update(time, delta) {
        if (time - this.lastFired > this.stats.fireRate) {
            const target = this.findTarget();
            if (target) {
                this.fire(target);
                this.lastFired = time;
            }
        }
    }

    findTarget() {
        let closest = null;
        let minDist = this.stats.range;

        const enemies = this.scene.enemies.getChildren();
        
        for (const enemy of enemies) {
            // Skip invisible enemies unless this is a Sniper
            if (!enemy.visible && this.type !== 'SNIPER') continue;

            const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
            if (dist <= this.stats.range && dist < minDist) {
                closest = enemy;
                minDist = dist;
            }
        }
        return closest;
    }

    fire(target) {
        // Visual beam
        const graphics = this.scene.add.graphics();
        graphics.lineStyle(this.type === 'SNIPER' ? 4 : 2, this.stats.color, 1);
        graphics.lineBetween(this.x, this.y, target.x, target.y);
        
        this.scene.tweens.add({
            targets: graphics,
            alpha: 0,
            duration: 200,
            onComplete: () => graphics.destroy()
        });

        // Apply Damage/Effect
        if (this.type === 'SPLASH') {
            this.applySplashDamage(target);
        } else if (this.type === 'CHAIN') {
            this.applyChainDamage(target, 3); // Chain to 3 targets
        } else if (this.type === 'SLOW') {
            this.applySlowEffect(target);
            target.takeDamage(this.stats.damage);
        } else {
            target.takeDamage(this.stats.damage);
        }
    }

    applySplashDamage(centerTarget) {
        const radius = 80;
        this.scene.enemies.getChildren().forEach(enemy => {
            if (enemy.active && Phaser.Math.Distance.Between(centerTarget.x, centerTarget.y, enemy.x, enemy.y) <= radius) {
                enemy.takeDamage(this.stats.damage);
            }
        });
        
        // Visual
        const circle = this.scene.add.circle(centerTarget.x, centerTarget.y, radius, this.stats.color, 0.4);
        this.scene.tweens.add({
            targets: circle,
            alpha: 0,
            scale: 0.5,
            duration: 300,
            onComplete: () => circle.destroy()
        });
    }

    applyChainDamage(target, bounces) {
        if (bounces <= 0 || !target || !target.active) return;

        target.takeDamage(this.stats.damage);

        // Find next closest enemy
        let nextTarget = null;
        let minDist = 150; // Chain range

        this.scene.enemies.getChildren().forEach(enemy => {
            if (enemy !== target && enemy.active) {
                const dist = Phaser.Math.Distance.Between(target.x, target.y, enemy.x, enemy.y);
                if (dist < minDist) {
                    minDist = dist;
                    nextTarget = enemy;
                }
            }
        });

        if (nextTarget) {
            // Visual chain
            const graphics = this.scene.add.graphics();
            graphics.lineStyle(2, this.stats.color, 0.8);
            graphics.lineBetween(target.x, target.y, nextTarget.x, nextTarget.y);
            this.scene.tweens.add({
                targets: graphics,
                alpha: 0,
                duration: 150,
                onComplete: () => graphics.destroy()
            });

            // Recursive call with delay
            this.scene.time.delayedCall(100, () => {
                this.applyChainDamage(nextTarget, bounces - 1);
            });
        }
    }

    applySlowEffect(target) {
        if (target.isSlowed) return;
        
        const originalSpeed = target.speed;
        target.speed *= 0.5;
        target.isSlowed = true;
        target.setTint(0x3498db); // Blue tint

        this.scene.time.delayedCall(2000, () => {
            if (target.active) {
                target.speed = originalSpeed;
                target.isSlowed = false;
                target.clearTint();
            }
        });
    }
}
