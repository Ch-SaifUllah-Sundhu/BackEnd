// Import express (but you typed expree → must be express)
import expree from "express";
import cookieParser from "cookie-parser";   // Parse cookies from request
import cors from "cors";                    // Allow cross-origin requests (frontend ↔ backend)
import helmet from "helmet";                // Security headers
import rateLimit from "express-rate-limit"; // Prevent too many requests (brute force attacks)

const app = expree(); // Create express app

// 🛡️ Add helmet for security
app.use(helmet());

// 🛡️ Apply rate limiting (100 requests per 15 minutes per IP)
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100
}));

// 🛡️ CORS (Cross-Origin Resource Sharing)
app.use(cors({
    origin: process.env.FRONTEND_URL, // only allow your frontend URL
    credentials: true                 // allow cookies & credentials
}));

// 🍪 Parse cookies automatically
app.use(cookieParser());

// 📦 Parse incoming JSON and URL encoded data
app.use(expree.json({ limit: "20kb" })); // limit request size
app.use(expree.urlencoded({ extended: true, limit: "20kb" }));

// 📂 Serve static files from /public folder
app.use(expree.static("public"));

// ---------------- ROUTES ----------------
import userRoutes from "./routes/user.routes.js";
app.use("/api/v1/users", userRoutes); // All user-related routes

// ---------------- GLOBAL ERROR HANDLER ----------------
// This middleware runs if any error is thrown
app.use((err, req, res, next) => {
    console.error(err);

    // Make sure statusCode is always a number
    const statusCode = typeof err.statusCode === "number" ? err.statusCode : 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        // Show stack trace only in development
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
});

export { app };
