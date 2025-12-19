const APP_URL = "https://designer.zantatech.com";

export const buildLoginCredentialsEmail = ({
  appName = "SiteZero",
  name = "there",
  email,
  password,
  role,
  companyName,
}) => {
  const loginLink = `${APP_URL}/login`;

  const subject = `Welcome to ${appName}! Your login details are ready`;

  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${appName} Login Details</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
              max-width:600px;
              background-color:#ffffff;
              border-radius:16px;
              padding:40px 32px;
              box-shadow:0 10px 30px rgba(0,0,0,0.1);
              border:1px solid #e9ecef;
            ">
              
              <!-- Header: App Logo/Name -->
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <div style="
                    font-size:28px;
                    font-weight:800;
                    letter-spacing:-0.5px;
                    color:#1a1a1a;
                    text-transform:uppercase;
                    border-bottom:3px solid #007bff;
                    padding-bottom:12px;
                    display:inline-block;
                  ">
                    ${appName}
                  </div>
                </td>
              </tr>

              <!-- Greeting & Message -->
              <tr>
                <td style="padding-bottom:28px;">
                  <h1 style="
                    font-size:24px;
                    margin:0 0 12px 0;
                    color:#212529;
                    font-weight:600;
                  ">
                    Welcome aboard! Your account is all set.
                  </h1>
                  <p style="
                    margin:0 0 20px;
                    color:#6c757d;
                    font-size:16px;
                    line-height:1.6;
                  ">
                    Hey ${name},<br>
                    Exciting news—you now have access to <strong style="color:#007bff;">${companyName}</strong> on ${appName}.<br>
                    Here are your quick-start credentials. Let's get you logged in!
                  </p>
                </td>
              </tr>

              <!-- Credentials Card -->
              <tr>
                <td style="padding-bottom:32px;">
                  <div style="
                    background:linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius:12px;
                    padding:24px;
                    border:1px solid #dee2e6;
                    box-shadow:0 4px 12px rgba(0,0,0,0.05);
                  ">
                    <div style="display:flex;align-items:center;margin-bottom:16px;">
                      <div style="
                        width:8px;height:8px;
                        background:#007bff;
                        border-radius:50%;
                        margin-right:8px;
                      "></div>
                      <p style="margin:0;font-weight:600;font-size:14px;color:#495057;">Account Details</p>
                    </div>
                    
                    <div style="margin-bottom:16px;">
                      <p style="margin:0 0 4px;font-weight:600;color:#212529;">Email Address</p>
                      <p style="
                        margin:0;
                        font-size:16px;
                        font-family:monospace;
                        color:#495057;
                        word-break:break-all;
                      ">${email}</p>
                    </div>

                    <div style="margin-bottom:16px;">
                      <p style="margin:0 0 4px;font-weight:600;color:#212529;">Temporary Password</p>
                      <p style="
                        margin:0;
                        font-size:16px;
                        font-weight:600;
                        font-family:monospace;
                        letter-spacing:0.5px;
                        color:#dc3545;
                        background:#fff3cd;
                        padding:8px 12px;
                        border-radius:6px;
                        border:1px solid #ffeaa7;
                      ">
                        ${password}
                      </p>
                    </div>

                    <div style="margin-bottom:0;">
                      <p style="margin:0;font-size:14px;color:#6c757d;">
                        <strong>Role:</strong> ${role}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>

              <!-- CTA Button -->
              <tr>
                <td align="center" style="padding:32px 0 24px 0;">
                  <a href="${loginLink}" style="
                    display:inline-block;
                    padding:16px 32px;
                    background:linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                    color:#ffffff !important;
                    text-decoration:none;
                    border-radius:12px;
                    font-size:16px;
                    font-weight:600;
                    box-shadow:0 4px 12px rgba(0,123,255,0.3);
                    transition: all 0.3s ease;
                  "
                  onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0,123,255,0.4)';"
                  onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(0,123,255,0.3)';">
                    🚀 Start Logging In
                  </a>
                </td>
              </tr>

              <!-- Security Note & Footer -->
              <tr>
                <td align="center" style="
                  padding-top:20px;
                  font-size:14px;
                  color:#adb5bd;
                  line-height:1.5;
                  border-top:1px solid #e9ecef;
                  padding-top:24px;
                ">
                  <p style="margin:0 0 8px;">
                    🔒 <strong>Pro Tip:</strong> Change your password right after your first login for extra security.
                  </p>
                  <p style="margin:0 0 12px;">
                    Didn't request this? No worries—just ignore this email. It's all good.
                  </p>
                  <p style="margin:0;font-size:12px;color:#ced4da;">
                    Need help? Reply to this email or visit <a href="${loginLink}" style="color:#007bff;text-decoration:none;">${APP_URL}</a>
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  const text = `
${appName} – Welcome! Your Login Details

Hey ${name},

Great to have you on board! You've got access to ${companyName} as ${role}.

Quick Login:
• URL: ${loginLink}
• Email: ${email}
• Temp Password: ${password} (Change it after first login!)

Hit that link and let's get started: ${loginLink}

Security note: Update your password ASAP for peace of mind.
If this wasn't you, feel free to delete—no action needed.

Cheers,
The ${appName} Team
  `;

  return { subject, html, text };
};

