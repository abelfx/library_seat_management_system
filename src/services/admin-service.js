import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "../firebase/firebase";

// Get all admins
export const getAdmins = async () => {
  const adminsCollection = collection(db, "admins");
  const adminSnapshot = await getDocs(adminsCollection);
  return adminSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Get admin by ID
export const getAdmin = async (id) => {
  const adminDoc = doc(db, "admins", id);
  const adminSnapshot = await getDoc(adminDoc);
  if (adminSnapshot.exists()) {
    return {
      id: adminSnapshot.id,
      ...adminSnapshot.data(),
    };
  }
  return null;
};

// Create a new admin
export const createAdmin = async (adminData) => {
  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    adminData.email,
    adminData.password
  );

  // Store admin info in Firestore
  const adminRef = doc(db, "admins", userCredential.user.uid);
  await setDoc(adminRef, {
    email: adminData.email,
    name: adminData.name,
    role: adminData.role || "admin",
    createdAt: new Date().toISOString(),
  });

  return {
    id: userCredential.user.uid,
    email: adminData.email,
    name: adminData.name,
    role: adminData.role || "admin",
  };
};

// Update an admin
export const updateAdmin = async (id, adminData) => {
  const adminRef = doc(db, "admins", id);
  await setDoc(
    adminRef,
    {
      ...adminData,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return {
    id,
    ...adminData,
  };
};

// Delete an admin
export const deleteAdmin = async (id) => {
  await deleteDoc(doc(db, "admins", id));
  return id;
};

// Check if user is an admin
export const isAdmin = async (userId) => {
  if (!userId) return false;

  const adminDoc = await getDoc(doc(db, "admins", userId));
  return adminDoc.exists();
};

// Check if user is a super admin
export const isSuperAdmin = async (userId) => {
  if (!userId) return false;

  const adminDoc = await getDoc(doc(db, "admins", userId));
  if (!adminDoc.exists()) return false;

  const adminData = adminDoc.data();
  return adminData.role === "super-admin";
};
