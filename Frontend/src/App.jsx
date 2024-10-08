// import lib's functions
import {
    createBrowserRouter,
    RouterProvider,
    Navigate,
} from "react-router-dom";
// import pages
import Dashboard from "./page/Dashboard";
import SignIn from "./page/SignIn";
import SignUp from "./page/SignUp";
import VerifyEmail from "./page/VerifyEmail.jsx";
import ResetPassword from "./page/ResetPassword";
// import ui componet
import FloatingShape from "./components/FloatingShape";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import LoadingSpinner from "./components/LoadingSpinner";
import { useEffect } from "react";
import ForgetPassword from "./page/ForgetPassword";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (!isAuthenticated) {
        return <Navigate to="/sign-in" replace />;
    }

    if (!user.isVerified) {
        return <Navigate to="/verify-email" replace />;
    }

    return children;
};

const RedirectAuthenticatedUser = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    if (isAuthenticated && user.isVerified) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const router = createBrowserRouter([
    {
        index: true,
        element: (
            <ProtectedRoute>
                <Dashboard />
            </ProtectedRoute>
        ),
    },
    {
        path: "/sign-in",
        element: (
            <RedirectAuthenticatedUser>
                <SignIn />
            </RedirectAuthenticatedUser>
        ),
    },
    {
        path: "/sign-up",
        element: (
            <RedirectAuthenticatedUser>
                <SignUp />
            </RedirectAuthenticatedUser>
        ),
    },
    {
        path: "/verify-email",
        element: (
            <RedirectAuthenticatedUser>
                <VerifyEmail />
            </RedirectAuthenticatedUser>
        ),
    },
    {
        path: "/forgot-password",
        element: <ForgetPassword />,
    },
    {
        path: "/reset-password/:token",
        element: (
            <RedirectAuthenticatedUser>
                <ResetPassword />
            </RedirectAuthenticatedUser>
        ),
    },
]);

function App() {
    const { isCheckingAuth, checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth) {
        return <LoadingSpinner />;
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex 
                    items-center justify-center relative overflow-hidden"
        >
            <FloatingShape
                color="bg-green-500"
                size="w-64 h-64"
                top="-5%"
                left="10%"
                delay={0}
            />
            <FloatingShape
                color="bg-emerald-500"
                size="w-48 h-48"
                top="70%"
                left="80%"
                delay={5}
            />
            <FloatingShape
                color="bg-lime-500"
                size="w-32 h-32"
                top="40%"
                left="-10%"
                delay={2}
            />
            <RouterProvider router={router} />
            <Toaster />
        </div>
    );
}

export default App;
