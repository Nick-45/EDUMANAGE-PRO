const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Email templates
const templates = {
  welcome: (data) => ({
    subject: `Welcome to EduManagerPro, ${data.name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to EduManagerPro</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to EduManagerPro!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Thank you for choosing EduManagerPro for your school management needs. We're excited to help you streamline your school operations!</p>
            
            <h3>Your School Information:</h3>
            <ul>
              <li><strong>School:</strong> ${data.schoolName}</li>
              <li><strong>Your Portal:</strong> <a href="https://${data.subdomain}">${data.subdomain}</a></li>
            </ul>
            
            <p>You can now log in to your dashboard and start customizing your school's portal.</p>
            
            <div style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Access Your Dashboard</a>
            </div>
            
            <h3>Getting Started:</h3>
            <ol>
              <li>Upload your school logo and customize colors</li>
              <li>Add your teachers and staff</li>
              <li>Import student data</li>
              <li>Set up classes and subjects</li>
              <li>Configure fee structure</li>
            </ol>
            
            <p>If you need any assistance, our support team is here to help!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 EduManagerPro. All rights reserved.</p>
            <p>This email was sent to ${data.to}. If you didn't create this account, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  'password-reset': (data) => ({
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="
