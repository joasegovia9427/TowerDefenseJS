import { PATH_POINTS } from './Constants.js';

export class Enemy extends Phaser.GameObjects.Arc {
    constructor(scene, type = 'NORMAL') {
        super(scene, PATH_POINTS[0].x, PATH_POINTS[0].y, 10, 0, 360, false, 0xff0000);
        
        this.scene = scene;
        this.type = type;
        this.pathIndex = 0;
        this.reachedEnd = false;
        
        // Stats based on type
        this.stats = this.getStats(type);
        this.hp = this.stats.hp;
        this.maxHp = this.stats.hp;
        this.speed = this.stats.speed;
        
        // Visuals
        this.setFillStyle(this.stats.color);
        this.setRadius(this.stats.radius);
        
        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    getStats(type) {
        switch(type) {
            case 'FAST': return { hp: 50, speed: 200, color: 0xffff00, radius: 8 };
            case 'TANK': return { hp: 300, speed: 50, color: 0x0000ff, radius: 15 };
            case 'SHIFTER': return { hp: 80, speed: 120, color: 0x9b59b6, radius: 10 }; // Purple
            case 'HEALER': return { hp: 150, speed: 80, color: 0x2ecc71, radius: 12 }; // Green
            case 'NORMAL': default: return { hp: 100, speed: 100, color: 0xff0000, radius: 10 };
        }
    }

    update(time, delta) {
        if (this.reachedEnd) return;

        // Special Ability Logic
        if (this.type === 'SHIFTER') {
            // Toggle visibility every 2 seconds
            const cycle = time % 4000;
            this.setVisible(cycle < 2000);
            this.alpha = this.visible ? 1 : 0.3; // Semi-transparent for player to see, but logic will check visible
        } else if (this.type === 'HEALER') {
            // Heal nearby enemies every 1 second
            if (!this.lastHeal || time - this.lastHeal > 1000) {
                this.healNearby();
                this.lastHeal = time;
            }
        }

        const target = PATH_POINTS[this.pathIndex + 1];
        if (!target) {
            this.reachedEnd = true;
            this.destroy();
            this.scene.economy.loseLife();
            return;
        }

        const dist = Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y);
        
        if (dist < 5) {
            this.pathIndex++;
        } else {
            const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y);
            const velocity = this.scene.physics.velocityFromRotation(angle, this.speed);
            this.body.setVelocity(velocity.x, velocity.y);
        }
    }

    healNearby() {
        const range = 100;
        const healAmount = 20;
        
        this.scene.enemies.getChildren().forEach(enemy => {
            if (enemy !== this && enemy.active && Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y) <= range) {
                enemy.heal(healAmount);
            }
        });
        
        // Visual effect
        const circle = this.scene.add.circle(this.x, this.y, range, 0x2ecc71, 0.2);
        this.scene.tweens.add({
            targets: circle,
            alpha: 0,
            scale: 1.2,
            duration: 500,
            onComplete: () => circle.destroy()
        });
    }

    heal(amount) {
        this.hp = Math.min(this.hp + amount, this.maxHp);
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.scene.economy.addMoney(10); // Reward
        this.destroy();
    }
}
