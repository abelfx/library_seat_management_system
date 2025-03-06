import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { getAuth, onAuthStateChanged, reload } from "firebase/auth";
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {isVerified ? (
          <div className="space-y-4">
            <CheckCircle className="mx-auto text-green-500" size={64} />
            <h1 className="text-2xl font-bold text-gray-800">
              Email Verified!
            </h1>
            <p className="text-gray-600">
              Your email has been successfully verified. You will be redirected
              to the login page shortly.
            </p>
            <Link
              to="/login"
              className="block w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <Mail className="mx-auto text-blue-500" size={64} />
            <h1 className="text-2xl font-bold text-gray-800">
              Verify Your Email
            </h1>
            <p className="text-gray-600">
              We've sent a verification link to{" "}
              <span className="font-medium">{email}</span>
            </p>
            <p className="text-gray-500 text-sm">
              Please check your inbox and click the verification link to
              complete your registration. Check your spam folder if you don't
              see it.
            </p>

            {error && (
              <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={checkVerification}
                disabled={loading}
                className="mr-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
              >
                <RefreshCw className="inline mr-1" size={16} />
                {loading ? "Checking..." : "Check Status"}
              </button>

              <button
                onClick={handleResendVerification}
                disabled={loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition duration-200 disabled:bg-gray-100"
              >
                Resend Email
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
