// server.js (assuming you've renamed app.js to server.js)
const express = require('express');
const app = express();
const port = 8000;
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');

const lobbies = {};

app.use(express.static(path.join(__dirname, '..', 'src')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
});

function generateNewMaze() {
    const { Maze } = require('./maze/maze.js');
    const mazeInstance = new Maze();
    mazeInstance.makeMaze();
    return {
        walls: mazeInstance.getWalls(),
        rewards: mazeInstance.getRewards()
    };
}

io.on('connection', (socket) => {
    socket.on('createLobby', () => {
        const lobbyCode = Math.floor(1000 + Math.random() * 9000).toString();
        lobbies[lobbyCode] = {
            hider: { id: socket.id, x: 10, y: 10 },
            seeker: null,
            maze: null // Add a place to store the maze data
        };
        socket.join(lobbyCode);
        socket.emit('lobbyCreated', lobbyCode);
    });

    socket.on('joinLobby', (code) => {
        if (lobbies[code] && !lobbies[code].seeker) {
            lobbies[code].seeker = { id: socket.id, x: 50, y: 50 };
            socket.join(code);

            lobbies[code].maze = generateNewMaze();

            io.to(code).emit('startGame', {
                hider: lobbies[code].hider,
                seeker: lobbies[code].seeker,
                maze: lobbies[code].maze
            });
        } else {
            socket.emit('joinError', 'Lobby not found or full');
        }
    });

    socket.on('updatePosition', ({ x, y, lobbyCode }) => {
        if (!lobbies[lobbyCode]) return;
        const lobby = lobbies[lobbyCode];
        if (socket.id === lobby.hider.id) {
            lobby.hider.x = x;
            lobby.hider.y = y;
        } else if (socket.id === lobby.seeker.id) {
            lobby.seeker.x = x;
            lobby.seeker.y = y;
        }
        socket.to(lobbyCode).emit('playerMoved', { id: socket.id, x, y });
    });

    socket.on('disconnect', () => {
        for (const code in lobbies) {
            if (lobbies[code].hider.id === socket.id || (lobbies[code].seeker && lobbies[code].seeker.id === socket.id)) {
                io.to(code).emit('playerDisconnected');
                delete lobbies[code];
                break;
            }
        }
    });
});

server.listen(port, (error) => {
    if (error) {
        console.error('Server failed to start:', error);
    } else {
        console.log(`Server listening on port ${port}`);
    }
});