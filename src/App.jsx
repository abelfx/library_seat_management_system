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
// Protected route component to check auth status
const ProtectedRoute = ({ children }) => {
  return auth.currentUser ? children : <Navigate to="/login" />;
};
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        {/* <Route
          path="/onboarding/business-details"
          element={
            <ProtectedRoute>
              <BusinessDetails />
            </ProtectedRoute>
          }
        /> */}
        {/* <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        /> */}
        <Route path="/recover-email" element={<RecoverEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
