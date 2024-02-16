const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res, next)=>{
     const {firstName, lastName, email, password} = req.body;
     if(!firstName|| !lastName || !email || !password){
          return res.status(400).json({message: "All fields are required"});
     }
     const foundUser = await User.findOne({email}).exec();
     if(foundUser){
         return res.status(401).json({message: "User already exist"});
     }

     const hashPassword = await bcrypt.hash(password, 10);
     const user = await User.create({
          firstName, lastName, email, password: hashPassword,
     });

     
     const accessToken = jwt.sign({
          UserInfo:{
               id:user._id,
          }
     }, process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: "15m"},
      );

     const refreshToken = jwt.sign({
          UserInfo:{
               id:user._id,
          }
     }, process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: "7d"},
     );

     res.cookie("jwt", refreshToken, {
          httpOnly: true, //accessible only by web server
          secure: true, //https
          sameSite: "None",
          maxAge:7 * 24 * 60 * 60 * 1000,
     });
     
     res.json({
          accessToken,
          firstName: user.fistName,
          lastName: user.lastName,
          email: user.email,
     });
};
const login = async (req, res, next)=>{
     const {email, password} = req.body;
     if(!email || !password){
          return res.status(400).json({message: "All fields are required"});
     }
     const foundUser = await User.findOne({email}).exec();
     if(!foundUser){
         return res.status(401).json({message: "User dose not exist"});
     }

     const matchPassword = await bcrypt.compare(password, foundUser.password);
     if(!matchPassword) return res.status(401).json({message: "Wrong password"});
     
     const accessToken = jwt.sign({
          UserInfo:{
               id:foundUser._id,
          }
     }, process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: "15m"},
      );

     const refreshToken = jwt.sign({
          UserInfo:{
               id:foundUser._id,
          }
     }, process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: "7d"},
     );

     res.cookie("jwt", refreshToken, {
          httpOnly: true, //accessible only by web server
          secure: true, //https
          sameSite: "None",
          maxAge:7 * 24 * 60 * 60 * 1000,
     });
     
     res.json({
          message:"logged successfully", 
          accessToken,
          email: foundUser.email,
     });
};

const refresh = (req, res)=>{
     const cookies = req.cookies;
     if(!cookies?.jwt) return res.status(401).json({message: "Unauthorized"});
     const refreshToken = cookies.jwt;
     jwt.verify(refresh, process.env.ACCESS_TOKEN_SECRET,async (err, decoded)=>{
          if(err) return res.status(403).json({message: "Forbidden"});
          const foundUser = await User.findById(decoded.UserInfo.id).exec();
          if(!foundUser) return res.status(401).json({message: "Unauthorized"});
          const accessToken = jwt.sign({
               UserInfo:{
                    id:foundUser._id,
               }
          }, process.env.ACCESS_TOKEN_SECRET,
           {expiresIn: "15m"},
           );
     
          res.json({accessToken});
     });
};

const logout = async (req, res)=>{
     const cookies = req.cookies;
     if(!cookies?.jwt) return res.sendStatus(204);

     res.clearCookies("jwt", {
          httpOnly: true,
          sameSite: "None",
          secure: true,
     });

     res.json({message: "logged out successfully"});


};

module.exports = {
     register,
     login,
     refresh,
     logout,
}