import { CELL_SIZE, TOTAL_REWARDS, PLAYER_RADIUS } from '../config.js';
import { Player } from './player.js';
import { HUD } from './hud.js';
import { collides } from './utils/utils.js';
import { emitPositionUpdate } from './network.js';

let walls = [];
let rewards = [];
let localPlayer;
let remotePlayer;
let hud;
let role;
let lobbyCode;
let socketId;

export function initGameLogic() {
    walls = [];
    rewards = [];
    localPlayer = null;
    remotePlayer = null;
    hud = null;
    role = null;
    lobbyCode = null;
    socketId = null;
}

export function startGame(hider, seeker, maze, id) {
    socketId = id;
    role = socketId === hider.id ? 'hider' : 'seeker';
    localPlayer = new Player(
        role === 'hider' ? hider.x : seeker.x,
        role === 'hider' ? hider.y : seeker.y,
        role
    );
    remotePlayer = {
        x: role === 'hider' ? seeker.x : hider.x,
        y: role === 'hider' ? seeker.y : hider.y,
        radius: PLAYER_RADIUS
    };
    walls = maze.walls;
    rewards = maze.rewards;
    hud = new HUD(TOTAL_REWARDS, localPlayer);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

export function updateGameLogic(delta) {
    if (!hud || !localPlayer) return;

    hud.update(performance.now());
    if (hud.isGameOver()) return;

    localPlayer.update(delta);
    localPlayer.move(walls);
    emitPositionUpdate(localPlayer.x, localPlayer.y, lobbyCode);
}

export function checkRewardCollection() {
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

export function updateRemotePlayer(id, x, y) {
    if (id !== socketId && remotePlayer) {
        remotePlayer.x = x;
        remotePlayer.y = y;
    }
}

export function getGameState() {
    return { walls, rewards, localPlayer, remotePlayer, hud, role, lobbyCode, stamina: localPlayer ? localPlayer.getStamina() : 0 };
}

export function setLobbyCode(code) {
    lobbyCode = code;
}

function handleKeyDown(e) {
    if (localPlayer) localPlayer.handleKeyPressed(e);
}

function handleKeyUp(e) {
    if (localPlayer) localPlayer.handleKeyReleased(e);
}