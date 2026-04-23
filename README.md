💬 Chat App (Real-Time Messaging Platform)

A full-stack real-time chat application built with modern technologies, featuring authentication, real-time messaging, and scalable architecture.

---

📌 Project Overview

This project is a full-stack real-time chat application designed to replicate the core functionality of modern messaging platforms. 
It enables users to communicate instantly through real-time messaging, track online/offline status, and maintain persistent chat history.

The application is built using a scalable, event-driven architecture with technologies like Socket.IO for real-time 
communication and PostgreSQL for reliable data storage. Special focus was given to performance 
optimization, efficient state management, and building production-ready features.

---

🎯 Purpose of the Project

The primary goal of this project was to gain hands-on experience in building real-time, scalable full-stack applications.

Through this project, I focused on:

Implementing real-time communication using WebSockets (Socket.IO)
Designing a scalable backend architecture with Express.js
Managing state and optimizing performance in frontend applications
Implementing authentication and authorization mechanisms
Working with PostgreSQL in a production environment
Deploying full-stack applications across multiple platforms

Additionally, this project helped me understand real-world challenges such as handling CORS issues, environment configuration, and debugging production deployments.

---

🚀 Key Features
🔐 Secure authentication and authorization using JWT
💬 Real-time messaging powered by Socket.IO (WebSockets)
🟢 Live online/offline user presence tracking
🕓 Last seen functionality for user activity insights
📩 Persistent chat history stored in PostgreSQL
🔍 Efficient user search and conversation management
⚡ Optimized frontend performance using React hooks and memoization

---

🚀 Tech Stack
🎨 Frontend
<p>
<img src="https://img.shields.io/badge/Next.js-Frontend-black?logo=next.js" />
<img src="https://img.shields.io/badge/React-UI-blue?logo=react" />
<img src="https://img.shields.io/badge/TypeScript-Language-blue?logo=typescript" />
<img src="https://img.shields.io/badge/TailwindCSS-Styling-38B2AC?logo=tailwind-css" /> 
</p>
⚙️ Backend
<p> 
<img src="https://img.shields.io/badge/Node.js-Runtime-green?logo=node.js" /> 
<img src="https://img.shields.io/badge/Express.js-Backend-grey?logo=express" /> 
<img src="https://img.shields.io/badge/Socket.IO-RealTime-black?logo=socket.io" /> 
</p>
>
🗄️ Database & Auth
<p>
<img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql" /> 
<img src="https://img.shields.io/badge/JWT-Authentication-black" /> 
</p>

---

🎨 Frontend

A responsive and modern user interface built with Next.js, designed to handle dynamic user interactions and real-time updates efficiently.

Frontend Features
⚡ Optimized rendering and performance using React hooks and memoization
🎯 Type-safe development with TypeScript for improved reliability
🎨 Modern and responsive UI built with Tailwind CSS
🔄 Real-time updates powered by Socket.IO client integration
📦 Efficient state management for handling live chat data

---

⚙️ Backend API

A scalable backend service responsible for authentication, messaging, and real-time communication, 
designed with a modular and production-ready architecture.

Backend Features
🔐 Secure authentication and authorization using JWT
💬 Real-time bidirectional communication using Socket.IO
🗄️ PostgreSQL integration with a well-structured relational schema for persistent data storage
📡 RESTful API design for managing users, messages, and conversations
⚡ Optimized message retrieval using filtering, sorting, and pagination techniques
🔁 Middleware-based request handling for authentication, validation, and error management
🛡️ Input validation and centralized error handling for robust API performance
🌐 CORS configuration and environment-based setup for seamless deployment

---

📡 API Endpoints
👤 Auth Routes
POST /api/auth/register → Register a new user
POST /api/auth/login → Authenticate user and return JWT
POST /api/auth/forgot-password → Send password reset email
POST /api/auth/reset-password → Reset user password

👥 User Routes
GET /api/users → Retrieve all users
GET /api/users/search → Search users by name or email

💬 Message Routes
POST /api/messages → Send a new message
GET /api/messages/:receiverId → Retrieve conversation messages
PATCH /api/messages/:id → Update a message
DELETE /api/messages/:id → Delete a message

🔌 Socket Events
connection → Establish socket connection
join_room → Join a private chat room
send_message → Emit message to server
receive_message → Receive message in real-time
user_online → Broadcast user online status
user_offline → Broadcast user offline status
name_updated → Sync updated user name across clients

---

## 🌐 Live Demo

👉 https://chat-app-gules-nine-17.vercel.app

---

## 👨‍💻 Author

**Tahir Pathan**  
Full-Stack Developer  

- GitHub: https://github.com/Tahir2016  
- LinkedIn: https://www.linkedin.com/in/tahirpathan1/ 

---

## 📜 License

This project is open-source and available under the MIT License.

---
