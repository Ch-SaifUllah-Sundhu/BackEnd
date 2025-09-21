// Import express
import express from "express";
import cookieParser from "cookie-parser";   // Parse cookies from request
import cors from "cors";                    // Allow cross-origin requests (frontend ↔ backend)
import helmet from "helmet";                // Security headers
import rateLimit from "express-rate-limit"; // Prevent too many requests (brute force attacks)

const app = express(); // Create express app

// 🛡️ Add helmet for security
app.use(helmet());

// 🛡️ Apply rate limiting (100 requests per 15 minutes per IP)
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
}));

// 🛡️ CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true
}));

// 🍪 Parse cookies automatically
app.use(cookieParser());

// 📦 Parse incoming JSON and URL encoded data
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "20kb" }));

// 📂 Serve static files from /public folder
app.use(express.static("public"));

// ---------------- ROUTES ----------------
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes);

// ---------------- GLOBAL ERROR HANDLER ----------------
app.use((err, req, res, next) => {
    console.error(err);

    const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app };
