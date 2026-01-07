const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const config = require('../config/env');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.SMTP_HOST,
      port: config.SMTP_PORT,
      secure: config.SMTP_PORT === 465,
      auth: {
        user: config.SMTP_USER,
        pass: config.SMTP_PASS
      }
    });
  }

  // Send email with template
  async sendEmail(to, subject, template, data = {}) {
    try {
      const html = this.renderTemplate(template, data);
      
      const mailOptions = {
        from: `"EduManage Pro" <${config.SMTP_FROM}>`,
        to,
        subject,
        html,
        text: this.htmlToText(html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;

    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  // Payment confirmation email
  async sendPaymentConfirmation(payment) {
    const subject = 'Payment Confirmation - EduManage Pro';
    const template = 'payment-confirmation';
    
    const data = {
      paymentId: payment.paymentId,
      amount: payment.amount,
      currency: payment.currency,
      method: payment.method,
      transactionId: payment.transactionId,
      date: new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    return this.sendEmail(payment.user.email, subject, template, data);
  }

  // Build completion notification
  async sendBuildCompletionNotification({ buildId, schoolName, downloadUrl, userEmail }) {
    const subject = 'Your School Management System is Ready!';
    const template = 'build-complete';
    
    const data = {
      schoolName,
      buildId,
      downloadUrl,
      installationGuide: `
        1. Extract the downloaded ZIP file
        2. Upload to your web hosting server
        3. Run: npm install
        4. Configure .env file with your database details
        5. Run: npm start
        6. Access your system at yourdomain.com
      `
    };

    return this.sendEmail(userEmail, subject, template, data);
  }

  // Payment verification request (to admin)
  async sendPaymentVerificationRequest({ orderId, amount, proofUrl, userEmail }) {
    const subject = 'Payment Verification Required';
    const template = 'payment-verification';
    
    const data = {
      orderId,
      amount,
      proofUrl,
      userEmail,
      adminUrl: `${config.SERVER_URL}/admin/payments/verify/${orderId}`
    };

    // Send to admin email
    const adminEmail = config.SMTP_FROM;
    return this.sendEmail(adminEmail, subject, template, data);
  }

  // Welcome email for new school
  async sendWelcomeEmail(school, user) {
    const subject = `Welcome to EduManage Pro, ${school.name}!`;
    const template = 'welcome';
    
    const data = {
      schoolName: school.name,
      userName: user.fullName,
      package: school.package,
      supportEmail: config.SMTP_FROM,
      supportPhone: '+254114963959',
      dashboardUrl: `${config.CLIENT_URL}/dashboard`
    };

    return this.sendEmail(user.email, subject, template, data);
  }

  // Render email template
  renderTemplate(templateName, data) {
    const templates = {
      'payment-confirmation': `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Confirmed!</h1>
              <p>Thank you for your payment</p>
            </div>
            <div class="content">
              <p>Dear Customer,</p>
              <p>Your payment has been successfully processed.</p>
              
              <div class="details">
                <h3>Payment Details:</h3>
                <p><strong>Payment ID:</strong> ${data.paymentId}</p>
                <p><strong>Amount:</strong> ${data.currency} ${data.amount}</p>
                <p><strong>Method:</strong> ${data.method}</p>
                <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
                <p><strong>Date:</strong> ${data.date}</p>
              </div>
              
              <p>We are now preparing your school management system. You will receive another email when it's ready for download.</p>
              
              <p>If you have any questions, please contact our support team.</p>
              
              <p>Best regards,<br>The EduManage Pro Team</p>
            </div>
          </div>
        </body>
        </html>
      `,
      'build-complete': `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50, #2E7D32); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
            .steps { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Your System is Ready!</h1>
              <p>${data.schoolName}'s management system</p>
            </div>
            <div class="content">
              <p>Dear Administrator,</p>
              <p>Great news! Your customized school management system has been built successfully and is ready for download.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.downloadUrl}" class="button">Download Your System</a>
                <p style="font-size: 12px; color: #666;">(Link expires in 24 hours)</p>
              </div>
              
              <div class="steps">
                <h3>Installation Instructions:</h3>
                <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${data.installationGuide}</pre>
              </div>
              
              <p><strong>Build ID:</strong> ${data.buildId}</p>
              
              <p>Need help with installation? Contact our support team at support@edumanagepro.com or call +254114963959.</p>
              
              <p>Best regards,<br>The EduManage Pro Team</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    return templates[templateName] || '<p>Email content not available</p>';
  }

  // Convert HTML to plain text
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

module.exports = new EmailService();
