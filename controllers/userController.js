const User = require("../models/User");
const jwt = require("jsonwebtoken");

const getAllUsers =async (req, res, next)=>{
     const users = await User.find().select("-password").lean();
     if(!users.length) return res.status(400).json({message: "No users found"});

    return res.json(users);
};

module.exports = {getAllUsers,};
