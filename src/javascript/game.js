const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const VISIBILITY_RADIUS = 75;

const maze = new Maze(canvas.width, canvas.height);
maze.makeMaze();
const walls = maze.getWalls();
const player = new Player(20, 20); 
document.addEventListener('keydown', (e) => {
    player.handleKeyPressed(e);
});

document.addEventListener('keyup', (e) => {
    player.handleKeyReleased(e);
});

function gameLoop() {
    player.move(walls);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawFogOfWar();
    walls.forEach(wall => {
        if (isWallVisible(wall, player)) {
            ctx.fillStyle = '#00FFFF';
            ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
        }
    });

    player.draw(ctx);
    requestAnimationFrame(gameLoop);
}

function drawFogOfWar() {
    ctx.save();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const centerX = player.x + player.radius / 2;
    const centerY = player.y + player.radius / 2;
    const numberOfRays = 90;
    const angleStep = 360 / numberOfRays;

    for (let i = 0; i < numberOfRays; i++) {
        const angle = i * angleStep * Math.PI / 180;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        let x = centerX;
        let y = centerY;
        let distance = 0;

        while (distance < VISIBILITY_RADIUS) {
            x = centerX + dx * distance;
            y = centerY + dy * distance;

            if (isWallAt(x, y)) break;
            distance += 2;
        }

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
}

function isWallAt(x, y) {
    return walls.some(wall =>
        x >= wall.x && x <= wall.x + wall.width &&
        y >= wall.y && y <= wall.y + wall.height
    );
}

function isWallVisible(wall, player) {
    const playerX = player.x + player.radius / 2;
    const playerY = player.y + player.radius / 2;

    const wallLeft = wall.x;
    const wallRight = wall.x + wall.width;
    const wallTop = wall.y;
    const wallBottom = wall.y + wall.height;

    const distances = [
        Math.sqrt((playerX - wallLeft) ** 2 + (playerY - wallTop) ** 2),
        Math.sqrt((playerX - wallRight) ** 2 + (playerY - wallTop) ** 2),
        Math.sqrt((playerX - wallLeft) ** 2 + (playerY - wallBottom) ** 2),
        Math.sqrt((playerX - wallRight) ** 2 + (playerY - wallBottom) ** 2)
    ];

    return distances.some(dist => dist <= VISIBILITY_RADIUS);
}

gameLoop();