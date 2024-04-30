const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/room/:id', (req, res) => {
    res.sendFile(__dirname + '/public/room.html');
})

io.on('connection', (socket) => {
    socket.on('join', (roomId) => {
        socket.join(roomId);

        const clients = io.sockets.adapter.rooms.get(roomId);
        io.to(roomId).emit('clients', clients.size);

        if (clients.size > 2) {
            io.to(roomId).emit('full-room');
        }

        io.to(roomId).emit('room-id', roomId);
    });

    socket.on('chat message', (msg, roomId) => {
        const clients = io.sockets.adapter.rooms.get(roomId);
        if (clients.size > 2) {   
            io.to(socket.id).emit('full-room');
            return;
        }
        io.to(roomId).emit('chat message', msg);
    });
});
  
app.all('*', (req, res) => {
    res.status(404).send('<style>body { font-family: monospace; text-align: center; margin-top: 20%; }</style><h1>404 Not Found</h1>');
});

server.listen(process.env.PORT, () => {
    console.log('listening on *:3000');
});