import express from "express";
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router.js";
import cors from "cors";

// Initialize app
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    res.header(
        "Access-Control-Allow-Origin",
        "https://auth-app-awka.vercel.app"
    ); // Allow requests from your frontend URL
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight requests
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    next();
});

app.use(
    cors({
        origin: "https://auth-app-awka.vercel.app", // Allow all origins
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow all methods
        credentials: true,
    })
);

// Routes
app.get("/", (req, res) => {
    res.send("API WORKING");
});
app.use("/api/auth", authRouter);

// Error handler
app.use((err, req, res, next) => {
    const code = err.code || 500;
    const msg = err.message || "INTERNAL SERVER ERROR";

    res.status(code).json({
        success: false,
        message: msg,
        code: code,
    });
});

// Running server
app.listen(port, () => {
    ConnectDB();
    console.log(`Server running on port ${port}`);
});
