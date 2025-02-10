import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export {generateToken, generateHash, generateVerificationCode, isUNSWEmail,
  isImageUrl
};

export const secretKey = process.env.BACKEND_JWT_SECRET || '3900F18BPookie';

/*
  * Generate a JWT token
  * @returns {string} The JWT token
*/
function generateToken() {
  const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60);
  const payload = {
    currentTime: new Date().toISOString(),
    expiryTime: expirationTime
  };

  return jwt.sign(payload, secretKey);
}

/*
  * Generate a hash value for the input string
  * @param {string} input - The string to hash
  * @returns {string} The hashed string
*/
async function generateHash(input) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(input, saltRounds);
  return hash.toString();
}

/*
  * Generate a 6 digit verification code and expiry time
  * @returns {object} The verification code and expiry time as a JSON object
*/
function generateVerificationCode() {
  // Generate a random 6 digit code
  const code = Math.floor(100000 + Math.random() * 900000);
  const currentTime = new Date();
  // Add 10 minutes to the current time
  const expiryTime = new Date(currentTime.getTime() + 10 * 60000);
  return {
    code: code,
    expiryTime: expiryTime
  };
}

function isUNSWEmail(email) {
  // Trim whitespace and check for spaces
  email = email.trim();
  if (email.includes(' ')) {
    return false;
  }

  // Regular expression to match valid email characters
  const validCharsRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9.-]+$/;
  if (!validCharsRegex.test(email)) {
    return false;
  }

  // List of valid UNSW email domains
  const validDomains = [
    '@unsw.edu.au',
    '@ad.student.unsw.edu.au',
    '@student.unsw.edu.au',
    '@ad.unsw.edu.au'
  ];

  // Check if the email ends with any of the valid domains
  return validDomains.some(domain => email.endsWith(domain));
}

function isImageUrl(url) {
  if (typeof url !== 'string') {
    return false;
  }

  const imagePattern = /\.(jpeg|jpg|gif|png|webp|bmp|svg|tiff|tif)$/i;

  try {
    new URL(url);
  } catch {
    return false;
  }

  return imagePattern.test(url);
}
