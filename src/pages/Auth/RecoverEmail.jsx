import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";

const EmailVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const navigate = useNavigate();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Send password reset email
  const handleSendEmail = async () => {
    setError("");
    setLoading(true);

    // Check if offline
    if (isOffline) {
      setError(
        "You appear to be offline. Please check your internet connection."
      );
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
    } catch (error) {
      console.error("Failed to send verification email:", error);

      // Handle specific Firebase Auth errors
      switch (error.code) {
        case "auth/user-not-found":
          setError("No account found with this email address.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;
        default:
          setError("Could not send reset email. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle "Continue" button
  const handleContinue = () => {
    navigate("/login");
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
          <h2 className="text-2xl font-bold mb-4">LibrarySeats</h2>
          <p className="text-sm">Your Smart Library Seat Booking Solution</p>
        </div>

        {/* Right side - Reset Password Form */}
        <div className="w-1/2 p-8 flex items-center">
          <div className="w-full">
            {/* Show offline warning if applicable */}
            {isOffline && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-700 rounded-md text-sm">
                You are currently offline. Please check your internet
                connection.
              </div>
            )}

            <h1 className="text-2xl font-bold mb-2">
              {emailSent ? "Email Sent" : "Reset Password"}
            </h1>
            <p className="text-gray-600 mb-8">
              {emailSent
                ? "Please check your email to reset your password"
                : "Enter your email to receive a password reset link"}
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {!emailSent ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendEmail();
                }}
                className="space-y-4"
              >
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || isOffline}
                  className={`w-full p-3 ${
                    isOffline ? "bg-gray-400" : "bg-gray-900 hover:bg-gray-800"
                  } text-white rounded-md transition-colors`}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="mb-4">We've sent a password reset link to:</p>
                  <p className="font-medium text-gray-800">{email}</p>
                </div>

                <button
                  onClick={handleContinue}
                  className="w-full p-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
                >
                  <span>Continue to Login</span>
                  <ArrowRight className="ml-2" size={20} />
                </button>

                <button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                  className="w-full p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Use different email
                </button>
              </div>
            )}

            <p className="text-center mt-6 text-sm text-gray-600">
              Remember your password?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:underline font-medium"
              >
                Login Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
