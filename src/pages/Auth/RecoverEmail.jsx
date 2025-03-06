import React, { useState } from "react";
import { TextField, Button, CircularProgress } from "@mui/material";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

const EmailVerification = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const navigate = useNavigate();

  // Check if user exists
  const checkUserExists = async (email) => {
    try {
      const userDocRef = doc(db, "users", email);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return true;
      }

      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking user:", error);
      return false;
    }
  };

  // Send password reset email
  const handleSendEmail = async () => {
    setError("");
    setLoading(true);

    try {
      const userExists = await checkUserExists(email);

      if (!userExists) {
        throw new Error("No account found with this email address");
      }

      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      setError(
        error.message ||
          "Could not send email. Please check your email address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle "Continue" button
  const handleContinue = () => {
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700">
      <div className="absolute top-12 right-12">
        <Link
          to="/login"
          className="bg-white text-gray-700 rounded-full px-6 py-2 text-lg sm:text-xl font-medium flex items-center space-x-2 hover:bg-blue-50 transition duration-300 shadow-md"
        >
          <PersonIcon className="text-blue-600" />
          <span>Login</span>
        </Link>
      </div>

      <div
        className="bg-blue-400/10 inset-shadow-sm inset-shadow-indigo-400 rounded-3xl p-10 max-w-md w-full mx-4"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        <h1 className="text-white text-3xl font-bold mb-10 text-center">
          {emailSent ? "Email Sent" : "Reset Password"}
        </h1>

        {!emailSent ? (
          <>
            <div className="mb-6">
              <label className="block text-white mb-2">Email</label>
              <TextField
                fullWidth
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                variant="outlined"
                required
                InputProps={{
                  style: {
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                  },
                  startAdornment: <EmailIcon className="mr-2 text-gray-400" />,
                }}
              />
            </div>

            {error && (
              <div className="mb-4 text-red-100 text-center font-medium">
                {error}
              </div>
            )}

            <Button
              fullWidth
              variant="contained"
              onClick={handleSendEmail}
              disabled={loading}
              className="rounded-full py-3"
              style={{
                backgroundColor: "white",
                color: "#0891B2",
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="primary" />
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="mb-6 text-white text-center">
              <p className="mb-4">We've sent a password reset link to:</p>
              <p className="font-medium text-xl mb-6">{email}</p>
              <p>
                Please check your email and follow the instructions to reset
                your password.
              </p>
            </div>

            <Button
              fullWidth
              variant="contained"
              onClick={handleContinue}
              endIcon={<ArrowRight />}
              className="rounded-full py-3"
              style={{
                backgroundColor: "white",
                color: "#0891B2",
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              Continue
            </Button>

            <Button
              fullWidth
              variant="text"
              onClick={() => {
                setEmailSent(false);
                setEmail("");
              }}
              className="mt-4"
              style={{
                color: "white",
                textTransform: "none",
              }}
            >
              Use different email
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
