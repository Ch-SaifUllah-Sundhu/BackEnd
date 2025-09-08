import expree from "express";
import cookieParser from "cookie-parser"
import cors from "cors"

const app = expree();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}));

app.use(cookieParser());
app.use(expree.json({limit : "20kb"}));
app.use(expree.urlencoded({ extended: true , limit : "20kb"}));
app.use(expree.static("public"));

export { app }