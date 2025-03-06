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
          <Typography variant="h4" component="h1" className="text-center mb-6">
            Admin Login
          </Typography>

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
