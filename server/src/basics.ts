import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer);

const RECEIVE_MESSAGE_EVENT = 'receive-message'
const SEND_MESSAGE_EVENT = 'send-message'

io.on("connection", (socket) => {
    console.log("client connected with socket Id : " + socket.id);

    // 1) events
    // socket.on to control the listening of any event by client's socket from server side
    socket.on(RECEIVE_MESSAGE_EVENT, (msg) => {
        // 2) emit & broadcast
        // io.emit('message', msg)
        // sends msg to all the clients who are listening to this event, even the sender

        socket.broadcast.emit(RECEIVE_MESSAGE_EVENT, msg);
        // sends msg to all the clients who are listening to this event, skipping the sender
    });

    // 3) rooms
    // a client can't directly join a room from the client side,
    // it needs to be done from server side
    // NOTE -> by default every socket is present in a room that is its socketId
    socket.on("join-room", (roomId, callback) => {
        // callback is a way to trigger a client side code from server side
        /// NOTE -> callback shld always be the last arg passed 
        socket.join(roomId);
        callback("Joined room: " + roomId)
        // u can join multiple rooms at the same time too using code -> socket.join(["r1","r2"])
    });

    socket.on(SEND_MESSAGE_EVENT, (msg, room) => {
        if(!room) {
            socket.broadcast.emit(RECEIVE_MESSAGE_EVENT, msg)
        } else {
            // .to function sends msg to that room only 
            socket.to(room).emit(RECEIVE_MESSAGE_EVENT, msg)
        }
    })

    // 4) disconnect
    socket.on('disconnect', () => {
        console.log("client with socket id: " + socket.id + " disconnected")
    })

});

// 5) namespaces
// in order to make different endpoints for wss 
// NOTE -> this opens up an entirely different ws channel, 
// too many of these will put overhead to the server 
const userIo = io.of('/user')

function getUserFromToken(token: string) {
    // code will be written here to verify and find the user from token 
    return token
}

// 6) middlewares and auth
userIo.use((socket, next) => {
    // in frontend, a token can be passed for auth during connection like this_ 
    // const socket = io('http://localhost:8080/user', { auth: { token: '' } })
    const token = socket.handshake.auth.token
    // this is the way to get the token at server side

    const user = getUserFromToken(token)
    // additional data can be attached to socket.data to use them when required
    socket.data.user = user

    next()
})

userIo.on('connection', (socket) => {
    console.log("socket with id: " + socket.id + " connected to user namespace")
    // separate logics for this channel  
})


httpServer.listen(8080, () => {
    console.log("server listening on port 8080...");
});
