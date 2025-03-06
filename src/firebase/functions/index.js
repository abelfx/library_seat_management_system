// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

// Initialize admin SDK
admin.initializeApp();

// Initialize Twilio client
// Get your Twilio credentials from https://www.twilio.com/console
const twilioClient = twilio(
  functions.config().twilio.accountsid,
  functions.config().twilio.authtoken
);
const twilioPhoneNumber = functions.config().twilio.phonenumber;

// Cloud function to send SMS
exports.sendOTP = functions.https.onCall(async (data, context) => {
  // Ensure the user is authenticated if needed
  /*
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to use this feature.'
    );
  }
  */

  const { phoneNumber, otp, message } = data;

  if (!phoneNumber || !otp) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Phone number and OTP are required"
    );
  }

  try {
    // Send SMS using Twilio
    await twilioClient.messages.create({
      body: message || `Your verification code is: ${otp}`,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw new functions.https.HttpsError("internal", "Failed to send SMS");
  }
});
