import { sqlInsert , sqlSelect, sqlSelectAll } from './SqlTestCode.js';
import { sendEmail } from './mailHelpers.js';
import { tokens } from './server.js';

export async function requestHelp(userEmail, textHelp, token) {

  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  // Define the SQL parameters and values
  const tablename = 'HelpRequests';
  const parameters = ['userEmail', 'textHelp'];
  const values = [userEmail, textHelp];

  try {
    // Call the sqlInsert function to insert the help request into the database
    await sqlInsert(tablename, parameters, values);
    // send email to admin
    const admin = await sqlSelect('Users', 'Role="Admin"');
    if (admin.length < 1) {
      throw new Error('No admin found');
    }

    // send email to every admin
    for (let i = 0; i < admin.length; i++) {
      await sendEmail(admin[i].Email, 'New help request',
        `User ${userEmail} needs help: \n${textHelp}`);
    }

    sendEmailHelp(userEmail);
    return 'Request for help was lodged successfully';
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function helpList(state, token) {

  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }

  try {
    const tablename = 'HelpRequests';
    // checks if its all,
    // else both active/closed have the same sql request statement
    // active = gives all active, closed = gives all closed
    // all = gives all help requests

    let helpRequests;
    if (state === 'all') {
      helpRequests = await sqlSelectAll(tablename);
      return helpRequests;
    } else {
      helpRequests = await sqlSelect(tablename, `status="${state}"`);
      return helpRequests;
    }

  } catch (error) {
    throw new Error(error.message);
  }
}

async function sendEmailHelp(userEmail) {
  // dont need to check if user exists,
  // because its a custom email they want to receive updates on
  try {
    // Send the confirmation to the userEmail
    const emailBody = 'Your help request has been received.\n' +
                      'Our team will get back to you within 3-5 business days.';
    const emailSubject = 'Help Request Confirmation';
    await sendEmail(userEmail, emailSubject, emailBody);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}
