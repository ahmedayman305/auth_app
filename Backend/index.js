import express from "express";
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Initialize app
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.CLIENT_URL, // Allow only your frontend's origin
        methods: "GET,POST", // Allow specific HTTP methods
        credentials: true, // Allow cookies and other credentials to be included
    })
);

// Routes
app.use("/api/auth", authRouter);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
    });
}

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
