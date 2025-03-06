import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  KeyboardArrowDown as ArrowDownIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "firebase/auth";
import { TextField, Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    day: "",
    month: "",
    year: "",
    agreeTerms: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check if terms are agreed
    if (!formData.agreeTerms) {
      setError("You must agree to the Terms and Conditions to sign up.");
      setIsLoading(false);
      return;
    }

    // Construct date of birth
    const dateOfBirth = `${formData.year}-${String(formData.month).padStart(
      2,
      "0"
    )}-${String(formData.day).padStart(2, "0")}`;

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      await updateProfile(user, { displayName: formData.name });
      await sendEmailVerification(user);
      setVerificationSent(true);

      const db = getFirestore();
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: dateOfBirth,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      });

      console.log("User created successfully:", user.uid);
      navigate("/email-verification", {
        state: { email: formData.email },
      });
    } catch (error) {
      console.error("Error creating user:", error);
      setError(
        error.code === "auth/email-already-in-use"
          ? "Email is already registered. Please use a different email or login."
          : "Failed to create account. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl flex max-w-3xl w-full">
        {/* Left side - Black Panel */}
        <div className="w-1/2 bg-black text-white p-8 flex flex-col items-center justify-center text-center">
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
          <h2 className="text-2xl font-bold mb-4">ZenSoc</h2>
          <p className="text-sm">
            Not Your Average Web - Simplify, Organize, Achieve!
          </p>
        </div>

        {/* Right side - Sign Up Form */}
        <div className="w-1/2 p-8 flex items-center">
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-2">Sign up</h1>
            <p className="text-gray-600 mb-6">
              Create your account to get started!
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password (8-12 characters)"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength="8"
                maxLength="12"
              />

              <div className="grid grid-cols-3 gap-2">
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Day
                  </option>
                  {[...Array(31)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Month
                  </option>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((month, i) => (
                    <option key={i} value={i + 1}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="" disabled>
                    Year
                  </option>
                  {[...Array(100)].map((_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="agreeTerms"
                  className="ml-2 text-sm text-gray-600"
                >
                  I agree to the{" "}
                  <Link
                    to="/terms-and-conditions"
                    className="text-blue-500 hover:underline"
                  >
                    Terms and Conditions
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={!formData.agreeTerms || isLoading}
                className="w-full p-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing up..." : "Sign up"}
              </button>
            </form>

            {verificationSent && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                Verification email sent! Please check your inbox.
              </div>
            )}

            <p className="text-center mt-6 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-500 hover:underline font-medium"
              >
                Login Now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
