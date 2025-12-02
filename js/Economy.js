import { CONFIG } from './Constants.js';

export class Economy {
    constructor(scene) {
        this.scene = scene;
        this.money = CONFIG.startMoney;
        this.lives = CONFIG.startLives;
        
        this.interestTimer = 0;
        
        // UI Elements
        this.createUI();
    }

    createUI() {
        const style = { fontSize: '20px', fill: '#fff', fontFamily: 'Arial', backgroundColor: '#34495e', padding: { x: 10, y: 5 } };
        
        this.moneyText = this.scene.add.text(20, 20, `Money: $${this.money}`, style);
        this.livesText = this.scene.add.text(20, 50, `Lives: ${this.lives}`, style);
        
        // Interest Indicator
        this.interestText = this.scene.add.text(20, 80, 'Next Interest: 15s', { ...style, fontSize: '16px', fill: '#aaa', backgroundColor: '#34495e', padding: { x: 10, y: 5 }});
    }

    update(time, delta) {
        this.interestTimer += delta;
        
        const remainingTime = Math.max(0, (CONFIG.interestInterval - this.interestTimer) / 1000).toFixed(1);
        this.interestText.setText(`Next Interest: ${remainingTime}s`);

        if (this.interestTimer >= CONFIG.interestInterval) {
            this.applyInterest();
            this.interestTimer = 0;
        }
    }

    applyInterest() {
        const interest = Math.floor(this.money * CONFIG.interestRate);
        if (interest > 0) {
            this.addMoney(interest);
            this.showFloatingText(`+${interest} Interest`, 0xffff00);
        }
    }

    addMoney(amount) {
        this.money += amount;
        this.moneyText.setText(`Money: $${this.money}`);
    }

    spendMoney(amount) {
        if (this.money >= amount) {
            this.money -= amount;
            this.moneyText.setText(`Money: $${this.money}`);
            return true;
        }
        return false;
    }

    loseLife(amount = 1) {
        this.lives -= amount;
        this.livesText.setText(`Lives: ${this.lives}`);
        if (this.lives <= 0) {
            this.scene.gameOver();
        }
    }

    showFloatingText(text, color) {
        const floatText = this.scene.add.text(200, 50, text, {
            fontSize: '24px',
            fill: '#fff',
            stroke: '#000',
            strokeThickness: 4
        });
        floatText.setTint(color);
        
        this.scene.tweens.add({
            targets: floatText,
            y: 0,
            alpha: 0,
            duration: 2000,
            onComplete: () => floatText.destroy()
        });
    }
}
