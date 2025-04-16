import { TIME_LIMIT, STAMINA_MAX } from '../config.js';

export class HUD {
    constructor(totalRewards, player) {
        this.totalRewards = totalRewards;
        this.rewardsCollected = 0;
        this.startTime = performance.now();
        this.player = player;
        this.timerElement = document.getElementById('timer');
        this.scoreElement = document.getElementById('score');
        this.isGameOverState = false;
    }

    update(currentTime) {
        if (this.isGameOver()) return;

        const elapsed = (currentTime - this.startTime) / 1000;
        const timeLeft = Math.max(0, TIME_LIMIT - elapsed);
        this.timerElement.textContent = `Time: ${Math.floor(timeLeft)}`;
        this.scoreElement.textContent = `Score: ${this.rewardsCollected}/${this.totalRewards}`;

        const staminaFill = document.getElementById('stamina-fill');
        if (staminaFill) {
            const staminaPercent = (this.player.getStamina() / STAMINA_MAX) * 100;
            staminaFill.style.width = `${staminaPercent}%`;
        }
    }

    collectReward() {
        this.rewardsCollected++;
        this.scoreElement.textContent = `Score: ${this.rewardsCollected}/${this.totalRewards}`;
    }

    drawGameOver(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.fillText(`Score: ${this.rewardsCollected}/${this.totalRewards}`, ctx.canvas.width / 2, ctx.canvas.height / 2 + 40);
    }

    isGameOver() {
        if (this.isGameOverState) return true;
        const elapsed = (performance.now() - this.startTime) / 1000;
        if (elapsed >= TIME_LIMIT || this.rewardsCollected >= this.totalRewards) {
            this.isGameOverState = true;
            return true;
        }
        return false;
    }
}