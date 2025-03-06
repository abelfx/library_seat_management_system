import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Welcome from "./pages/Auth/Welcome";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/SignUp";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import RecoverEmail from "./pages/Auth/RecoverEmail";
import EmailVerification from "./pages/Auth/verifyEmail";
import { auth } from "./firebase/firebase";
import Home from "./pages/home/home";
import LandingPage from "./pages/LandingPage";
import AvailableFloor from "./pages/AvailableFloor/AvailableFloor";
import AvailableSeat from "./pages/AvailableSeat/AvailableSeat";
import Profile from "./pages/Profile/Profile";
import AdminLogin from "./pages/Auth/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import SeatSelectionPage from "./pages/Admin/SeatSelectionPage";
import Unauthorized from "./pages/Auth/Unauthorized";

// Protected route component to check auth status
const ProtectedRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/recover-email" element={<RecoverEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/available-floor" element={<AvailableFloor />} />
        <Route path="/available-seat" element={<AvailableSeat />} />
        <Route path="/available-seats/:floorId" element={<AvailableSeat />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/seat-selection" element={<SeatSelectionPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
