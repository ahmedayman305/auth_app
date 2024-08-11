import express from "express";
import dotenv from "dotenv";
import ConnectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.router.js";
import cors from "cors";
import path from "path";

// init app
dotenv.config();
const app = express();
const port = process.env.PORT || 3002;

// middlewares
app.use(express.json());
app.use(cookieParser());

// Alternatively, you can configure it for specific origins
app.use(
    cors({
        origin: "http://localhost:5173", // Allow only your frontend's origin
        methods: "GET,POST", // Allow specific HTTP methods
        credentials: true, // Allow cookies and other credentials to be included
    })
);

// routes
app.use("/api/auth", authRouter);

const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")));

    app.use("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
    });
}

// error handler
app.use((err, req, res, next) => {
    const code = err.code || 500;
    const msg = err.message || "INTERNAL SERVER ERROR";

    res.status(code).json({
        success: false,
        message: msg,
        code: code,
    });
});

// running server
app.listen(port, () => {
    ConnectDB();
    console.log(`app work in ${port}`);
});
