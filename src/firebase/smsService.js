// firebase/smsService.js

import { httpsCallable, getFunctions } from "firebase/functions";
import { getApp } from "firebase/app";

/**
 * Sends an OTP SMS to the provided phone number
 * @param {string} phoneNumber - The phone number to send the OTP to
 * @param {string} otp - The OTP code to send
 * @returns {Promise<void>}
 */
export const sendOTPSMS = async (phoneNumber, otp) => {
  try {
    // Option 1: Using Firebase Cloud Functions (recommended for security)
    const functions = getFunctions(getApp());
    const sendSMS = httpsCallable(functions, "sendOTP");
    await sendSMS({
      phoneNumber,
      otp,
      message: `Your verification code is: ${otp}`,
    });

    return true;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new Error("Failed to send verification code. Please try again.");
  }
};

// If you're not using Firebase Cloud Functions yet, you can replace the above with
// a direct API call to a third-party SMS service like Twilio or use a temporary
// placeholder for development:

/*
export const sendOTPSMS = async (phoneNumber, otp) => {
  // For development/demo purposes only
  console.log(`[DEV ONLY] Would send OTP ${otp} to ${phoneNumber}`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
};
*/
