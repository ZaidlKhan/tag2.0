export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 3;
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
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

        if (!this.collides(newX, this.y, walls)) this.x = newX;
        if (!this.collides(this.x, newY, walls)) this.y = newY;
    }

    collides(x, y, walls) {
        const playerRect = { x, y, width: this.radius, height: this.radius };
        return walls.some(wall =>
            playerRect.x < wall.x + wall.width &&
            playerRect.x + playerRect.width > wall.x &&
            playerRect.y < wall.y + wall.height &&
            playerRect.y + playerRect.height > wall.y
        );
    }

    handleKeyPressed(e) {
        switch (e.key) {
            case 'ArrowUp': this.dy = -this.speed; break;
            case 'ArrowDown': this.dy = this.speed; break;
            case 'ArrowLeft': this.dx = -this.speed; break;
            case 'ArrowRight': this.dx = this.speed; break;
        }
    }

    handleKeyReleased(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown': this.dy = 0; break;
            case 'ArrowLeft':
            case 'ArrowRight': this.dx = 0; break;
        }
    }
}