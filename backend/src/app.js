const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

app.use(cors({
    origin: (origin, callback) => {
        const allowed = [
            "http://localhost:3000",
            "https://chat-app-gules-nine-17.vercel.app",
            "https://chat-knprf4och-tahir2016s-projects.vercel.app"
        ];
        if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true
}));

app.use(express.json())

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);

module.exports = app