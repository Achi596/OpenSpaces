import { sqlSelect, sqlInsert, sqlUpdate, sqlDelete } from './SqlTestCode.js';
import { tokens } from './server.js';
import { generateHash, generateToken, isUNSWEmail, generateVerificationCode }
  from './helper.js';
import { sendEmail } from './mailHelpers.js';
import bcrypt from 'bcrypt';

export { authUserLogin, authUserCreate, sendCode, verifyCode,
  authUserDelete, authUserLogout, authUserGet };

/**
 * Authenticates a user login.
 * @param {string} username - The username (email) of the user.
 * @param {string} password - The password of the user.
 * @returns {string} - Returns a token if the login is successful, or an error
 * message if the login fails.
 * @throws {Error} - Throws an error if there is an issue with the database or
 * the login process.
*/
async function authUserLogin(username, password) {
  // Create SQL query with tablename = Users
  const tableName = 'Users';
  const condition = `Email="${username}"`;

  try {
    // Call sqlSelect function from SqlTestCode.js
    // If user exists, returns the user's information
    const dbResponse = await sqlSelect(tableName, condition);
    if (dbResponse.length === 0) {
      // console.log('The user does not exist');
      throw new Error('The user does not exist');
    }

    // Check if password matches
    const passwordMatches = await bcrypt.compare(password,
      dbResponse[0].Password);
    if (passwordMatches) {
      // Check if the account is verified
      if (dbResponse[0].AcountStatus === 'unverified') {
        throw new Error('unverified account');
      }
      // Check if the account is terminated
      if (dbResponse[0].AcountStatus === 'terminated') {
        throw new Error('terminated account');
      }
      // Check if logged in already
      if (tokens.exists(username)) {
        // remove old token if already logged in
        tokens.remove(tokens.getToken(username));
      }
      // Generate JWT token and return to caller
      const token = generateToken();
      await tokens.add(username, token);
      return token;
    } else {
      throw new Error('Password does not match');
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
  * Creates a new user account.
  * @param {Object} User - The user information.
  * @param {string} User.firstName - The first name of the user.
  * @param {string} User.lastName - The last name of the user.
  * @param {string} User.email - The email of the user.
  * @param {string} User.password - The password of the user.
  * @returns {void}
 */
async function authUserCreate(User) {
  	// User must be JSON Object
  const username = User.email;
  const tablename = 'Users';
  const condition = `Email="${username}"`;

  try {
      	// Call sqlSelect function from SqlTestCode.js
      	// If user exists, returns the user's information
    const dbResponse = await sqlSelect(tablename, condition);
    if (dbResponse.length !== 0) {
      throw new Error('User already exists in the database.');
    }

    if (!isUNSWEmail(username)) {
      throw new Error('Email must be a UNSW email.');
    }

    // TODO: send verification code to the user
    // TODO: crosscheck
    const parameters = ['Email', 'FirstName', 'LastName', 'Password', 'Role',
      'AcountStatus', 'FacultyName', 'SchoolName', 'VerificationCode',
      'CodeExpiry', 'Bookings', 'Attendance', 'Notes'];
    const role = User.role || 'N/A';
    // NOTE: Account Statuses: unverified, verified, terminated
    const schoolName = User.SchoolName || null;
    const hash = await generateHash(User.password);

    const values = [username, User.firstName, User.lastName,
      hash, role, 'unverified', null, schoolName, null, null, 0, 0, null];
    await sqlInsert(tablename, parameters, values);
    return;

  } catch (error) {
    throw new Error(error.message);
  }
}

/**
  * Sends a verification code to the user's email.
  * @param {string} username - The username (email) of the user.
  * @returns {void}
 */
async function sendCode(username) {
  const tablename = 'Users';
  const condition = `Email="${username}"`;
  // Check if the username exists first
  const dbResponse = await sqlSelect(tablename, condition);
  if (dbResponse.length === 0) {
    throw new Error('The user does not exist');
  }
  // Generate a verification code and expiry time

  const code = generateVerificationCode();
  const parameters = ['VerificationCode', 'CodeExpiry'];
  const values = [code.code, code.expiryTime];
  try {
    await sqlUpdate(tablename, parameters, values, condition);
    // Send the code to the user's email (username)
    const emailBody = `Your verification code is: ${code.code}.\n
      This code will expire at: ${code.expiryTime}.`;
    const emailSubject = 'Verification Code';
    await sendEmail(username, emailSubject, emailBody);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
  * Verifies the user's verification code.
  * @param {string} username - The username (email) of the user.
  * @param {string} code - The verification code.
  * @returns {void}
  * @throws {Error} - Throws an error if the user does not exist, if the user
  * is already verified, if the account is terminated, if the code has expired,
  * or if the code does not match.
 */
async function verifyCode(username, code) {
  const tablename = 'Users';
  const condition = `Email="${username}"`;
  const dbResponse = await sqlSelect(tablename, condition);
  if (dbResponse.length === 0) {
    throw new Error('The user does not exist');
  }
  // Check if already verified account
  if (dbResponse[0].AcountStatus === 'verified') {
    throw new Error('The user is already verified');
  }
  // Check if account is terminated
  if (dbResponse[0].AcountStatus === 'terminated') {
    throw new Error('terminated account');
  }

  if (dbResponse[0].VerificationCode === code) {
    // Check if the code has expired
    const currentTime = new Date();
    const expiryTime = new Date(dbResponse[0].CodeExpiry);
    if (currentTime > expiryTime) {
      throw new Error('The code has expired');
    }
    // Update the account status to verified
    const parameters = ['AcountStatus', 'VerificationCode', 'CodeExpiry'];
    const values = ['verified', null, null];
    try {
      await sqlUpdate(tablename, parameters, values, condition);
      return;
    } catch (error) {
      throw new Error(error.message);
    }
  } else {
    throw new Error('The code does not match');
  }
}

/**
  * Deletes a user account.
  * @param {string} username - The username (email) of the user.
  * @param {string} token - The token of the user.
  * @returns {void}
  * @throws {Error} - Throws an error if the user does not exist, if the user
  * is not an Admin, or if there is an issue with the database.
 */
async function authUserDelete(username, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  // Delete a user from the database
  const tablename = 'Users';
  const condition = `Email="${username}"`;
  const dbResponse = await sqlSelect(tablename, condition);
  const user = tokens.getUser(token);
  const dbResponseUser = await sqlSelect(tablename, `Email="${user}"`);
  if (dbResponseUser[0].Role !== 'Admin') {
    throw new Error('Admin access required for this operation');
  }
  if (dbResponse.length === 0) {
    throw new Error('The user does not exist');
  }
  try {
    await sqlDelete(tablename, condition);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
  * Logs out a user.
  * @param {string} token - The token of the user.
  * @returns {void}
  * @throws {Error} - Throws an error if the token is invalid.
 */
function authUserLogout(token) {
  // Remove a user from the tokens list
  if (tokens.existsByToken(token)) {
    tokens.remove(token);
    return;
  }
  throw new Error('Invalid token');
}

/**
  * Gets user information.
  * @param {string} username - The username (email) of the user.
  * @param {string} token - The token of the user.
  * @returns {Object} - Returns the user information.
  * @throws {Error} - Throws an error if the user does not exist, if the user
  * is not an Admin, or if there is an issue with the database.
 */
async function authUserGet(username=null, token) {
  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  const tablename = 'Users';
  const user = tokens.getUser(token);
  const condition = `Email="${user}"`;
  const dbResponseUser = await sqlSelect(tablename, condition);

  // Get user information
  if (username) {
    if (dbResponseUser[0].Role !== 'Admin') {
      throw new Error('Admin access required for this operation');
    }
    const condition = `Email="${username}"`;
    const dbResponse = await sqlSelect(tablename, condition);
    if (dbResponse.length === 0) {
      throw new Error('The user does not exist');
    }
    return {
      firstName: dbResponse[0].FirstName,
      lastName: dbResponse[0].LastName,
      email: dbResponse[0].Email,
      role: dbResponse[0].Role,
      accountStatus: dbResponse[0].AcountStatus,
      notes: dbResponse[0].Notes
    };
  } else {
    return {
      firstName: dbResponseUser[0].FirstName,
      lastName: dbResponseUser[0].LastName,
      email: dbResponseUser[0].Email,
      role: dbResponseUser[0].Role,
      accountStatus: dbResponseUser[0].AcountStatus,
      notes: dbResponseUser[0].Notes
    };
  }
}
