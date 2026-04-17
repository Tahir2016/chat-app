const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const chatSocket = (io) => {

  io.use((socket, next) =>{
    try{
      const token = socket.handshake?.auth?.token;

      if(!token){
        return next(new Error("Unauthorized"))
      };
      
      const user = jwt.verify(token, process.env.JWT_SECRET);

      socket.user = user;
      
      next();

    } catch(error){
      console.error("Socket Auth Error: ", error);
      next(new Error("Unauthorized"));
    };
  });

  io.on("connection", async (socket) =>{
    try{
      const userId = socket.user.id;

      console.log("user Connected", userId);

      // *****Join personal room*****
      socket.join(String(userId));

      // ***** Broadcast online status *****
      io.emit("user_online", { userId });

      // ***** Listen for name update *****
      socket.on("name_updated", ({ name }) => {
        io.emit("user_name_updated", { userId, name });
      });

      // ***** Send pending messages to user on connect *****
      try {
        const pending = await pool.query(
          `SELECT DISTINCT sender_id FROM messages WHERE receiver_id = $1`,
          [userId]
        );
        const senderIds = pending.rows.map((r) => r.sender_id);
        if (senderIds.length > 0) {
          io.to(String(userId)).emit("load_chat_list", { senderIds });
        }
      } catch (err) {
        console.error("Pending messages error:", err);
      }

      // ***** Join private chat room *****
      socket.on("join_room", ({receiverId}) => {
        try{
          if (!receiverId || typeof receiverId !== "number") return;

          const roomId = [String(userId), String(receiverId)].sort().join("_");

          socket.join(roomId);

        } catch(error){
          console.error("Join Room Error:", error)
        };
      });

      // ***** Send private message via socket (real-time delivery only, DB save is via API) *****
      socket.on("send_message", async ({receiverId, message, savedMessage})=>{
        try{
          if(!receiverId || typeof receiverId !== "number" || typeof message !== "string" || message.trim() === "" || message.length > 5000) return;

          const roomId = [String(userId), String(receiverId)].sort().join("_");

          // if savedMessage passed from frontend, use it directly
          if(savedMessage){
            io.to(roomId).emit("receive_message", savedMessage);
            return;
          }

          // fallback: save to DB if no savedMessage provided
          const result = await pool.query(
            `INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *`,
            [userId, receiverId, message]
          );
          io.to(roomId).emit("receive_message", result.rows[0]);

        } catch(error){
          console.error("Send Message Error:", error);
        }
      });
      socket.on("disconnect", async () =>{
        console.log("User disconnected:", userId);
        const lastSeen = new Date();
        try {
          await pool.query(`UPDATE users SET last_seen=$1 WHERE id=$2`, [lastSeen, userId]);
        } catch(err) { console.error("Last seen update error:", err); }
        io.emit("user_offline", { userId, lastSeen });
      });
    } catch(error){
      console.error("Socket Connection Error:", error);
    }
  });
};

module.exports = chatSocket;