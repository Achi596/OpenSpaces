import nodemailer from 'nodemailer';

export { sendEmail };

async function sendEmail(email, subject, body, attachmentPath = '') {
  const username = process.env.BACKEND_GMAIL_USERNAME || 'comppookie@gmail.com';
  const password = process.env.BACKEND_GMAIL_PASSWORD || 'xuwy zgsx bdsl bldu';

  try {
    // Create a Nodemailer transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: String(username), // email address
        pass: String(password), // Gmail app-specific password
      },
    });

    // Read attachment file if provided
    const attachments = [];
    if (attachmentPath) {
      attachments.push({ path: attachmentPath });
    }

    // Construct email options
    const mailOptions = {
      from: String(username),
      to: email,
      subject: subject,
      text: body,
      attachments: attachments,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return;
  } catch (error) {
    console.error('Error sending email:', error);
    return error.message;
  }
}
