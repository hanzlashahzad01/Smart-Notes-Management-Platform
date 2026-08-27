const nodemailer = require('nodemailer');

const createTransporter = () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_PASS !== 'demo_password') {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback simulator transporter logging to console
  return {
    sendMail: async (options) => {
      console.log(`\n================ [EMAIL SIMULATOR] ================`);
      console.log(`To: ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Body:\n${options.text || options.html}`);
      console.log(`===================================================\n`);
      return { messageId: 'simulated-msg-' + Date.now() };
    },
  };
};

const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: '"NoteFlow" <noreply@noteflow.com>',
    to: email,
    subject: 'Verify Your NoteFlow Account 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
        <h2 style="color: #4f46e5;">Welcome to NoteFlow!</h2>
        <p>Please verify your email address to complete your registration:</p>
        <a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
        <p style="margin-top: 20px; color: #64748b; font-size: 14px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  await transporter.sendMail({
    from: '"NoteFlow Security" <security@noteflow.com>',
    to: email,
    subject: 'Reset Your NoteFlow Password 🔐',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
        <h2 style="color: #dc2626;">Password Reset Request</h2>
        <p>You requested a password reset. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: #dc2626; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
        <p style="margin-top: 20px; color: #64748b; font-size: 14px;">This link will expire in 1 hour.</p>
      </div>
    `,
  });
};

const sendShareNotificationEmail = async (email, senderName, noteTitle, permission) => {
  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: '"NoteFlow Sharing" <sharing@noteflow.com>',
    to: email,
    subject: `${senderName} shared a note with you: "${noteTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
        <h2 style="color: #4f46e5;">Note Shared With You</h2>
        <p><strong>${senderName}</strong> has granted you <strong>${permission}</strong> access to the note: <em>"${noteTitle}"</em>.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: #4f46e5; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Open NoteFlow</a>
      </div>
    `,
  });
};

const sendReminderEmail = async (email, noteTitle, remindAt) => {
  const transporter = createTransporter();
  
  await transporter.sendMail({
    from: '"NoteFlow Reminders" <reminders@noteflow.com>',
    to: email,
    subject: `⏰ Reminder: ${noteTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; borderRadius: 8px;">
        <h2 style="color: #0284c7;">Scheduled Note Reminder</h2>
        <p>Your note <strong>"${noteTitle}"</strong> is due at <strong>${new Date(remindAt).toLocaleString()}</strong>.</p>
        <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="display: inline-block; background: #0284c7; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">View Note</a>
      </div>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendShareNotificationEmail,
  sendReminderEmail,
};
