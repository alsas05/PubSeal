const nodemailer = require('nodemailer');

let latestDevEmail = null;
const devEmailHistory = [];

/**
 * Configure real email transporter
 * Supports Gmail, Brevo, SendGrid, Outlook, or any standard SMTP server
 */
const getTransporter = () => {
  // 1. Gmail service preset (Recommended for personal/dev testing)
  const isGmail = 
    process.env.EMAIL_SERVICE === 'gmail' ||
    (process.env.EMAIL_USER && process.env.EMAIL_USER.toLowerCase().includes('@gmail.com')) ||
    (process.env.SMTP_USER && process.env.SMTP_USER.toLowerCase().includes('@gmail.com'));

  const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailPass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (isGmail && emailUser && emailPass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser.trim(),
        pass: emailPass.trim().replace(/\s+/g, ''), // Strip spaces from App Passwords
      },
    });
  }

  // 2. Custom SMTP host & port
  if (process.env.SMTP_HOST && emailUser && emailPass) {
    const port = parseInt(process.env.SMTP_PORT || '587', 10);
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth: {
        user: emailUser.trim(),
        pass: emailPass.trim(),
      },
      tls: {
        rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
      },
    });
  }

  return null;
};

/**
 * Test & verify the SMTP connection
 */
const verifySmtpConnection = async () => {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('\n[PubSeal Email Service] ⚠️ REAL EMAIL NOT CONFIGURED:');
    console.warn('  To deliver real OTPs to user inboxes, add your SMTP or Gmail App Password credentials to backend/.env');
    console.warn('  Example: EMAIL_SERVICE=gmail, EMAIL_USER=you@gmail.com, EMAIL_PASS=xxxx xxxx xxxx xxxx\n');
    return false;
  }

  try {
    await transporter.verify();
    console.log('[PubSeal Email Service] ✓ Real SMTP connection verified and ready to send to inboxes.');
    return true;
  } catch (err) {
    console.error('[PubSeal Email Service] ✗ SMTP connection verification failed:', err.message);
    return false;
  }
};

/**
 * Build PubSeal Branded HTML Email Template
 */
