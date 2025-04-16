const { Maze } = require('../maze.js');
const { CELL_SIZE, COLS, ROWS } = require('../../config.js');

function generateNewMaze() {
    const mazeInstance = new Maze();
    mazeInstance.makeMaze();
    return {
        walls: mazeInstance.getWalls(),
        rewards: mazeInstance.getRewards()
    };
}

function getRandomLobby(lobbies) {
    const openLobbies = Object.keys(lobbies).filter(code => !lobbies[code].seeker);
    if (openLobbies.length === 0) return null;
    return openLobbies[Math.floor(Math.random() * openLobbies.length)];
}

function createLobby(socket, lobbies) {
    const lobbyCode = Math.floor(1000 + Math.random() * 9000).toString();
    lobbies[lobbyCode] = {
        hider: { id: socket.id, x: CELL_SIZE / 2, y: CELL_SIZE / 2 },
        seeker: null,
        maze: null
    };
    socket.join(lobbyCode);
    socket.emit('lobbyCreated', lobbyCode);
    return lobbyCode;
}

function joinLobbyAsSeeker(socket, lobbyCode, lobbies) {
    if (!lobbies[lobbyCode] || lobbies[lobbyCode].seeker) {
        socket.emit('joinError', 'Lobby not found or full');
        return false;
    }
    lobbies[lobbyCode].seeker = {
        id: socket.id,
        x: (COLS - 0.5) * CELL_SIZE,
        y: (ROWS - 0.5) * CELL_SIZE
    };
    socket.join(lobbyCode);
    return true;
}

function startGame(io, lobbyCode, lobbies) {
    lobbies[lobbyCode].maze = generateNewMaze();
    io.to(lobbyCode).emit('startGame', {
        hider: lobbies[lobbyCode].hider,
        seeker: lobbies[lobbyCode].seeker,
        maze: lobbies[lobbyCode].maze
    });
}

module.exports = { getRandomLobby, generateNewMaze, createLobby, joinLobbyAsSeeker, startGame };