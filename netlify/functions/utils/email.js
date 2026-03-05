const nodemailer = require('nodemailer');

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

const templates = {
  welcome: (data) => ({
    subject: `Welcome to EduManagerPro, ${data.name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to EduManagerPro!</h1>
          </div>
          <div class="content">
            <h2>Hello ${data.name},</h2>
            <p>Thank you for choosing EduManagerPro. We're excited to help you manage your school efficiently!</p>
            <p>Your school portal is ready at: <strong>${data.subdomain}</strong></p>
            <div style="text-align: center;">
              <a href="${data.loginUrl}" class="button">Access Your Dashboard</a>
            </div>
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
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ffc107, #e0a800); padding: 30px; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Login Alert</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name},</p>
            <p>We detected a new login to your account:</p>
            <ul>
              <li>Time: ${data.time}</li>
              <li>IP: ${data.ip}</li>
            </ul>
            <p>If this wasn't you, please secure your account immediately.</p>
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
        <style>
          body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; }
          .button { display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello ${data.name},</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${data.resetLink}" class="button">Reset Password</a>
            </div>
            <p>This link expires in 1 hour.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

exports.sendEmail = async ({ to, template, data }) => {
  const templateFn = templates[template];
  if (!templateFn) {
    throw new Error('Invalid template');
  }

  const emailContent = templateFn(data);

  const mailOptions = {
    from: `"EduManagerPro" <${process.env.SMTP_USER}>`,
    to,
    subject: emailContent.subject,
    html: emailContent.html,
  };

  return transporter.sendMail(mailOptions);
};
