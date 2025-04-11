import { CELL_SIZE, COLS, ROWS, VISIBILITY_RADIUS, REVEAL_WALLS, PLAYER_RADIUS } from '../config.js';
import { drawRectangles, isRewardVisible, getCenter, isPointInRect } from './utils/utils.js';
import { getGameState } from './gameLogic.js';

export function render(ctx) {
    const { walls, rewards, localPlayer, remotePlayer, hud, role } = getGameState();

    if (!localPlayer || !hud) return;

    if (hud.isGameOver()) {
        hud.drawGameOver(ctx);
        return;
    }

    drawRectangles(ctx, [{ x: 0, y: 0, width: COLS * CELL_SIZE, height: ROWS * CELL_SIZE }], 'white');
    drawMaze(walls, ctx);
    drawFogOfWar(ctx);
    drawRewards(rewards, ctx);
    localPlayer.draw(ctx);
    drawRemotePlayer(ctx);
}

function drawMaze(walls, ctx) {
    ctx.fillStyle = 'black';
    walls.forEach(wall => {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    });
}

function drawRewards(rewards, ctx) {
    ctx.fillStyle = 'gold';
    const { localPlayer } = getGameState();
    rewards.forEach(reward => {
        if (REVEAL_WALLS || isRewardVisible(reward, localPlayer)) {
            ctx.fillRect(reward.x, reward.y, reward.width, reward.height);
        }
    });
}

function drawFogOfWar(ctx) {
    const { localPlayer, role } = getGameState();
    if (REVEAL_WALLS) return;

    ctx.save();
    drawRectangles(ctx, [{ x: 0, y: 0, width: COLS * CELL_SIZE, height: ROWS * CELL_SIZE }], 'black');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const center = getCenter({ x: localPlayer.x, y: localPlayer.y, width: PLAYER_RADIUS, height: PLAYER_RADIUS });
    const numberOfRays = 90;
    const angleStep = 360 / numberOfRays;

    for (let i = 0; i < numberOfRays; i++) {
        const angle = i * angleStep * Math.PI / 180;
        const rayEnd = castRay(center, angle);
        if (i === 0) ctx.moveTo(rayEnd.x, rayEnd.y);
        else ctx.lineTo(rayEnd.x, rayEnd.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
    ctx.restore();
}

function castRay(center, angle) {
    const { walls } = getGameState();
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

function drawRemotePlayer(ctx) {
    const { remotePlayer, role } = getGameState();
    if (!remotePlayer) return;
    ctx.save();
    ctx.fillStyle = role === 'hider' ? 'red' : 'blue';
    ctx.beginPath();
    ctx.arc(remotePlayer.x + PLAYER_RADIUS / 2, remotePlayer.y + PLAYER_RADIUS / 2, PLAYER_RADIUS / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}