// src/javascript/ui.js
import { joinLobby, createLobby } from './network.js';

const mainMenu = document.getElementById('main-menu');
const loadingScreen = document.getElementById('loading-screen');
const lobbyCodeDisplay = document.getElementById('lobby-code-display');
const hudElement = document.getElementById('hud');
const createLobbyBtn = document.getElementById('create-lobby');
const joinLobbyBtn = document.getElementById('join-lobby');
const lobbyCodeInput = document.getElementById('lobby-code');
const submitCodeBtn = document.getElementById('submit-code');
const canvas = document.getElementById('gameCanvas');

export function setupUI() {
    createLobbyBtn.addEventListener('click', () => {
        createLobby();
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
            joinLobby(code);
            lobbyCodeInput.style.display = 'none';
            submitCodeBtn.style.display = 'none';
            joinLobbyBtn.style.display = 'none';
            mainMenu.style.display = 'none';
            loadingScreen.style.display = 'flex';
            lobbyCodeDisplay.textContent = `Joining lobby ${code}...`;
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
    loadingScreen.style.display = 'none';
    canvas.style.display = 'block';
    hudElement.style.display = 'flex';
}

export function resetToMainMenu() {
    canvas.style.display = 'none';
    hudElement.style.display = 'none';
    loadingScreen.style.display = 'none';
    mainMenu.style.display = 'flex';
    lobbyCodeInput.style.display = 'none';
    submitCodeBtn.style.display = 'none';
    joinLobbyBtn.style.display = 'block';
    lobbyCodeInput.value = '';
}