import createEmailTransporter from "../config/emailTransporter.js";

/**
 * Sends login credentials email to a user.
 * @param {Object} param0
 * @param {string} param0.to - Recipient email address
 * @param {string} param0.name - Recipient name
 * @param {string} param0.password - Temporary password
 * @param {string} param0.companyName - Company name
 * @param {string} param0.role - User role
 * @param {string} [param0.context] - Context (e.g., 'login', 'invitation')
 * @param {string} [param0.inviter] - Inviter name/email (optional)
 */
export async function sendPasswordEmail({ to, name, password, companyName, role, context = "login", inviter }) {
  const { subject, html, text } = buildLoginCredentialsEmail({
    name,
    email: to,
    password,
    companyName,
    role,
    appName: "SiteZero",
  });

  let finalHtml = html;
  if (context === "invitation" && inviter) {
    // Add inviter info to invitation emails
    finalHtml = finalHtml.replace(
      /<h1[^>]*>.*?<\/h1>/,
      `$&<p style=\"margin:0 0 20px;color:#6c757d;font-size:15px;\">Invited by: <strong>${inviter}</strong></p>`
    );
  }

  const transporter = createEmailTransporter();
  if (!transporter) {
    console.warn("Email transporter not configured. Email not sent to:", to);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html: finalHtml,
    text,
  });
}

/**
 * Sends OTP verification email to a user.
 * @param {Object} param0
 * @param {string} param0.to - Recipient email address
 * @param {string} param0.name - Recipient name
 * @param {string} param0.companyName - Company name
 * @param {string} param0.otp - OTP code
 * @param {string} [param0.context] - Context (e.g., 'registration')
 */
export async function sendOtpEmail({ to, name, companyName, otp, context = "registration" }) {
  const subject = `Your SiteZero Verification Code: ${otp}`;
  
  const html = `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SiteZero Verification Code</title>
    </head>
    <body style="margin:0;padding:0;background-color:#f8f9fa;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="
              max-width:600px;
              background-color:#ffffff;
              border-radius:16px;
              padding:40px 32px;
              box-shadow:0 10px 30px rgba(0,0,0,0.1);
              border:1px solid #e9ecef;
            ">
              <tr>
                <td align="center" style="padding-bottom:32px;">
                  <div style="
                    font-size:28px;
                    font-weight:800;
                    letter-spacing:-0.5px;
                    color:#1a1a1a;
                    text-transform:uppercase;
                    border-bottom:3px solid #007bff;
                    padding-bottom:12px;
                    display:inline-block;
                  ">
                    SiteZero
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:28px;">
                  <h1 style="
                    font-size:24px;
                    margin:0 0 12px 0;
                    color:#212529;
                    font-weight:600;
                  ">
                    Verify Your Account
                  </h1>
                  <p style="
                    margin:0 0 20px;
                    color:#6c757d;
                    font-size:16px;
                    line-height:1.6;
                  ">
                    Hey ${name},<br>
                    Welcome to <strong style="color:#007bff;">${companyName}</strong> on SiteZero.<br>
                    Use this verification code to complete your ${context}:
                  </p>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom:32px;" align="center">
                  <div style="
                    background:linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                    border-radius:12px;
                    padding:24px;
                    border:1px solid #dee2e6;
                    box-shadow:0 4px 12px rgba(0,0,0,0.05);
                    display:inline-block;
                  ">
                    <p style="margin:0 0 8px;font-weight:600;font-size:14px;color:#495057;">Your Verification Code</p>
                    <p style="
                      margin:0;
                      font-size:32px;
                      font-weight:700;
                      font-family:monospace;
                      letter-spacing:8px;
                      color:#007bff;
                      background:#ffffff;
                      padding:16px 24px;
                      border-radius:8px;
                      border:2px solid #007bff;
                    ">
                      ${otp}
                    </p>
                  </div>
                </td>
              </tr>
              <tr>
                <td align="center" style="
                  padding-top:20px;
                  font-size:14px;
                  color:#adb5bd;
                  line-height:1.5;
                  border-top:1px solid #e9ecef;
                  padding-top:24px;
                ">
                  <p style="margin:0 0 8px;">
                    ⏱️ This code expires in 10 minutes.
                  </p>
                  <p style="margin:0 0 12px;">
                    Didn't request this? Please ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  const text = `
SiteZero – Verification Code

Hey ${name},

Welcome to ${companyName} on SiteZero.

Your verification code is: ${otp}

This code expires in 10 minutes.

If you didn't request this, please ignore this email.

Cheers,
The SiteZero Team
  `;

  const transporter = createEmailTransporter();
  if (!transporter) {
    console.warn("Email transporter not configured. OTP email not sent to:", to);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html,
    text,
  });
}

/**
 * Generic function to send email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email HTML content
 */
export async function sendEmail(to, subject, html) {
  const transporter = createEmailTransporter();
  if (!transporter) {
    console.warn("Email transporter not configured. Email not sent to:", to);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL,
    to,
    subject,
    html,
  });
}