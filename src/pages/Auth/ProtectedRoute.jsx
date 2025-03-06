import { Navigate, Outlet } from "react-router-dom";
import { useAuth, useAdmin } from "../../utils/auth-utils";
import { CircularProgress, Box } from "@mui/material";

// Protected route for authenticated users
export const ProtectedRoute = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" />;
};

// Protected route for admin users
export const AdminRoute = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();

  if (authLoading || adminLoading) {
    return (
      <Box className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    return <Navigate to="/admin/login" />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/unauthorized" />;
};
