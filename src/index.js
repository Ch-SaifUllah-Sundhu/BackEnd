//require("dotenv").config({path});
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./.env"
});
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 3000,()=>{
        console.log(`Server started on port ${process.env.PORT}`);
       })
       app.on("error", (err)=>{
        console.error("Error",err);
        throw err
       })
})
.catch((err)=>{
    console.error("Database connection error", err);
    process.exit(1);
})


















/*
import exprees from "express";
const app = exprees();

(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
       app.on("error", (err)=>{
        console.error("Error",err);
        throw err
       })
       app.listen(process.env.PORT,()=>{
        console.log(`Server started on port ${process.env.PORT}`);
       })
    }catch (error) {
        console.error("Error",error);
        throw err
    }
})()
    */