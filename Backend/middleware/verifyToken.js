import jwt from "jsonwebtoken";
import throwError from "../utils/throwError.js";

export const verifyToken = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) return next(throwError(401, "No token provided"));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return next(throwError(401, "Invalid token"));

        req.userId = decoded.id;

        next();
    } catch (err) {
        next(err);
    }
};
