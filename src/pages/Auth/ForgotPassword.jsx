import React, { useState, useEffect } from "react";
import { TextField, Button, InputAdornment, IconButton } from "@mui/material";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  updatePassword,
  confirmPasswordReset,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";

const RecoverPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("Weak");
  const [actionCode, setActionCode] = useState("");
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("reset"); // "reset" or "reauthenticate"
  const [currentPassword, setCurrentPassword] = useState("");
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get the action code and email from URL parameters
    const queryParams = new URLSearchParams(location.search);
    const oobCode = queryParams.get("oobCode");
    const emailParam = queryParams.get("email");

    if (oobCode) {
      setActionCode(oobCode);
    }

    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  // Check password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength("Weak");
      return;
    }

    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumbers = /\d/.test(newPassword);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
    const isLongEnough = newPassword.length >= 8;

    const strengthScore = [
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
      isLongEnough,
    ].filter(Boolean).length;

    if (strengthScore <= 2) setPasswordStrength("Weak");
    else if (strengthScore <= 4) setPasswordStrength("Medium");
    else setPasswordStrength("Strong");
  }, [newPassword]);

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setError("");
    setLoading(true);

    try {
      if (actionCode) {
        // For users coming from email link
        await confirmPasswordReset(auth, actionCode, newPassword);
        // Password update successful
        setSuccess(true);
        // We'll navigate to login after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        // For users who are already signed in but need to reauthenticate
        const user = auth.currentUser;
        if (user) {
          try {
            // First try to update password directly
            await updatePassword(user, newPassword);
            // If successful, set success state
            setSuccess(true);
            // Navigate to login after a short delay
            setTimeout(() => {
              navigate("/login");
            }, 3000);
          } catch (innerError) {
            // If we get a requires-recent-login error, switch to reauthentication mode
            if (innerError.code === "auth/requires-recent-login") {
              setMode("reauthenticate");
              if (!email && user.email) {
                setEmail(user.email);
              }
              setError(
                "For security reasons, please re-enter your current password to continue"
              );
            } else {
              throw innerError;
            }
          }
        } else {
          // No user is signed in, redirect to email verification page
          setError(
            "Session expired. Please restart the password reset process."
          );
          setTimeout(() => {
            navigate("/email-verification");
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/invalid-action-code") {
        setError(
          "This password reset link has expired. Please request a new one."
        );
      } else {
        setError(error.message || "Failed to update password");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReauthenticate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user is currently signed in");
      }

      // Create credential with email and password
      const credential = EmailAuthProvider.credential(
        email || user.email,
        currentPassword
      );

      // Reauthenticate
      await reauthenticateWithCredential(user, credential);

      // Now update the password
      await updatePassword(user, newPassword);

      // Success
      setSuccess(true);

      // Navigate to login after success message
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      console.error("Reauthentication error:", error);
      if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else {
        setError(error.message || "Failed to authenticate");
      }
    } finally {
      setLoading(false);
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "Strong":
        return "text-green-500";
      case "Medium":
        return "text-yellow-500";
      case "Weak":
        return "text-red-400";
      default:
        return "text-red-400";
    }
  };

  // Success state view
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700">
        <div
          className="bg-blue-400/10 inset-shadow-sm inset-shadow-indigo-400 rounded-3xl p-10 max-w-md w-full mx-4"
          style={{
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
          }}
        >
          <h1 className="text-white text-3xl font-bold mb-6 text-center">
            Password Updated!
          </h1>
          <div className="mb-6 text-white text-center">
            <p className="mb-4">Your password has been successfully updated.</p>
            <p>Redirecting to login page...</p>
          </div>
          <Button
            fullWidth
            variant="contained"
            onClick={() => navigate("/login")}
            className="rounded-full py-3"
            style={{
              backgroundColor: "white",
              color: "#0891B2",
              textTransform: "none",
              boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
            }}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700">
      {/* Login Button */}
      <div className="absolute top-8 right-8">
        <Link
          to="/login"
          className="bg-white text-blue-600 rounded-full px-6 py-2 text-lg sm:text-xl font-medium flex items-center space-x-2 hover:bg-blue-50 transition duration-300 shadow-md"
        >
          <PersonIcon className="text-blue-600" />
          <span>Login</span>
        </Link>
      </div>
      {/* Recovery Card */}
      <div
        className="bg-blue-400/10 inset-shadow-sm inset-shadow-indigo-400 rounded-3xl p-10 max-w-md w-full mx-4"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.18)",
        }}
      >
        {mode === "reset" ? (
          <form onSubmit={handlePasswordReset}>
            <h1 className="text-white text-3xl font-bold mb-10 text-center">
              Recover password
            </h1>

            {/* New Password Field */}
            <div className="mb-6">
              <label className="block text-white mb-2">New password</label>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                variant="outlined"
                required
                InputProps={{
                  style: {
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.05)",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <span className={`mr-2 text-sm ${getStrengthColor()}`}>
                        {passwordStrength}
                      </span>
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Confirm Password Field */}
            <div className="mb-10">
              <label className="block text-white mb-2">Repeat password</label>
              <TextField
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="8-12 Characters"
                variant="outlined"
                required
                InputProps={{
                  style: {
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.05)",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        edge="end"
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-100 text-center">{error}</div>
            )}

            {/* Recover Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              endIcon={<ArrowRight />}
              className="rounded-full py-3"
              style={{
                backgroundColor: "white",
                color: "#0891B2",
                textTransform: "none",
                boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
              }}
            >
              {loading ? "Processing..." : "Recover"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReauthenticate}>
            <h1 className="text-white text-3xl font-bold mb-6 text-center">
              Verification Required
            </h1>

            <p className="text-white text-center mb-6">
              For security reasons, please verify your identity before changing
              your password.
            </p>

            {/* Email Field */}
            <div className="mb-4">
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
                    boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.05)",
                  },
                }}
              />
            </div>

            {/* Current Password Field */}
            <div className="mb-6">
              <label className="block text-white mb-2">Current Password</label>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                variant="outlined"
                required
                InputProps={{
                  style: {
                    borderRadius: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    boxShadow: "0 2px 10px 0 rgba(0, 0, 0, 0.05)",
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-100 text-center">{error}</div>
            )}

            {/* Button Group */}
            <div className="flex flex-col space-y-3">
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                className="rounded-full py-3"
                style={{
                  backgroundColor: "white",
                  color: "#0891B2",
                  textTransform: "none",
                  boxShadow: "0 4px 14px 0 rgba(0, 0, 0, 0.1)",
                }}
              >
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setMode("reset")}
                style={{
                  color: "white",
                  textTransform: "none",
                }}
              >
                Back
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecoverPassword;
