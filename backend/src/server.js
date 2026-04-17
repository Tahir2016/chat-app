const http = require("http");
const {Server} = require("socket.io");
require("dotenv").config();

const app = require("./app")
const chatSocket = require("./sockets/chatSocket");

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin : process.env.CLIENT_URL,
        methods : ["GET", "POST"],
        credentials:true
    },
});

chatSocket(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, ()=>{
    console.log(`Server Running on Port ${PORT}`)
});

