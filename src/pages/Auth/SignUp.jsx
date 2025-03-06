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
    <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-b from-blue-300 via-blue-500 to-blue-700 p-4">
      <div className="absolute top-12 right-12">
        <Link
          to="/login"
          className="bg-white text-gray-700 rounded-full px-6 py-2 text-lg sm:text-xl font-medium flex items-center space-x-2 hover:bg-blue-50 transition duration-300 shadow-md"
        >
          <PersonIcon className="text-blue-600" />
          <span>Login</span>
        </Link>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center w-full max-w-md mb-8">
        <div className="relative flex items-center">
          <div className="w-12 h-12 rounded-full bg-white text-blue-500 flex items-center justify-center border-2 border-white z-10 font-medium">
            1
          </div>
          <div className="h-0.5 w-8 bg-white mx-1"></div>
          <div className="w-12 h-12 rounded-full bg-blue-400 text-white flex items-center justify-center border-2 border-white z-10 font-medium opacity-70">
            2
          </div>
          <div className="h-0.5 w-8 bg-white mx-1"></div>
          <div className="w-12 h-12 rounded-full bg-blue-400 text-white flex items-center justify-center border-2 border-white z-10 font-medium opacity-70">
            3
          </div>
        </div>
      </div>

      {/* Main form card */}
      <div className="bg-white inset-shadow-sm inset-shadow-indigo-400 w-full max-w-md rounded-lg p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-700 mb-6">
          Sign up
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <TextField
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                variant="outlined"
                InputProps={{
                  style: {
                    borderRadius: "8px",
                    borderColor: "white",
                    opacity: "0.8",
                  },
                }}
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone No.
              </label>
              <TextField
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="95599 65655"
                className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                required
                variant="outlined"
                InputProps={{
                  style: {
                    borderRadius: "8px",
                    borderColor: "white",
                    opacity: "0.8",
                  },
                }}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
              style={{
                borderRadius: "8px",
                borderColor: "white",
                opacity: "0.8",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="8-12 Characters"
              className="w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              required
              minLength="8"
              maxLength="12"
              style={{
                borderRadius: "8px",
                borderColor: "white",
                opacity: "0.8",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of birth
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <select
                  name="day"
                  value={formData.day}
                  onChange={handleChange}
                  className="bg-white w-full px-4 py-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                <ArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>

              <div className="relative">
                <select
                  name="month"
                  value={formData.month}
                  onChange={handleChange}
                  className="bg-white w-full px-4 py-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                <ArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>

              <div className="relative">
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="bg-white w-full px-4 py-2 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300"
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
                <ArrowDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreeTerms"
              name="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              className="mr-2"
            />
            <label htmlFor="agreeTerms" className="text-sm">
              I agree to the{" "}
              <Link to="/terms-and-conditions" className="text-blue-500">
                Terms and Conditions
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={!formData.agreeTerms || isLoading} // Disable if not agreed or loading
            className="mt-4"
          >
            {isLoading ? "Signing up..." : "Sign up"}
          </Button>

          {verificationSent && (
            <div className="mt-4 text-green-500">
              Verification email sent! Please check your inbox.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
