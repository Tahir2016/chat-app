const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    // check if email already exists
    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hashed],
    );

    res.json(result.rows[0]);
    
  } catch (error) {
    console.error("Register Error :", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]
      
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token });

  } catch (error) {
    console.error("Login Error :", error);
    res.status(500).json({ error: "Server Error" });
  }
};

exports.forgotPassword = async (req, res) =>{
    try{
        const {email} = req.body;

        if(!email){
            return res.status(400).json({error : "Email is required"});
        };

        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        const user = result.rows[0];

        if(!user){
            return res.status(400).json({error : "User not found"});
        };

        const resetToken = crypto.randomBytes(32).toString('hex');

        const expiry = new Date(Date.now() + 15 * 60 * 1000);

        await pool.query(
            "UPDATE users SET reset_token=$1, reset_token_expiry=$2 WHERE email=$3",
            [resetToken, expiry, email]
        );

        res.json({
            message : "Reset token generated",
            resetToken,
        });
    } catch(error){
        console.error("Forgot Password Error :", error);
        res.status(500).json({error : "Server Error"});
    }
};

exports.resetPassword = async (req, res)=>{
    try{
        const {token, resetPassword} = req.body;

        if(!token || !resetPassword){
            return res.status(400).json({error : "Token and password are required"});
        };

        const result = await pool.query(
            "SELECT * FROM users WHERE reset_token=$1",
            [token]
        );

        const user = result.rows[0];

        if(!user){
            return res.status(400).json({error : "Invalid token"});
        };

        if(new Date(user.reset_token_expiry) < new Date()){
            return res.status(400).json({error : "Token expired"});
        };

        const hashedPassword = await bcrypt.hash(resetPassword, 10);

        await pool.query(
            `UPDATE users
            SET password=$1, reset_token=NULL, reset_token_expiry=NULL WHERE id=$2`,
            [hashedPassword, user.id]
        );

        res.json({message : "Password reset successfully...!!"});

    } catch(error){
        console.error("Reset Password Erorr :", error);
        res.status(500).json({error : "Server Error"});
    }
};


