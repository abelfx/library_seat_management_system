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

      // Navigate to dashboard or home page
      navigate("/onboarding/business-details");
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 p-4">
      {/* Sign Up Button */}
      <div className="absolute top-8 right-8 hidden sm:block">
        <Link
          to="/signup"
          className="bg-white text-gray-700 rounded-full px-6 py-2 text-lg font-medium flex items-center space-x-2 hover:bg-blue-50 transition duration-300 shadow-md"
        >
          <User className="text-blue-600" />
          <span>Sign Up</span>
        </Link>
      </div>

      {/* Login Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-w-md w-full mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <label className="block text-gray-700 mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          </div>

          {/* Remember Me Switch */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-gray-700">
                Remember me
              </label>
            </div>
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
            >
              <Key size={16} className="mr-1" />
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200 flex items-center justify-center ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <span>{isLoading ? "Logging in..." : "Login"}</span>
            {!isLoading && <ArrowRight size={20} className="ml-2" />}
          </button>

          {/* Sign in with Google */}
          <button
            className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-indigo-400 text-gray-300 rounded-full py-3 px-6 flex items-center justify-center text-lg sm:text-xl font-medium hover:bg-opacity-100 hover:bg-blue-50 hover:text-blue-400 transition duration-300 shadow-lg"
            onClick={handleGoogleSignIn} // Use the updated handler
          >
            <GoogleIcon className="mr-3" />
            Login with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
