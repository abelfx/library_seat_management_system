import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { Link, useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Check if user is an admin in Firestore
      const adminDoc = await getDoc(doc(db, "admins", user.uid));

      if (adminDoc.exists()) {
        // User is an admin, redirect to admin dashboard
        navigate("/admin/dashboard");
      } else {
        // User is not an admin
        await auth.signOut();
        setError("You do not have admin privileges");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box className="flex justify-center items-center min-h-screen py-12">
        <Paper elevation={3} className="p-8 w-full">
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
          <p className="text-sm">Admin Dashboard Access</p>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              className="mt-4"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Login as Admin"}
            </Button>
          </form>

          <Box className="mt-4 text-center">
            <Link to="/login" className="text-blue-600 hover:underline">
              <Typography variant="body2">Return to regular login</Typography>
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
