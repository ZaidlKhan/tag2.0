// javascript/game.js
import { CELL_SIZE, COLS, ROWS, VISIBILITY_RADIUS, REVEAL_WALLS, TOTAL_REWARDS } from '../config.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { HUD } from './hud.js';
import { collides, drawRectangles, isRewardVisible, getCenter, isPointInRect } from './utils/utils.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

const maze = new Maze();
maze.makeMaze();
const walls = maze.getWalls();
let rewards = maze.getRewards();
const player = new Player(10, 10);
const hud = new HUD(TOTAL_REWARDS);
let lastTime = performance.now();

document.addEventListener('keydown', (e) => player.handleKeyPressed(e));
document.addEventListener('keyup', (e) => player.handleKeyReleased(e));

function gameLoop(timestamp) {
    const delta = (timestamp - lastTime) / 1000; // Delta time in seconds
    lastTime = timestamp;

    hud.update(timestamp);

    if (hud.isGameOver()) {
        hud.drawGameOver(ctx);
        return;
    }

    player.move(walls, delta);
    checkRewardCollection();

    drawRectangles(ctx, [{ x: 0, y: 0, width: canvas.width, height: canvas.height }], 'white');
    drawRectangles(ctx, walls, 'black');
    drawFogOfWar();
    drawRectangles(ctx, rewards.filter(reward => REVEAL_WALLS || isRewardVisible(reward, player)), 'gold');
    player.draw(ctx);

    requestAnimationFrame(gameLoop);
}

function checkRewardCollection() {
    const playerRect = { x: player.x, y: player.y, width: player.radius, height: player.radius };
    rewards = rewards.filter(reward => {
        if (collides(playerRect, reward)) {
            hud.collectReward();
            return false;
        }
        return true;
    });
}

function drawFogOfWar() {
    if (REVEAL_WALLS) return;

    ctx.save();
    drawRectangles(ctx, [{ x: 0, y: 0, width: canvas.width, height: canvas.height }], 'black');
    
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const center = getCenter({ x: player.x, y: player.y, width: player.radius, height: player.radius });
    const numberOfRays = 180;
    const angleStep = 360 / numberOfRays;

    for (let i = 0; i < numberOfRays; i++) {
        const angle = i * angleStep * Math.PI / 180;
        const rayEnd = castRay(center, angle, walls);
        if (i === 0) ctx.moveTo(rayEnd.x, rayEnd.y);
        else ctx.lineTo(rayEnd.x, rayEnd.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
}

function castRay(center, angle, walls) {
    const dx = Math.cos(angle);
    const dy = Math.sin(angle);
    let x = center.x;
    let y = center.y;
    let dist = 0;

    while (dist < VISIBILITY_RADIUS) {
        x = center.x + dx * dist;
        y = center.y + dy * dist;
        if (walls.some(wall => isPointInRect({ x, y }, wall))) break;
        dist += 2;
    }
    return { x, y };
}

requestAnimationFrame(gameLoop);