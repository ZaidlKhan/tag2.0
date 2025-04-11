import { showLobbyCreated, showJoinError, startGameUI, resetToMainMenu } from './ui.js';
import { startGame, updateRemotePlayer, setLobbyCode } from './gameLogic.js';

const socket = io('http://localhost:8000');

export function setupNetwork() {
    socket.on('connect', () => {
        console.log('Connected to server:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('Connection error:', error.message);
    });

    socket.on('lobbyCreated', (code) => {
        console.log(`Lobby created with code: ${code}`);
        showLobbyCreated(code);
        setLobbyCode(code);
    });

    socket.on('joinError', (message) => {
        console.log(`Join error: ${message}`);
        showJoinError(message);
    });

    socket.on('startGame', ({ hider, seeker, maze }) => {
        console.log(`Starting game - Hider: ${hider.id}, Seeker: ${seeker.id}, Maze:`, maze);
        startGameUI();
        startGame(hider, seeker, maze, socket.id); // Pass socket.id
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
    socket.emit('joinLobby', code);
}

export function emitPositionUpdate(x, y, lobbyCode) {
    socket.emit('updatePosition', { x, y, lobbyCode });
}