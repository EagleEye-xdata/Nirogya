const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Email templates
const templates = {
  emailVerification: (data) => ({
    subject: 'Verify your NIROGYA account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your NIROGYA account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NIROGYA Health Scribe</h1>
          </div>
          <div class="content">
            <h2>Welcome to NIROGYA, ${data.name}!</h2>
            <p>Thank you for registering with NIROGYA Health Scribe. To complete your registration, please verify your email address by clicking the button below:</p>
            <a href="${data.verificationLink}" class="button">Verify Email Address</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${data.verificationLink}">${data.verificationLink}</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with NIROGYA, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2024 NIROGYA Health Scribe. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  passwordReset: (data) => ({
    subject: 'Reset your NIROGYA password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your NIROGYA password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NIROGYA Health Scribe</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello ${data.name},</p>
            <p>We received a request to reset your password for your NIROGYA account. Click the button below to reset your password:</p>
            <a href="${data.resetLink}" class="button">Reset Password</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${data.resetLink}">${data.resetLink}</a></p>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
          </div>
          <div class="footer">
            <p>© 2024 NIROGYA Health Scribe. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  recordShared: (data) => ({
    subject: 'Medical record shared with you',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medical record shared</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .button { display: inline-block; background: #FF9800; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>NIROGYA Health Scribe</h1>
          </div>
          <div class="content">
            <h2>Medical Record Shared</h2>
            <p>Hello ${data.doctorName},</p>
            <p>A medical record has been shared with you:</p>
            <ul>
              <li><strong>Patient:</strong> ${data.patientName}</li>
              <li><strong>Record Type:</strong> ${data.recordType}</li>
              <li><strong>Title:</strong> ${data.recordTitle}</li>
              <li><strong>Shared by:</strong> ${data.sharedBy}</li>
            </ul>
            <a href="${data.accessLink}" class="button">View Record</a>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${data.accessLink}">${data.accessLink}</a></p>
            <p>This link will expire in 7 days.</p>
          </div>
          <div class="footer">
            <p>© 2024 NIROGYA Health Scribe. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

/**
 * Send email
 * @param {object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Template name
 * @param {object} options.data - Template data
 * @param {string} options.html - Custom HTML content
 * @param {string} options.text - Plain text content
 * @returns {Promise} Email send result
 */
const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    let emailContent;
    if (options.template && templates[options.template]) {
      emailContent = templates[options.template](options.data);
    } else {
      emailContent = {
        subject: options.subject,
        html: options.html,
        text: options.text,
      };
    }

    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'NIROGYA Health Scribe'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', result.messageId);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

/**
 * Send bulk emails
 * @param {Array} recipients - Array of recipient objects
 * @param {object} options - Email options
 * @returns {Promise} Bulk email results
 */
const sendBulkEmail = async (recipients, options) => {
  try {
    const transporter = createTransporter();
    const results = [];

    for (const recipient of recipients) {
      try {
        const emailContent = templates[options.template]({ ...options.data, ...recipient });
        
        const mailOptions = {
          from: `"${process.env.FROM_NAME || 'NIROGYA Health Scribe'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
          to: recipient.email,
          subject: emailContent.subject,
          html: emailContent.html,
        };

        const result = await transporter.sendMail(mailOptions);
        results.push({ success: true, recipient: recipient.email, messageId: result.messageId });
      } catch (error) {
        results.push({ success: false, recipient: recipient.email, error: error.message });
      }
    }

    return results;
  } catch (error) {
    console.error('Bulk email sending failed:', error);
    throw error;
  }
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>} Configuration status
 */
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email configuration verified successfully');
    return true;
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  verifyEmailConfig,
  templates,
};
