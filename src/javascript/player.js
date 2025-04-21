import { PLAYER_RADIUS, PLAYER_SPEED, STAMINA_MAX, STAMINA_DEPLETION_RATE, STAMINA_REFILL_RATE, STAMINA_REFILL_DELAY, STAMINA_PENALTY_DURATION } from '../config.js';
import { collides } from './utils/utils.js';

export class Player {
    constructor(x, y, role) {
        this.x = x;
        this.y = y;
        this.radius = PLAYER_RADIUS;
        this.speed = PLAYER_SPEED;
        this.baseSpeed = PLAYER_SPEED;
        this.boostSpeed = PLAYER_SPEED + 1;
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.isBoosting = false;
        this.stamina = STAMINA_MAX;
        this.lastBoostTime = 0;
        this.penaltyTime = 0;
        this.role = role;
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            ' ': false
        };
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x + this.radius / 2, this.y + this.radius / 2, this.radius / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    update(delta) {
        const currentTime = performance.now() / 1000;

        // Check if in penalty period
        const inPenalty = this.penaltyTime > 0 && (currentTime - this.penaltyTime) < STAMINA_PENALTY_DURATION;

        // Update stamina
        if (this.isBoosting && this.stamina > 0 && !inPenalty) {
            this.stamina = Math.max(0, this.stamina - STAMINA_DEPLETION_RATE * delta);
            if (this.stamina === 0) {
                this.isBoosting = false;
                this.keys[' '] = false;
                this.penaltyTime = currentTime;
                this.lastBoostTime = currentTime;
            }
        } else if (!this.isBoosting && !inPenalty) {
            if (currentTime - this.lastBoostTime >= STAMINA_REFILL_DELAY) {
                this.stamina = Math.min(STAMINA_MAX, this.stamina + STAMINA_REFILL_RATE * delta);
            }
        }

        // Update speed
        this.speed = this.isBoosting ? this.boostSpeed : this.baseSpeed;
    }

    move(walls) {
        this.dx = 0;
        this.dy = 0;
        if (this.keys.ArrowLeft) this.dx = -this.speed;
        else if (this.keys.ArrowRight) this.dx = this.speed;
        if (this.keys.ArrowUp) this.dy = -this.speed;
        else if (this.keys.ArrowDown) this.dy = this.speed;

        let newX = this.x + this.dx;
        let newY = this.y + this.dy;

        const xRect = { x: newX, y: this.y, width: this.radius, height: this.radius };
        if (!collides(xRect, walls)) {
            this.x = newX;
        }

        const yRect = { x: this.x, y: newY, width: this.radius, height: this.radius };
        if (!collides(yRect, walls)) {
            this.y = newY;
        }
    }

    handleKeyPressed(e) {
        if (e.key in this.keys) {
            this.keys[e.key] = true;
            if (e.key === ' ' && !this.isBoosting && this.stamina > 0) {
                const currentTime = performance.now() / 1000;
                if (this.penaltyTime === 0 || (currentTime - this.penaltyTime) >= STAMINA_PENALTY_DURATION) {
                    this.isBoosting = true;
                }
            }
        }
    }

    handleKeyReleased(e) {
        if (e.key in this.keys) {
            this.keys[e.key] = false;
            if (e.key === ' ' && this.isBoosting) {
                this.isBoosting = false;
                this.lastBoostTime = performance.now() / 1000;
            }
        }
    }

    getStamina() {
        return this.stamina;
    }

    getRole() {
        return this.role;
    }
}