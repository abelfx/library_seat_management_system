// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { LogOut, Edit2, User, Mail } from "lucide-react";
// import { auth } from "../../firebase/firebase";
// import { signOut } from "firebase/auth";

// const Profile = () => {
//   const navigate = useNavigate();
//   const [user] = useState({
//     fullName: auth.currentUser?.displayName || "Student Name",
//     email: auth.currentUser?.email || "student@university.edu",
//   });

//   const handleLogout = async () => {
//     try {
//       await signOut(auth);
//       navigate("/login");
//     } catch (error) {
//       console.error("Error logging out:", error);
//     }
//   };

//   const handleEditProfile = () => {
//     navigate("/edit-profile");
//   };

//   return (
//     <div className="min-h-screen bg-white text-black p-6">
//       {/* Header */}
//       <div className="mb-6">
//         <h1 className="text-3xl font-bold">Profile</h1>
//         <p className="text-gray-500">Manage your account details</p>
//       </div>

//       {/* Profile Card */}
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="max-w-3xl mx-auto bg-black text-white rounded-xl shadow-md p-6"
//       >
//         <div className="flex items-center space-x-4">
//           {/* Profile Icon */}
//           <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center">
//             <User size={32} className="text-white" />
//           </div>

//           {/* Profile Info */}
//           <div className="flex-1">
//             <h2 className="text-xl font-semibold">{user.fullName}</h2>
//             <p className="text-gray-400">{user.email}</p>
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="mt-6 space-y-4">
//           <button
//             onClick={handleEditProfile}
//             className="w-full flex items-center justify-between bg-neutral-900 text-white p-3 rounded-lg hover:bg-neutral-800 transition-colors"
//           >
//             <div className="flex items-center space-x-2">
//               <Edit2 size={20} />
//               <span>Edit Profile</span>
//             </div>
//           </button>

//           <button
//             onClick={handleLogout}
//             className="w-full flex items-center justify-between bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition-colors"
//           >
//             <div className="flex items-center space-x-2">
//               <LogOut size={20} />
//               <span>Logout</span>
//             </div>
//           </button>
//         </div>

//         {/* Footer */}
//         <div className="mt-6 text-center text-gray-500 text-sm">
//           Version 1.0.0
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default Profile;
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut, Edit2, User, Mail } from "lucide-react";
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
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleEditProfile = () => {
    navigate("/edit-profile");
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 md:p-10">
      {/* Header Section */}
      <div className="w-full max-w-5xl text-left mb-6">
        <h1 className="text-3xl font-bold text-black">Profile</h1>
        <p className="text-gray-500">
          Manage your account details and settings.
        </p>
      </div>

      {/* Profile Card - Black Themed */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl bg-black text-white rounded-2xl shadow-xl p-8 space-y-6 flex flex-col md:flex-row"
      >
        {/* Left Section - Avatar & Info */}
        <div className="flex flex-col items-center space-y-4 md:w-1/3">
          {/* Profile Icon */}
          <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center">
            <User size={48} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-center">
            {user.fullName}
          </h2>
          <p className="text-gray-400 flex items-center space-x-2">
            <Mail size={18} />
            <span>{user.email}</span>
          </p>
        </div>

        {/* Right Section - Actions */}
        <div className="flex-1 flex flex-col justify-between space-y-6">
          {/* Edit Profile */}
          <button
            onClick={handleEditProfile}
            className="w-full bg-neutral-900 hover:bg-neutral-800 transition-colors text-white py-3 rounded-lg flex items-center justify-center space-x-2"
          >
            <Edit2 size={20} />
            <span>Edit Profile</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 transition-colors text-white py-3 rounded-lg flex items-center justify-center space-x-2"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>

          {/* Extra Info / Footer */}
          <div className="text-center text-gray-400 text-sm mt-auto">
            EduWave - Version 1.0.0
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
