export class HUD {
    constructor(totalRewards) {
        this.totalRewards = totalRewards;
        this.rewardsCollected = 0;
        this.timeLimit = 60;
        this.timeLeft = this.timeLimit;
        this.lastTimestamp = performance.now();
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.updateDisplay();
    }

    update(timestamp) {
        if (!timestamp) timestamp = performance.now();
        if (this.lastTimestamp) {
            const delta = (timestamp - this.lastTimestamp) / 1000;
            this.timeLeft = Math.max(0, this.timeLeft - delta);
        }
        this.lastTimestamp = timestamp;
        this.updateDisplay();
    }

    collectReward() {
        this.rewardsCollected++;
        this.updateDisplay();
    }

    isGameOver() {
        return this.timeLeft <= 0 || this.rewardsCollected >= this.totalRewards;
    }

    getGameOverMessage() {
        return this.timeLeft <= 0 ? 'Time’s Up!' : 'All Rewards Collected!';
    }

    updateDisplay() {
        this.scoreElement.textContent = `${this.rewardsCollected}/${this.totalRewards}`;
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = Math.floor(this.timeLeft % 60);
        this.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    drawGameOver(ctx) {
        ctx.save();
        ctx.font = '40px Arial';
        ctx.fillStyle = 'red';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.getGameOverMessage(), ctx.canvas.width / 2, ctx.canvas.height / 2);
        ctx.restore();
    }
}