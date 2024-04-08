const express = require('express');
const { io} = require('./service/service.js');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();

const socketToEmailMapping = new Map();
const emailToSocketMapping = new Map();

io.on("connection", (socket) => {
    socket.on("event:join-room", ({email, roomid}) => {

        socketToEmailMapping.set(socket.id, email);
        emailToSocketMapping.set(email, socket.id);

        socket.join(roomid);
        
        //telling user that a room has been created 
        socket.emit("event:joined-room", {roomid});

        //telling the group that a user joined the room
        socket.broadcast.to(roomid).emit("event:user-joined", {email});
    })
      //taking the call
    socket.on("event:call-user", ({email, offer}) => {

    const fromEmail = socketToEmailMapping.get(socket.id);
    const toSocketId = emailToSocketMapping.get(email);

    socket.to(toSocketId).emit("event:incomming-call", {email: fromEmail, offer});
    console.log("call-user: ", typeof offer);

    });
    socket.on("event:call-accepted", ({email, ans}) => {

        const fromEmail = socketToEmailMapping.get(socket.id);
        const toSocketId = emailToSocketMapping.get(email);

        socket.to(toSocketId).emit("event:accepted", {email: fromEmail, ans});
        console.log("call-accepted", typeof ans);
    });
    socket.on("peer:nego:needed", ({to, offer}) => {
        const fromEmail = socketToEmailMapping.get(socket.id);
        const toSocketId = emailToSocketMapping.get(to);
        console.log("peer:nego:needed", fromEmail, toSocketId);
        socket.to(toSocketId).emit("peer:nego:required", {from: fromEmail, offer});
    });
    socket.on("peer:nego:done", ({to, ans}) => {
        const fromEmail = socketToEmailMapping.get(socket.id);
        const toSocketId = emailToSocketMapping.get(to);
        console.log("peer:nego:done", fromEmail, toSocketId);

        socket.to(toSocketId).emit("peer:nego:final", {from: fromEmail, ans});
    });
})

app.get('/', (req, res) => {
    res.send('Hello World!');
})

app.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
});