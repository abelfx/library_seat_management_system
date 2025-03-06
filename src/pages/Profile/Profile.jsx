import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Mail, ArrowLeft } from "lucide-react";
import { auth } from "../../firebase/firebase";
import { signOut } from "firebase/auth";

const Profile = () => {
  const navigate = useNavigate();
  const [user] = useState({
    fullName: auth.currentUser?.displayName || "Student Name",
    email: auth.currentUser?.email || "student@university.edu",
  });

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="bg-white py-4 px-6 flex justify-between items-center border-b">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <div className="text-black text-xl font-bold">Profile</div>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-500 mt-2">
            View your account details and settings
          </p>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black text-white rounded-xl shadow-xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center text-center md:text-left">
              <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                <User size={48} className="text-white" />
              </div>
              <h2 className="text-2xl font-semibold">{user.fullName}</h2>
              <div className="flex items-center gap-2 mt-2 text-gray-400">
                <Mail size={16} />
                <span>{user.email}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-32 bg-gray-800"></div>

            {/* Actions */}
            <div className="flex-1 w-full md:w-auto">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>

              {/* Stats or Additional Info */}
              <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Active Bookings</div>
                </div>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm text-gray-400">Past Bookings</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-400 text-sm">
            LibrarySeats - Version 1.0.0
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
