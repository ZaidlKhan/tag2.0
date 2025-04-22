import { TOTAL_REWARDS, PLAYER_RADIUS, STAMINA_MAX } from '../config.js';
import { Player } from './player.js';
import { collides } from './utils/utils.js';
import { emitPositionUpdate } from './network.js';

let walls = [];
let rewards = [];
let localPlayer;
let remotePlayer;
let role;
let lobbyCode;
let socketId;

export function initGameLogic() {
    walls = [];
    rewards = [];
    localPlayer = null;
    remotePlayer = null;
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
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}

export function updateGameLogic(delta) {
    if (!localPlayer) return;

    localPlayer.update(delta);
    localPlayer.move(walls);
    emitPositionUpdate(localPlayer.x, localPlayer.y, lobbyCode);

    const staminaFill = document.getElementById('stamina-fill');
    if (staminaFill) {
        const staminaPercent = (localPlayer.getStamina() / STAMINA_MAX) * 100;
        staminaFill.style.height = `${staminaPercent}%`;
    }

    const joystick = document.getElementById('joystick');
    if (joystick) {
        const { state, direction } = localPlayer.getJoystickState();
        let rotation = 0;

        if (state === 'diagonal') {
            if (direction === 'up-left' || direction === 'down-right') {
                if (direction === 'down-right') {
                    rotation = 180;
                } else if (direction === 'up-left') {
                    rotation = 0;
                }
                joystick.src = '../assets/images/joystick_corner_top.png';
            } else if (direction === 'down-left' || direction === 'up-right') {
                if (direction === 'down-left') {
                    rotation = 0;
                } else if (direction === 'up-right') {
                    rotation = 180;
                }
                joystick.src = '../assets/images/joystick_corner_bot.png';
            }
        } else if (state === 'vertical_horizontal') {
            if (direction === 'up' || direction === 'down') {
                joystick.src = '../assets/images/joystick_down.png';
                if (direction === 'up') {
                    rotation = 180;
                } else if (direction === 'down') {
                    rotation = 0;
                }
            } else if (direction === 'left' || direction === 'right') {
                joystick.src = '../assets/images/joystick_left.png';
                if (direction === 'left') {
                    rotation = 0;
                } else if (direction === 'right') {
                    rotation = 180;
                }
            }
        } else {
            joystick.src = '../assets/images/joystick.png';
        }

        joystick.style.transform = `translateY(-50%) rotate(${rotation}deg)`;
    }
}

export function checkRewardCollection() {
    if (role !== 'hider') return;
    const playerRect = { x: localPlayer.x, y: localPlayer.y, width: PLAYER_RADIUS, height: PLAYER_RADIUS };
    rewards = rewards.filter(reward => {
        if (collides(playerRect, reward)) {
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
    return { walls, rewards, localPlayer, remotePlayer, role, lobbyCode, stamina: localPlayer ? localPlayer.getStamina() : 0 };
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