const { getRandomLobby, createLobby, joinLobbyAsSeeker, startGame } = require('./maze/utils/utils.js');
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

io.on('connection', (socket) => {
    socket.on('createLobby', () => {
        createLobby(socket, lobbies);
    });

    socket.on('joinLobby', (code) => {
        if (joinLobbyAsSeeker(socket, code, lobbies)) {
            startGame(io, code, lobbies);
        }
    });

    socket.on('joinRandomLobby', () => {
        const randomCode = getRandomLobby(lobbies);
        if (!randomCode) {
            createLobby(socket, lobbies);
        } else {
            if (joinLobbyAsSeeker(socket, randomCode, lobbies)) {
                socket.emit('lobbyCreated', randomCode);
                startGame(io, randomCode, lobbies);
            }
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