const jwt = require("jsonwebtoken");

module.exports = (req, res, next) =>{
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({error : "Access Denied..!!"})
        };

        const token = authHeader.split(" ")[1];

        if(!token){
            return res.status(401).json({error : "Access Denied..!!"})
        };

        const decode = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decode;

        next();

    } catch(error){
        if(error.name === "JsonWebTokenError" || error.name === "TokenExpiredError"){
            return res.status(401).json({error : "Invalid or expired token"});
        };
        console.error("Auth Error : ", error);
        res.status(500).json({error : "Internal Server Error"});
    }
};