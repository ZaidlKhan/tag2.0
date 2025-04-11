// javascript/game.js
import { CELL_SIZE, COLS, ROWS, VISIBILITY_RADIUS, REVEAL_WALLS, TOTAL_REWARDS, PLAYER_RADIUS } from '../../config.js';
import { Maze } from './maze.js';
import { Player } from './player.js';
import { HUD } from './hud.js';
import { collides, drawRectangles, isRewardVisible, getCenter, isPointInRect } from './utils/utils.js';

const socket = io('http://localhost:8000');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    const aspectRatio = COLS * CELL_SIZE / (ROWS * CELL_SIZE);
    let width = window.innerWidth - 200;
    let height = window.innerHeight;
    const borderWidth = 20;
    const borderHeight = 20;
    width -= borderWidth;
    height -= borderHeight;

    if (width / height > aspectRatio) {
        canvas.height = Math.min(ROWS * CELL_SIZE, height);
        canvas.width = canvas.height * aspectRatio;
    } else {
        canvas.width = Math.min(COLS * CELL_SIZE, width);
        canvas.height = canvas.width / aspectRatio;
    }
    ctx.scale(canvas.width / (COLS * CELL_SIZE), canvas.height / (ROWS * CELL_SIZE));
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const mainMenu = document.getElementById('main-menu');
const loadingScreen = document.getElementById('loading-screen');
const lobbyCodeDisplay = document.getElementById('lobby-code-display');
const hudElement = document.getElementById('hud');
const createLobbyBtn = document.getElementById('create-lobby');
const joinLobbyBtn = document.getElementById('join-lobby');
const lobbyCodeInput = document.getElementById('lobby-code');
const submitCodeBtn = document.getElementById('submit-code');

let walls, rewards, localPlayer, remotePlayer, hud, lastTime, role, lobbyCode;

socket.on('connect', () => {
    console.log('Connected to server:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error.message);
});

createLobbyBtn.addEventListener('click', () => {
    socket.emit('createLobby');
});

joinLobbyBtn.addEventListener('click', () => {
    lobbyCodeInput.style.display = 'block';
    submitCodeBtn.style.display = 'block';
    joinLobbyBtn.style.display = 'none';
});

submitCodeBtn.addEventListener('click', () => {
    const code = lobbyCodeInput.value.trim();
    if (code) {
        console.log(`Submitting join request for code: ${code}`);
        socket.emit('joinLobby', code);
        lobbyCodeInput.style.display = 'none';
        submitCodeBtn.style.display = 'none';
        joinLobbyBtn.style.display = 'none';
        mainMenu.style.display = 'none';
        loadingScreen.style.display = 'flex';
        lobbyCodeDisplay.textContent = `Joining lobby ${code}...`;
        lobbyCode = code;
    }
});

socket.on('lobbyCreated', (code) => {
    console.log(`Lobby created with code: ${code}`);
    mainMenu.style.display = 'none';
    loadingScreen.style.display = 'flex';
    lobbyCodeDisplay.textContent = `Lobby Code: ${code}`;
    lobbyCode = code;
    role = 'hider';
});

socket.on('joinError', (message) => {
    console.log(`Join error: ${message}`);
    alert(message);
    lobbyCodeInput.style.display = 'none';
    submitCodeBtn.style.display = 'none';
    joinLobbyBtn.style.display = 'block';
    lobbyCodeInput.value = '';
});

socket.on('startGame', ({ hider, seeker }) => {
    console.log(`Starting game - Hider: ${hider.id}, Seeker: ${seeker.id}`);
    loadingScreen.style.display = 'none';
    canvas.style.display = 'block';
    hudElement.style.display = 'flex';
    role = socket.id === hider.id ? 'hider' : 'seeker';
    localPlayer = new Player(
        role === 'hider' ? hider.x : seeker.x,
        role === 'hider' ? hider.y : seeker.y,
        PLAYER_RADIUS
    );
    remotePlayer = { x: role === 'hider' ? seeker.x : hider.x, y: role === 'hider' ? seeker.y : hider.y };
    initGame();
});

socket.on('playerMoved', ({ id, x, y }) => {
    if (id !== socket.id) {
        remotePlayer.x = x;
        remotePlayer.y = y;
    }
});

socket.on('playerDisconnected', () => {
    alert('Opponent disconnected. Returning to main menu.');
    resetToMainMenu();
});

function initGame() {
    const maze = new Maze();
    maze.makeMaze();
    walls = maze.getWalls();
    rewards = maze.getRewards();
    hud = new HUD(TOTAL_REWARDS);
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (localPlayer) localPlayer.handleKeyPressed(e);
});

document.addEventListener('keyup', (e) => {
    if (localPlayer) localPlayer.handleKeyReleased(e);
});

function gameLoop(timestamp) {
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    hud.update(timestamp);

    if (hud.isGameOver()) {
        hud.drawGameOver(ctx);
        return;
    }

    if (!localPlayer) return;

    localPlayer.move(walls, delta);
    socket.emit('updatePosition', { x: localPlayer.x, y: localPlayer.y, lobbyCode });

    drawRectangles(ctx, [{ x: 0, y: 0, width: COLS * CELL_SIZE, height: ROWS * CELL_SIZE }], 'white');
    drawRectangles(ctx, walls, 'black');
    drawFogOfWar();
    drawRectangles(ctx, rewards.filter(reward => REVEAL_WALLS || isRewardVisible(reward, localPlayer)), 'gold');
    localPlayer.draw(ctx);
    drawRemotePlayer();
    checkRewardCollection();

    requestAnimationFrame(gameLoop);
}

function checkRewardCollection() {
    if (role !== 'hider') return;
    const playerRect = { x: localPlayer.x, y: localPlayer.y, width: PLAYER_RADIUS, height: PLAYER_RADIUS };
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
    drawRectangles(ctx, [{ x: 0, y: 0, width: COLS * CELL_SIZE, height: ROWS * CELL_SIZE }], 'black');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    const center = getCenter({ x: localPlayer.x, y: localPlayer.y, width: PLAYER_RADIUS, height: PLAYER_RADIUS });
    const numberOfRays = 90;
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

function drawRemotePlayer() {
    if (!remotePlayer) return;
    ctx.save();
    ctx.fillStyle = role === 'hider' ? 'red' : 'blue';
    ctx.beginPath();
    ctx.arc(remotePlayer.x + PLAYER_RADIUS / 2, remotePlayer.y + PLAYER_RADIUS / 2, PLAYER_RADIUS / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function resetToMainMenu() {
    canvas.style.display = 'none';
    hudElement.style.display = 'none';
    loadingScreen.style.display = 'none';
    mainMenu.style.display = 'flex';
    lobbyCodeInput.style.display = 'none';
    submitCodeBtn.style.display = 'none';
    joinLobbyBtn.style.display = 'block';
    lobbyCodeInput.value = '';
    localPlayer = null;
    remotePlayer = null;
    lobbyCode = null;
}