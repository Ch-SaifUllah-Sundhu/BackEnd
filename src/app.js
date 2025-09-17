import expree from "express";
import cookieParser from "cookie-parser"
import cors from "cors"
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = expree();

app.use(helmet());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials:true
}));

app.use(cookieParser());
app.use(expree.json({limit : "20kb"}));
app.use(expree.urlencoded({ extended: true , limit : "20kb"}));
app.use(expree.static("public"));

//routes
import userRoutes from "./routes/user.routes.js"
app.use("/api/v1/users", userRoutes)

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

export { app }