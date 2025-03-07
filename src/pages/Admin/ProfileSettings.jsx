import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { db, auth, storage } from "../../firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Material UI Components
import {
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { CameraAlt } from "@mui/icons-material";

export default function ProfileSettings({ user }) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || "",
    photoURL: user?.photoURL || "",
    email: user?.email || "",
    role: "",
    department: "",
    phoneNumber: "",
  });

  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setProfileData((prev) => ({
            ...prev,
            ...userDoc.data(),
          }));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load profile data");
      }
    };
    fetchUserData();
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileData({ ...profileData, photoURL: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError(null);
    try {
      let photoURL = profileData.photoURL;
      if (uploadedImage) {
        const storageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(storageRef, uploadedImage);
        photoURL = await getDownloadURL(storageRef);
      }
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL,
      });
      await updateDoc(doc(db, "users", user.uid), {
        ...profileData,
        photoURL,
        updatedAt: new Date(),
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 600, mx: "auto", mt: 4 }}>
      <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
        <Tab label="Profile" />
        <Tab label="Security" />
      </Tabs>
      <Box hidden={tabValue !== 0} sx={{ p: 2 }}>
        <Box textAlign="center">
          <label htmlFor="photo-upload">
            <Avatar
              src={profileData.photoURL}
              sx={{ width: 100, height: 100, mx: "auto" }}
            />
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageUpload}
            />
            <CameraAlt sx={{ cursor: "pointer" }} />
          </label>
        </Box>
        <TextField
          fullWidth
          label="Full Name"
          name="displayName"
          value={profileData.displayName}
          onChange={handleChange}
          sx={{ my: 2 }}
        />
        <TextField
          fullWidth
          label="Role"
          name="role"
          value={profileData.role}
          onChange={handleChange}
          sx={{ my: 2 }}
        />
        <TextField
          fullWidth
          label="Department"
          name="department"
          value={profileData.department}
          onChange={handleChange}
          sx={{ my: 2 }}
        />
        <TextField
          fullWidth
          label="Phone Number"
          name="phoneNumber"
          value={profileData.phoneNumber}
          onChange={handleChange}
          sx={{ my: 2 }}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          onClick={handleProfileUpdate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Save Changes"}
        </Button>
      </Box>
      <Box hidden={tabValue !== 1} sx={{ p: 2 }}>
        <TextField
          fullWidth
          label="Email"
          value={profileData.email}
          disabled
          sx={{ my: 2 }}
        />
        <Button variant="outlined" onClick={() => setEmailDialogOpen(true)}>
          Change Email
        </Button>
      </Box>
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)}>
        <DialogTitle>Update Email</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            sx={{ my: 2 }}
          />
          <TextField
            fullWidth
            label="Current Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ my: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
