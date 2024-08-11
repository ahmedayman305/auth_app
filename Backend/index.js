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
app.use(
    cors({
        origin: "https://auth-app-awka.vercel.app", // Replace with your frontend's origin
        methods: "GET,POST",
        credentials: true, // Allow cookies and other credentials to be included
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