const buildVerificationEmailHtml = ({ name, email, code, verifyUrl }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your PubSeal Account</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0d0907;
      color: #ede2d3;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0d0907;
      padding: 40px 10px;
    }
    .main-card {
      max-width: 580px;
      margin: 0 auto;
      background: #17110d;
      border: 1px solid #3c2a1c;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.8);
    }
    .header {
      background: linear-gradient(180deg, #251b14 0%, #17110d 100%);
      padding: 32px 24px 24px;
      text-align: center;
      border-bottom: 1px solid #3c2a1c;
    }
    .crest-title {
      font-family: Georgia, serif;
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #cb9f54;
      margin: 0;
      text-transform: uppercase;
    }
    .crest-subtitle {
      font-size: 11px;
      letter-spacing: 3px;
      color: #9d8370;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 36px 32px;
    }
    .greeting {
      font-family: Georgia, serif;
      font-size: 20px;
      color: #faf5ed;
      margin-top: 0;
      margin-bottom: 16px;
    }
    .message {
      font-size: 14px;
      line-height: 1.6;
      color: #c9b7a4;
      margin-bottom: 28px;
    }
    .pin-container {
      background: #0d0907;
      border: 1px solid #cb9f54;
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
      box-shadow: inset 0 0 20px rgba(203, 159, 84, 0.1);
    }
    .pin-label {
      font-size: 11px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #cb9f54;
      margin-bottom: 8px;
      font-family: monospace;
    }
    .pin-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 38px;
      font-weight: bold;
      letter-spacing: 12px;
      color: #e5c386;
      margin: 0;
      text-shadow: 0 0 12px rgba(203, 159, 84, 0.4);
    }
    .cta-container {
      text-align: center;
      margin: 32px 0 24px;
    }
    .cta-button {
      background: linear-gradient(135deg, #cb9f54 0%, #aa8420 100%);
      color: #0d0907 !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 14px;
      padding: 14px 32px;
      border-radius: 8px;
      display: inline-block;
      letter-spacing: 0.5px;
      box-shadow: 0 4px 15px rgba(203, 159, 84, 0.3);
    }
    .link-alt {
      font-size: 12px;
      color: #8b7463;
      word-break: break-all;
      margin-top: 24px;
      text-align: center;
      line-height: 1.5;
    }
    .link-alt a {
      color: #cb9f54;
      text-decoration: underline;
    }
    .security-notice {
      background: #1f1610;
      border-left: 3px solid #cb9f54;
      padding: 14px 18px;
      margin-top: 32px;
      border-radius: 0 8px 8px 0;
    }
    .security-notice p {
      font-size: 12px;
      color: #b7a28e;
      margin: 0;
      line-height: 1.5;
    }
    .footer {
      border-top: 1px solid #3c2a1c;
      padding: 24px 32px;
      background: #110c08;
      text-align: center;
      font-size: 11px;
      color: #725d4e;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main-card">
      <div class="header">
        <h1 class="crest-title">PUBSEAL</h1>
        <div class="crest-subtitle">Digital Ownership Registry</div>
      </div>
      
      <div class="content">
        <h2 class="greeting">Verify Your Author Registry Account</h2>
        <p class="message">
          Greetings <strong>${name}</strong>,<br><br>
          Thank you for joining PubSeal. To safeguard your authorship credentials and enable official cryptographic certification for your manuscripts, please verify your email address (<strong>${email}</strong>).
        </p>
        
        <div class="pin-container">
          <div class="pin-label">Your 6-Digit Verification PIN</div>
          <div class="pin-code">${code}</div>
        </div>
        
        <div class="cta-container">
          <a href="${verifyUrl}" class="cta-button" target="_blank">Verify Email Address &rarr;</a>
        </div>
        
        <div class="link-alt">
          Or copy and paste this verification URL into your browser:<br>
          <a href="${verifyUrl}" target="_blank">${verifyUrl}</a>
        </div>
        
        <div class="security-notice">
          <p>
            <strong>Security Notice:</strong> This code and verification link will expire in 24 hours. If you did not create a PubSeal account, no further action is required and you may safely ignore this message.
          </p>
        </div>
      </div>
      
      <div class="footer">
        PubSeal Cryptographic Evidence Engine • Tamper-Evident SHA-256 Timestamping<br>
        Archival Registry for Unpublished Literature & Creative Works
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Dispatch Real Email Verification Message
 * Sends real email to the user's actual email inbox using configured SMTP / Gmail transporter
 */
const sendVerificationEmail = async ({ email, name, code, token, baseUrl }) => {
  const clientBase = baseUrl || process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${clientBase}/register?token=${token}&email=${encodeURIComponent(email)}`;
  const subject = `Your PubSeal Verification PIN is ${code}`;
  const html = buildVerificationEmailHtml({ name, email, code, verifyUrl });
  const text = `Greetings ${name},\n\nYour PubSeal 6-digit verification PIN is: ${code}\n\nOr click the link below to verify your email address:\n${verifyUrl}\n\nThis verification PIN expires in 24 hours.\n\nPubSeal Cryptographic Registry`;

  const emailRecord = {
    to: email,
    name,
    code,
    token,
    verifyUrl,
    subject,
    sentAt: new Date().toISOString(),
    html,
  };
  latestDevEmail = emailRecord;
  devEmailHistory.unshift(emailRecord);
  if (devEmailHistory.length > 20) devEmailHistory.pop();

  const transporter = getTransporter();

  if (transporter) {
    try {
      const emailUser = process.env.EMAIL_USER || process.env.SMTP_USER || 'no-reply@pubseal.io';
      const from = process.env.EMAIL_FROM || `"PubSeal Registry" <${emailUser}>`;
      const info = await transporter.sendMail({
        from,
        to: email,
        subject,
        text,
        html,
      });

      console.log(`[PubSeal Email Service] ✓ Real email dispatched to ${email}. Message ID: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'real-smtp' };
    } catch (err) {
      console.error(`[PubSeal Email Service] ✗ Failed to deliver email to ${email}:`, err.message);
      throw new Error(`Email delivery failed: ${err.message}. Please check your SMTP configuration.`);
    }
  }

  // If no SMTP transporter is configured:
  console.warn(`[PubSeal Email Service] ⚠️ Cannot send real email to ${email}: SMTP credentials are not configured in backend/.env`);
  
  // In development without credentials, still log to console for debugging, but flag that credentials are required
  console.log('\n' + '═'.repeat(75));
  console.log('       📧 REAL EMAIL NOT CONFIGURED IN backend/.env');
  console.log('═'.repeat(75));
  console.log(`  To:              ${name} <${email}>`);
  console.log(`  Subject:         ${subject}`);
  console.log(`  Verification PIN: [ ${code} ]`);
  console.log(`  Setup Required:  Set EMAIL_USER & EMAIL_PASS in backend/.env to send to real inbox!`);
  console.log('═'.repeat(75) + '\n');

  return { 
    success: false, 
    mode: 'missing-smtp', 
    warning: 'Real SMTP credentials not configured. Please add EMAIL_USER and EMAIL_PASS to backend/.env' 
  };
};

module.exports = {
  sendVerificationEmail,
  verifySmtpConnection,
  getTransporter,
  getLatestDevEmail: () => latestDevEmail,
  getDevEmailHistory: () => devEmailHistory,
};
