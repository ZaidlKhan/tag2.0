import { PLAYER_RADIUS, PLAYER_SPEED } from '../config.js';
import { collides } from './utils/utils.js';

export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = PLAYER_RADIUS;
        this.speed = PLAYER_SPEED;
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.isBoosting = false;
    }

    draw(ctx) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(this.x + this.radius / 2, this.y + this.radius / 2, this.radius / 2, 0, Math.PI * 2);
        ctx.fill();
    }

    move(walls) {
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
        switch (e.key) {
            case 'ArrowUp': this.dy = -this.speed; break;
            case 'ArrowDown': this.dy = this.speed; break;
            case 'ArrowLeft': this.dx = -this.speed; break;
            case 'ArrowRight': this.dx = this.speed; break;
            case ' ':
                if (!this.isBoosting) {
                    this.speed += 1;
                    this.isBoosting = true;
                }
                break;
        }
    }

    handleKeyReleased(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown': this.dy = 0; break;
            case 'ArrowLeft':
            case 'ArrowRight': this.dx = 0; break;
            case ' ':
                if (this.isBoosting) {
                    this.speed -= 1;
                    this.isBoosting = false;
                }
                break;
        }
    }
}