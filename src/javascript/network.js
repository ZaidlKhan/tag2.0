import { showLobbyCreated, showJoinError, startGameUI, resetToMainMenu } from './ui.js';
import { startGame, updateRemotePlayer, setLobbyCode, initGameLogic } from './gameLogic.js';

const socket = io('http://localhost:8000');

export function setupNetwork() {
    socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
    });

    socket.on('lobbyCreated', (code) => {
        showLobbyCreated(code);
        setLobbyCode(code);
    });

    socket.on('joinError', (message) => {
        console.log(`Join error: ${message}`);
        showJoinError(message);
    });

    socket.on('startGame', ({ hider, seeker, maze }) => {
        startGameUI();
        startGame(hider, seeker, maze, socket.id);
    });

    socket.on('playerMoved', ({ id, x, y }) => {
        updateRemotePlayer(id, x, y);
    });

    socket.on('playerDisconnected', () => {
        alert('Opponent disconnected. Returning to main menu.');
        resetToMainMenu();
        initGameLogic();
    });
}

export function createLobby() {
    socket.emit('createLobby');
}

export function joinLobby(code) {
    setLobbyCode(code);
    socket.emit('joinLobby', code);
}

export function joinRandomLobby() {
    socket.emit('joinRandomLobby');
}

export function emitPositionUpdate(x, y, lobbyCode) {
    socket.emit('updatePosition', { x, y, lobbyCode });
}