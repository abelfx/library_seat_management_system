import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  getAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification,
} from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { Mail, CheckCircle, RefreshCw } from "lucide-react";

const EmailVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const email = location.state?.email || "";
  const auth = getAuth();

  const checkVerification = async () => {
    setLoading(true);
    try {
      // Reload user to get latest verification status
      if (auth.currentUser) {
        await reload(auth.currentUser);

        if (auth.currentUser.emailVerified) {
          setIsVerified(true);

          // Update user verification status in Firestore
          const db = getFirestore();
          await updateDoc(doc(db, "users", auth.currentUser.uid), {
            emailVerified: true,
          });

          // Auto redirect after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        }
      }
    } catch (err) {
      console.error("Error checking verification status:", err);
      setError("Failed to check verification status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      await sendEmailVerification(auth.currentUser);
      alert("Verification email has been resent!");
    } catch (error) {
      console.error("Error resending verification email:", error);
      setError("Failed to resend verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check verification status every 3 seconds
    const interval = setInterval(checkVerification, 3000);

    // Initial check
    checkVerification();

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

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

        {/* Right side - Verification Content */}
        <div className="w-1/2 p-8 flex items-center">
          <div className="w-full">
            {isVerified ? (
              <div className="text-center">
                <CheckCircle
                  className="mx-auto text-green-500 mb-4"
                  size={48}
                />
                <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
                <p className="text-gray-600 mb-8">
                  Your email has been successfully verified. You will be
                  redirected to the login page shortly.
                </p>
                <Link
                  to="/login"
                  className="w-full p-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors inline-block"
                >
                  Go to Login
                </Link>
              </div>
            ) : (
              <div>
                <div className="text-center mb-8">
                  <Mail className="mx-auto text-gray-900 mb-4" size={48} />
                  <h1 className="text-2xl font-bold mb-2">Verify Your Email</h1>
                  <p className="text-gray-600">
                    We've sent a verification link to{" "}
                    <span className="font-medium">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <p className="text-gray-600 text-sm">
                    Please check your inbox and click the verification link to
                    complete your registration. Check your spam folder if you
                    don't see it.
                  </p>

                  <button
                    onClick={checkVerification}
                    disabled={loading}
                    className="w-full p-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    <RefreshCw
                      className={`mr-2 ${loading ? "animate-spin" : ""}`}
                      size={20}
                    />
                    {loading ? "Checking..." : "Check Status"}
                  </button>

                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="w-full p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Resend Verification Email
                  </button>
                </div>

                <p className="text-center mt-6 text-sm text-gray-600">
                  Already verified?{" "}
                  <Link
                    to="/login"
                    className="text-blue-500 hover:underline font-medium"
                  >
                    Login Now
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
