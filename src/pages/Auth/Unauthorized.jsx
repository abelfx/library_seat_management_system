import { Box, Typography, Button, Container, Paper } from "@mui/material";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <Container maxWidth="md">
      <Box className="flex justify-center items-center min-h-screen py-12">
        <Paper elevation={3} className="p-8 w-full text-center">
          <Typography variant="h4" component="h1" className="mb-4">
            Access Denied
          </Typography>

          <Typography variant="body1" className="mb-6">
            You do not have permission to access this page. This area is
            restricted to administrators only.
          </Typography>

          <Box className="flex justify-center gap-4">
            <Button component={Link} to="/" variant="contained" color="primary">
              Go to Home
            </Button>

            <Button component={Link} to="/admin/login" variant="outlined">
              Admin Login
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}
