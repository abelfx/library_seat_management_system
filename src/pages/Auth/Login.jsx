import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Eye, EyeOff, ArrowRight, Key, User } from "lucide-react";
import GoogleIcon from "@mui/icons-material/Google";
import { signInWithGoogle } from "../../firebase/auth";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Check if email is verified
      if (!user.emailVerified) {
        // Sign out the user since email is not verified
        await signOut(auth);
        setError(
          "Email not verified. Please check your email for verification link."
        );
        setIsLoading(false);
        return;
      }

      console.log("User logged in successfully:", user.uid);

      // Store remember me preference if selected
      if (rememberMe) {
        localStorage.setItem("rememberEmail", formData.email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // Navigate to home page after successful login
      navigate("/home");
    } catch (error) {
      console.error("Error logging in:", error);

      // Handle specific error codes
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (error.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.");
      } else {
        setError("Failed to log in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle(); // Sign in the user
      navigate("/home"); // Redirect to home page after login
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  const handleForgotPassword = () => {
    navigate("/recover-email");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl flex max-w-3xl w-full">
        {/* Left side - Black Panel */}
        <div className="w-1/2 bg-black text-white p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-6">
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 text-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 20 Q 35 10, 50 20 Q 65 30, 80 20 L 80 80 Q 65 70, 50 80 Q 35 90, 20 80 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                d="M20 30 Q 35 20, 50 30 Q 65 40, 80 30"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                d="M20 40 Q 35 30, 50 40 Q 65 50, 80 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">ZenSoc</h2>
          <p className="text-sm">
            Not Your Average Web - Simplify, Organize, Achieve!
          </p>
        </div>

        {/* Right side - Login Form */}
        <div className="w-1/2 p-8 flex items-center">
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Login</h1>
            <p className="text-gray-600 mb-8">
              Welcome back! Glad to see you, Again!
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 text-sm text-gray-600"
                  >
                    Remember me
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-blue-500 hover:underline text-sm"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full p-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                <GoogleIcon className="mr-2" />
                Login with Google
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-500 hover:underline font-medium"
              >
                Register Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
