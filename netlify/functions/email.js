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
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>We received a request to reset your password for your EduManagerPro account.</p>
            
            <div style="text-align: center;">
              <a href="${data.resetLink}" class="button">Reset Your Password</a>
            </div>
            
            <p style="margin-top: 30px;">This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <p>For security reasons, never share this link with anyone.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 EduManagerPro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  'login-alert': (data) => ({
    subject: 'New Login Detected',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Login Alert</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ffc107, #e0a800); color: #333; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Login Detected</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>We detected a new login to your EduManagerPro account.</p>
            
            <h3>Login Details:</h3>
            <ul>
              <li><strong>Time:</strong> ${data.time}</li>
              <li><strong>IP Address:</strong> ${data.ip}</li>
            </ul>
            
            <p>If this was you, you can ignore this email. If you don't recognize this activity, please change your password immediately and contact support.</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 EduManagerPro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  subscription: (data) => ({
    subject: `Subscription ${data.action} - EduManagerPro`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Subscription Update</title>
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 40px 20px; text-align: center; }
          .content { padding: 40px 30px; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Subscription ${data.action}</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Your EduManagerPro subscription has been ${data.action.toLowerCase()}.</p>
            
            <h3>Subscription Details:</h3>
            <ul>
              <li><strong>Plan:</strong> ${data.plan}</li>
              <li><strong>Amount:</strong> KSh ${data.amount}</li>
              <li><strong>Status:</strong> ${data.status}</li>
              <li><strong>Valid Until:</strong> ${data.endDate}</li>
            </ul>
            
            <p>Thank you for choosing EduManagerPro!</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 EduManagerPro. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { to, subject, template, data } = JSON.parse(event.body);

    if (!to || !template) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    const templateFn = templates[template];
    if (!templateFn) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid template' }),
      };
    }

    const emailContent = templateFn({ ...data, to });

    const mailOptions = {
      from: `"EduManagerPro" <${process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject || subject,
      html: emailContent.html,
    };

    const info = await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: info.messageId,
      }),
    };
  } catch (error) {
    console.error('Email function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};
