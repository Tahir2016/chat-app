const pool = require("../config/db");

exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `SELECT DISTINCT ON (other_id)
        other_id,
        u.name,
        u.email,
        u.last_seen,
        m.message AS last_message,
        m.created_at AS last_message_time
       FROM (
         SELECT
           CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END AS other_id,
           message,
           created_at
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
       ) m
       JOIN users u ON u.id = m.other_id
       ORDER BY other_id, m.created_at DESC`,
      [userId]
    );

    // get unread count per sender
    const unread = await pool.query(
      `SELECT sender_id, COUNT(*) AS unread_count
       FROM messages
       WHERE receiver_id = $1 AND is_read = false
       GROUP BY sender_id`,
      [userId]
    );

    const unreadMap = {};
    unread.rows.forEach((r) => { unreadMap[r.sender_id] = parseInt(r.unread_count); });

    const rows = result.rows.map((r) => ({
      ...r,
      unread_count: unreadMap[r.other_id] || 0,
    }));

    // sort by latest message time
    rows.sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));

    res.json(rows);
  } catch (error) {
    console.error("Conversations Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;
    await pool.query(
      `UPDATE messages SET is_read = true WHERE receiver_id = $1 AND sender_id = $2 AND is_read = false`,
      [userId, senderId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Mark as read error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getMessage = async(req, res) => {
    try{
      const {receiverId} = req.params;
      const senderId = req.user.id;

      const result = await pool.query(
        `SELECT * FROM messages WHERE (sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1) ORDER BY created_at ASC`,
        [senderId, receiverId]
        );

        res.json(result.rows);

    } catch(error){
      res.status(500).json({error: "Server error"});
    }
};

exports.createMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !message) {
      return res.status(400).json({ error: "All fields required" });
    }

    const result = await pool.query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING *",
      [senderId, receiverId, message]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("ACTUAL ERROR:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM messages WHERE id=$1",
      [id]
    );

    const msg = result.rows[0];

    if(!msg){
      return res.status(404).json({ error: "Message not found" });
    };

    if(msg.sender_id !== userId){
      return res.status(403).json({ error: "Unauthorized" });
    };

    await pool.query("DELETE FROM messages WHERE id = $1", [id]);

    res.json({ message: "Deleted Successfully" });

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      "SELECT * FROM messages WHERE id=$1",
      [id]
    );

    const msg = result.rows[0];

    if(!msg){
      return res.status(404).json({ error: "Message not found" });
    };

    if(msg.sender_id !== userId){
      return res.status(403).json({ error: "Unauthorized" });
    };

    const updated = await pool.query(
      "UPDATE messages SET message=$1, is_edited=true, edited_at=NOW() WHERE id=$2 RETURNING *",
      [message, id]
    );

    res.json(updated.rows[0]);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

