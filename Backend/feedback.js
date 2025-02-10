import { sqlInsert } from './SqlTestCode.js';
import { sendEmail } from './mailHelpers.js';
import { tokens } from './server.js';

export async function userFeedback(Feedback, Rating, token) {
  // fill out the sql queries required for the sqlInsert function

  if (!tokens.existsByToken(token)) {
    throw new Error('Invalid token');
  }
  const tablename = 'UserFeedback';
  const parameters = ['Feedback', 'Rating'];
  const values = [Feedback, Rating];
  const email = tokens.getUser(token);
  try {
    // Call sqlInsert function from SqlTestCode.js
    // insert the feedback into the table
    await  sqlInsert(tablename, parameters, values);

    sendEmailFeedback(email);
    return;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function sendEmailFeedback(userEmail) {

  // dont need to check if user exists,
  // because the email being used is the one thats already linked to cx
  try {
    // Send the confirmation to the userEmail
    const emailBody = 'Thank you for your feedback!\n' +
      'We genuinely appreciate your input and are committed ' +
      'to using it to enhance our services. Your feedback helps ' +
      'us serve you better.';
    const emailSubject = 'Feedback Successfully Received';
    await sendEmail(userEmail, emailSubject, emailBody);

    return;
  } catch (error) {
    throw new Error(error.message);
  }
}
