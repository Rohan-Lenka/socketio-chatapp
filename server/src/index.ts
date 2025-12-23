import express from 'express'
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express()
const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
    }
})

app.get('/', (req, res) => {
    res.send('Hello World!')
})

io.on('connection', (socket) => {
    console.log('client with socket id: ' + socket.id + ' connected')
    const username = socket.handshake.query.username as string
    socket.data.username = username

    socket.on('global-chat', (data) => {
        io.emit('global-chat', data)
    })

    socket.on('join-room', (data, roomId: string) => {
        socket.join(roomId)
        io.to(roomId).emit('private-chat', data)
    })

    socket.on('private-chat', (data, roomId: string) => {
        io.to(roomId).emit('private-chat', data)
    })

    socket.on('leave-room', (data, roomId: string) => {
        socket.leave(roomId)
        io.to(roomId).emit('private-chat', data)
    })

    socket.on('disconnect', () => {
        console.log('client with socket id: ' + socket.id + ' disconnected')
    })

})

server.listen(8080, () => {
    console.log('Server is running on port 8080')
})