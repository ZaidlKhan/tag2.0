import { CELL_SIZE, COLS, ROWS, VISIBILITY_RADIUS } from '../../config.js';

// utils.js
export function getCenter(obj) {
    return {
        x: obj.x + obj.width / 2,
        y: obj.y + obj.height / 2,
    };
}

export function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isRewardVisible(reward, player) {
    const playerCenter = getCenter({ x: player.x, y: player.y, width: player.radius, height: player.radius });
    const corners = getCorners(reward);
    return corners.some(corner => distance(playerCenter, corner) <= VISIBILITY_RADIUS);
}

export function drawRectangles(ctx, rects, color) {
    ctx.fillStyle = color;
    rects.forEach(rect => {
        ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    });
}

export function getCorners(rect) {
    return [
        { x: rect.x, y: rect.y },
        { x: rect.x + rect.width, y: rect.y },
        { x: rect.x, y: rect.y + rect.height },
        { x: rect.x + rect.width, y: rect.y + rect.height },
    ];
}

export function collides(rect1, rect2OrArray) {
    if (Array.isArray(rect2OrArray)) {
        return rect2OrArray.some(rect => collides(rect1, rect));
    }
    const rect2 = rect2OrArray;
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

export function isPointInRect(point, rect) {
    return (
        point.x >= rect.x && point.x <= rect.x + rect.width &&
        point.y >= rect.y && point.y <= rect.y + rect.height
    );
}

export function displayAbilities(abilityBar, role) {
    abilityBar.innerHTML = `
        ${role === 'hider' ? `
            <div class="ability-slot">
                <img class="ability-icon" src="/assets/images/seek.png" alt="Seek Ability">
                <span class="ability-text">Seek - Reveals Path</span>
            </div>
            <div class="ability-slot">
                <img class="ability-icon" src="/assets/images/hide.png" alt="Hide Ability">
                <span class="ability-text">Hide - Turn Invisible</span>
            </div>
        ` : `
            <div class="ability-slot">
                <img class="ability-icon" src="/assets/images/hunt.png" alt="Hunt Ability">
                <span class="ability-text">Hunt - Track Hider</span>
            </div>
            <div class="ability-slot">
                <img class="ability-icon" src="/assets/images/trap.png" alt="Trap Ability">
                <span class="ability-text">Trap - Place Trap</span>
            </div>
        `}
    `;
}