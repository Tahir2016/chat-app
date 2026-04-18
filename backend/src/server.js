const http = require("http");
const {Server} = require("socket.io");
require("dotenv").config();

const app = require("./app")
const chatSocket = require("./sockets/chatSocket");

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin: [
            process.env.CLIENT_URL,
            "https://chat-app-gules-nine-17.vercel.app",
            "https://chat-knprf4och-tahir2016s-projects.vercel.app",
            "http://localhost:3000"
        ],
        methods: ["GET", "POST"],
        credentials: true
    },
});

chatSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, ()=>{
    console.log(`Server Running on Port ${PORT}`)
});

