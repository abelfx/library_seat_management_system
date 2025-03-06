import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../../firebase/auth";
import ZenSocLogo from "../../assets/ZenSocLogo.svg";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import GoogleIcon from "@mui/icons-material/Google";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const Welcome = () => {
  const navigate = useNavigate(); // Initialize navigation

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle(); // Sign in the user
      navigate("/home"); // Redirect to home page after login
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 p-6">
      {/* Login Button - Top Left */}
      <div className="absolute top-12 right-12">
        <Link
          to="/login"
          className="bg-white text-gray-700 rounded-full px-6 py-2 text-lg sm:text-xl font-medium flex items-center space-x-2 hover:bg-blue-50 transition duration-300 shadow-md"
        >
          <PersonIcon className="text-blue-600" />
          <span>Login</span>
        </Link>
      </div>

      {/* Logo */}
      <div className="relative w-full max-w-md">
        <div className="flex justify-center items-center mb-16 ml-30">
          <img
            src={ZenSocLogo}
            alt="ZenSoc Logo"
            className="w-200 sm:w-56 md:w-200"
          />
        </div>

        {/* Buttons */}
        <div className="space-y-4">
          {/* Try for Free Button */}
          <Link
            to="/signup"
            className="w-full rounded-full max-w-xs sm:max-w-sm md:max-w-md bg-white border-2 border-white text-blue-600 py-3 px-6 flex items-center justify-center text-lg sm:text-xl font-medium hover:bg-neutral-200 hover:text-blue-950 transition duration-300 shadow-md"
          >
            Try for Free
            <ChevronRightIcon className="ml-2" />
          </Link>
          {/* Sign in with Google */}
          <button
            className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-indigo-400 text-gray-300 rounded-full py-3 px-6 flex items-center justify-center text-lg sm:text-xl font-medium hover:bg-opacity-100 hover:bg-blue-50 hover:text-blue-400 transition duration-300 shadow-lg"
            onClick={handleGoogleSignIn} // Use the updated handler
          >
            <GoogleIcon className="mr-3" />
            Sign up with Google
          </button>

          {/* Sign up with Email */}
          <Link
            to="/signup"
            className="w-full max-w-xs sm:max-w-sm md:max-w-md bg-indigo-400 text-gray-300 rounded-full py-3 px-6 flex items-center justify-center text-lg sm:text-xl font-medium hover:bg-opacity-100 hover:bg-blue-50 hover:text-blue-400 transition duration-300 shadow-lg"
          >
            <EmailIcon className="mr-3" />
            Sign up with E-mail
          </Link>

          {/* Terms and Privacy Policy */}
          {/* <p className="text-center text-white mt-6 text-sm sm:text-base">
            By creating an account, you agree to our <br />
            <Link to="/terms" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default Welcome;
