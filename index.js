require("dotenv").config();
const express = require("express");
const app = express();
const mongoose =  require("mongoose")
const cookieParser = require("cookie-parser");
const connectDB = require("./config/dbConn");
const cors = require("cors");
const path = require("path")
const corsOption = require("./config/corsOptions");

console.log(process.env.NODE_ENV);
const PORT = process.env.PORT || 5000;

//DB Connection
connectDB();

//middleware
app.use(cors(corsOption));
app.use(cookieParser());
app.use(express.json());

//routes
app.use("/", express.static(path.join(__dirname, "public")));
app.use("/", require("./routes/root"));
app.use("/auth", require("./routes/authRoutes"));

//if user enter route not exist
app.all("*",(req, res, next)=>{
     res.status(404);
     if(req.accepts("html")){
          res.sendFile(path.join(__dirname,"views", "404.html"))
     }else if(req.accepts("json")){
          res.json({message: "404 not found"});
     }else{
          res.type("txt").send("404 not found");
     }
});


mongoose.connection.once("open",()=>{
     console.log("Connected to MongoDB");

     app.listen(PORT, ()=>{
          console.log(`Server running on ${PORT}`);
     });
})

mongoose.connection.on("error",(error)=>{
     console.log("Error: ", error);
})
