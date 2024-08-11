import { motion } from "framer-motion";
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Input from "../components/Input";
import { Loader, Lock, Check, Undo } from "lucide-react";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [retypePassword, setRetypePassword] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { token } = useParams();

    console.log(token);
    const { isLoading, resetPassword, errorSetter, error } = useAuthStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password === retypePassword) {
            try {
                await resetPassword(token, password);
                setIsSubmitted(true);
            } catch (error) {
                errorSetter("Failed to reset password. Please try again.");
            }
        } else {
            errorSetter("Passwords do not match.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="p-8">
                <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
                    Set Your New Password
                </h2>

                {!isSubmitted ? (
                    <>
                        <form onSubmit={handleSubmit}>
                            <Input
                                icon={Lock}
                                type="password"
                                placeholder="New password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Input
                                icon={Undo}
                                type="password"
                                placeholder="Retype password"
                                value={retypePassword}
                                onChange={(e) =>
                                    setRetypePassword(e.target.value)
                                }
                                required
                            />
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
                                type="submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader className="w-6 h-6 animate-spin mx-auto" />
                                ) : (
                                    "Submit"
                                )}
                            </motion.button>
                            {error && (
                                <p className="text-red-500 font-semibold text-center my-3">
                                    {error}
                                </p>
                            )}
                        </form>
                        <PasswordStrengthMeter password={password} />
                    </>
                ) : (
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                                type: "spring",
                                stiffness: 500,
                                damping: 30,
                            }}
                            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <Check className="h-8 w-8 text-white" />
                        </motion.div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200"
                        >
                            <Link to="/sign-in" className="w-full block">
                                Go to Login
                            </Link>
                        </motion.button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ResetPassword;
