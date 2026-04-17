const pool = require("../config/db");

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Name is required" });
        }

        const result = await pool.query(
            "UPDATE users SET name=$1 WHERE id=$2 RETURNING id, name, email",
            [name.trim(), userId]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE id=$1",
            [userId]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Get Profile Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

exports.searchUsers = async (req, res) =>{
    try{
        const {query} = req.query;

        if(!query){
            return res.status(400).json({error : "Search Query Required"})
        };

        const result = await pool.query(
            "SELECT id, name, email FROM users WHERE name ILIKE $1",
            [`%${query}%`]
        );

        res.json(result.rows);

    } catch(error){
        console.error("Search Users Error :", error);
        res.status(500).json({error : "Internal Server Error"});
    }
};