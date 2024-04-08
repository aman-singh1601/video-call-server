const { Server} = require('socket.io');
require("dotenv").config();

const io = new Server(process.env.SOCKET_PORT, {
    cors: {
        origin: '*',
    }
})


module.exports = {io};