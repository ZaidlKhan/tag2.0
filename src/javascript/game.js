// src/javascript/game.js
import { CELL_SIZE, COLS, ROWS } from '../config.js';
import { setupUI } from './ui.js';
import { initGameLogic, updateGameLogic, checkRewardCollection } from './gameLogic.js';
import { render } from './renderer.js';
import { setupNetwork } from './network.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let lastTime;

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

function gameLoop(timestamp) {
    const delta = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    updateGameLogic(delta);
    render(ctx);

    requestAnimationFrame(gameLoop);
}

function startGame() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setupUI();
    setupNetwork();
    initGameLogic();
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
}

startGame();