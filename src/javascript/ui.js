import { joinLobby, createLobby, joinRandomLobby } from './network.js';
import { getGameState } from './gameLogic.js';

const mainMenu = document.getElementById('main-menu');
const loadingScreen = document.getElementById('loading-screen');
const lobbyCodeDisplay = document.getElementById('lobby-code-display');
const gameContainer = document.getElementById('game-container');
const createLobbyBtn = document.getElementById('create-lobby');
const joinLobbyBtn = document.getElementById('join-lobby');
const joinRandomBtn = document.getElementById('join-random');
const lobbyCodeInput = document.getElementById('lobby-code');
const submitCodeBtn = document.getElementById('submit-code');
const staminaContainer = document.getElementById('stamina-container');

export function setupUI() {
    createLobbyBtn.addEventListener('click', () => {
        createLobby();
    });

    joinRandomBtn.addEventListener('click', () => {
        joinRandomLobby();
    });

    joinLobbyBtn.addEventListener('click', () => {
        lobbyCodeInput.style.display = 'block';
        submitCodeBtn.style.display = 'block';
        joinLobbyBtn.style.display = 'none';
    });

    submitCodeBtn.addEventListener('click', () => {
        const code = lobbyCodeInput.value.trim();
        if (code) {
            joinLobby(code);
        }
    });
}

export function showLobbyCreated(code) {
    mainMenu.style.display = 'none';
    loadingScreen.style.display = 'flex';
    lobbyCodeDisplay.textContent = `Lobby Code: ${code}`;
}

export function showJoinError(message) {
    alert(message);
    lobbyCodeInput.style.display = 'none';
    submitCodeBtn.style.display = 'none';
    joinLobbyBtn.style.display = 'block';
    lobbyCodeInput.value = '';
    loadingScreen.style.display = 'none';
    mainMenu.style.display = 'flex';
}

export function startGameUI() {
    mainMenu.style.display = 'none';
    loadingScreen.style.display = 'none';
    gameContainer.style.display = 'flex';
    staminaContainer.style.display = 'flex';
}

export function resetToMainMenu() {
    gameContainer.style.display = 'none';
    loadingScreen.style.display = 'none';
    mainMenu.style.display = 'flex';
    lobbyCodeInput.style.display = 'none';
    submitCodeBtn.style.display = 'none';
    joinLobbyBtn.style.display = 'block';
    lobbyCodeInput.value = '';
    staminaContainer.style.display = 'none';
}