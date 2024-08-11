// packages import
import bcrypt from "bcrypt";
import crypto from "crypto";

// local import
import { User } from "../models/user.model.js";
import throwError from "../utils/throwError.js";
import generateToken from "../utils/generateToken.js";
import {
    sendVerification,
    sendPasswordResetEmail,
    sendPasswordResetSuccessEmail,
} from "../config/nodeMiller.js";

// signIn function
export const signIn = async (req, res, next) => {
    try {
        // Extract email & password from the request body
        const { email, password } = req.body;

        // Try to find the user by email in the database
        const user = await User.findOne({ email });

        // If the user is not found in the database, throw an error with code 400 to the error handler middleware
        if (!user) {
            return next(throwError(400, "Invalid credentials"));
        }

        // If the user exists, check if the provided password matches the password in the database
        const isPasswordValid = await bcrypt.compare(password, user.password);

        // If the password doesn't match, throw an error with code 400 to the error handler middleware
        if (!isPasswordValid) {
            return next(throwError(400, "Invalid credentials"));
        }

        // If the password matches, generate a JWT token for the user and set it in the cookies
        generateToken(res, user._id);

        // Update the user's last login time and save it in the database
        user.lastLogin = new Date();
        await user.save();

        // Send a response with code 200 and user data excluding the password
        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });

        // If there is any other error, handle it by passing it to the error handler middleware
    } catch (error) {
        console.log("Error: " + error);
        next(error);
    }
};

// signUp function
export const signUp = async (req, res, next) => {
    const { email, name, password } = req.body;

    try {
        // Check if all required fields (email, name, password) are provided
        if (!email || !name || !password) {
            return next(throwError(401, "All fields are required"));
        }

        // Check if a user with the provided email already exists in the database
        const userAlreadyExist = await User.findOne({ email });

        // If the user already exists, throw an error with code 400 to the error handler middleware
        if (userAlreadyExist) {
            return next(throwError(400, "This email is already taken"));
        }

        // Hash the provided password for secure storage
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Generate a verification token
        const verificationToken = Math.floor(
            100000 + Math.random() * 900000
        ).toString();

        // Create a new user instance with the provided details and the generated token
        const newUser = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, // Token expires in 24 hours
        });

        // Save the new user to the database
        await newUser.save();

        // Generate a JWT token for the user and set it in the cookies
        generateToken(res, newUser._id);

        // Send a verification email to the user with the generated verification token
        sendVerification(newUser.email, verificationToken);

        // Send a response with code 201 and user data excluding the password
        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...newUser._doc,
                password: undefined, // Exclude the password from the response
            },
        });

        // If there is any other error, handle it by passing it to the error handler middleware
    } catch (error) {
        next(error);
    }
};

// logout function
export const logout = async (req, res, next) => {
    try {
        // Clear the JWT token from the cookies
        res.clearCookie("token");

        // Send a response with code 200 indicating successful logout
        res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (error) {
        // Handle any errors by passing them to the error handler middleware
        next(error);
    }
};

// verifyEmail function
export const verifyEmail = async (req, res, next) => {
    const { code } = req.body;

    try {
        // Find the user by the verification token and check if the token has not expired
        const user = await User.findOne({
            verificationToken: code,
        });

        // If no user is found or the token is expired, throw an error with code 400 to the error handler middleware
        if (!user) {
            return next(
                throwError(400, "Invalid or Expired verification code")
            );
        }

        // Mark the user as verified by setting 'isVerified' to true
        user.isVerified = true;

        // Clear the verification token and expiration time from the user's data
        user.verificationToken = undefined;
        user.verificationExpiresAt = undefined;

        // Save the updated user data in the database
        await user.save();

        // Send a response with code 200 indicating that the email was verified successfully
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            ...user,
            password: undefined,
        });

        // Handle any errors by passing them to the error handler middleware
    } catch (error) {
        next(error);
    }
};

// forget password function
export const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });

        if (!user) next(throwError(400, "User not found"));

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resetTokenExpiresAt;

        await user.save();

        // send email
        await sendPasswordResetEmail(
            user.email,
            `${process.env.CLIENT_URL}/reset-password/${resetToken}`
        );

        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        console.log("Error in forgotPassword ", error);
        res.status(400).json({ success: false, message: error.message });
    }
};

// reset password function -->> extends forget password function
export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });

        if (!user) next(throwError(400, "Invalid or expired reset token"));

        // update password
        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();

        await sendPasswordResetSuccessEmail(user.email);

        res.status(200).json({
            success: true,
            message: "Password reset successful",
        });
    } catch (error) {
        next(error);
    }
};

// check auth function
export const checkAuth = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return next(throwError(400, "User not found"));

        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};
