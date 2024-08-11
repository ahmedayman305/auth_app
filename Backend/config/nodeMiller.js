import nodemailer from "nodemailer";
import {
    VERIFICATION_EMAIL_TEMPLATE,
    PASSWORD_RESET_SUCCESS_TEMPLATE,
    PASSWORD_RESET_REQUEST_TEMPLATE,
} from "./mail/emailTemplate.js";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail", // Use "service" instead of "host"
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS_KEY,
    },
});

export const sendVerification = (email, id) => {
    const mailOption = {
        from: "Cinematic",
        to: email,
        subject: "VERIFICATION MESSAGE",
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", id),
    };

    transporter.sendMail(mailOption, (err, success) => {
        if (err) {
            console.error("Error sending email:", err);
        } else {
            console.log("Email sent: " + success.response);
        }
    });
};

export const sendPasswordResetEmail = (email, link) => {
    const mailOption = {
        from: "Cinematic",
        to: email,
        subject: "RESET PASSWORD",
        html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", link),
    };

    transporter.sendMail(mailOption, (err, success) => {
        if (err) {
            console.error("Error sending email:", err);
        } else {
            console.log("Email sent: " + success.response);
        }
    });
};

export const sendPasswordResetSuccessEmail = (email) => {
    const mailOption = {
        from: "Cinematic",
        to: email,
        subject: "Success password reset",
        html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    };

    transporter.sendMail(mailOption, (err, success) => {
        if (err) {
            console.error("Error sending email:", err);
        } else {
            console.log("Email sent: " + success.response);
        }
    });
};
