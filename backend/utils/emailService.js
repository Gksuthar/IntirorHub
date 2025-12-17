import emailtransporter from "../config/emailTransporter.js";
const emailCopy = ({ context, name, password, companyName, role, inviter, to }) => {
  const appName = process.env.APP_NAME || "SiteZero";
  const headlineByContext = {
    registration: "Welcome aboard",
    login: "Login reminder",
    invitation: "You have been invited",
  };

  const subjectByContext = {
    registration: `${appName} credentials ready`,
    login: `${appName} login confirmation`,
    invitation: `${appName} invitation for ${companyName}`,
  };

  const introByContext = {
    registration: `Hi ${name || "there"}, your administrator account for ${companyName} is all set.`,
    login: `Hi ${name || "there"}, you just signed in to ${appName}. For your records, here is the password you used.`,
    invitation: `Hi ${name || "there"}, ${inviter || "an administrator"} invited you to ${companyName} on ${appName}.`,
  };

  const lineByContext = {
    registration: `Use the credentials below to sign in as the default administrator for ${companyName}.`,
    login: `If this was not you, reset the password immediately.`,
    invitation: `Use the temporary password to sign in and update it after the first login.`,
  };

  const subject = subjectByContext[context] || `${appName} notification`;
  const headline = headlineByContext[context] || appName;
  const intro = introByContext[context] || "Your account details are below.";
  const line = lineByContext[context] || "Keep these credentials safe.";

  const html = `
    <table style="width:100%;max-width:520px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;color:#111;border:1px solid #e5e5e5;border-radius:12px;padding:32px;">
      <tr>
        <td style="text-align:center;padding-bottom:24px;">
          <div style="font-size:20px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#000;">${appName}</div>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <h1 style="font-size:24px;margin:0 0 8px 0;color:#000;">${headline}</h1>
          <p style="margin:0 0 12px 0;color:#333;line-height:1.6;">${intro}</p>
          <p style="margin:0 0 20px 0;color:#555;line-height:1.6;">${line}</p>
        </td>
      </tr>
      <tr>
        <td>
          <div style="background:#f7f7f7;border:1px solid #ddd;border-radius:10px;padding:20px;">
            <p style="margin:0 0 12px 0;font-weight:600;color:#000;">Account email</p>
            <p style="margin:0 0 16px 0;color:#333;">${to}${name ? ` · ${name}` : ""} · ${role}</p>
            <p style="margin:0 0 12px 0;font-weight:600;color:#000;">Password</p>
            <p style="margin:0;color:#111;font-size:16px;letter-spacing:0.5px;">${password}</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;border-top:1px solid #eee;margin-top:24px;">
          <p style="margin:0;color:#777;font-size:12px;">For security, delete this email after saving the password safely.</p>
        </td>
      </tr>
    </table>
  `;

  const text = `${headline}\n${intro}\n${line}\nEmail: ${to}${name ? ` · ${name}` : ""} · ${role}\nPassword: ${password}`;

  return { subject, html, text };
};

export const sendPasswordEmail = async ({ to, name, password, companyName, role, context, inviter }) => {
  const transport = emailtransporter();
  if (!transport) {
    return;
  }

  const fromAddress = process.env.SMTP_FROM || process.env.EMAIL || process.env.SMTP_USER;
  const { subject, html, text } = emailCopy({ context, name, password, companyName, role, inviter, to });

  await transport.sendMail({
    to,
    from: fromAddress,
    subject,
    html,
    text,
  });
};

export const sendOtpEmail = async ({ to, name, companyName, otp, context = "registration" }) => {
  const transport = emailtransporter();
  if (!transport) {
    return;
  }

  const appName = process.env.APP_NAME || "SiteZero";
  const fromAddress = process.env.SMTP_FROM || process.env.EMAIL || process.env.SMTP_USER;
  const displayName = name || companyName || "there";
  const subject = `${appName} verification code`;
  const introLine =
    context === "invitation"
      ? `${companyName || appName} invited you to set up your account.`
      : `Use the verification code below to finish setting up your ${appName} account.`;

  const html = `
    <table style="width:100%;max-width:520px;margin:0 auto;font-family:Arial,sans-serif;background:#fff;color:#111;border:1px solid #e5e5e5;border-radius:12px;padding:32px;">
      <tr>
        <td style="text-align:center;padding-bottom:24px;">
          <div style="font-size:20px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;color:#000;">${appName}</div>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <h1 style="font-size:24px;margin:0 0 8px 0;color:#000;">Verify your email</h1>
          <p style="margin:0 0 12px 0;color:#333;line-height:1.6;">Hi ${displayName},</p>
          <p style="margin:0 0 20px 0;color:#555;line-height:1.6;">${introLine}</p>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;">
          <div style="display:inline-block;padding:18px 32px;border-radius:16px;background:#111;color:#fff;font-size:28px;font-weight:600;letter-spacing:6px;">
            ${otp}
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;color:#777;font-size:12px;text-align:center;">
          <p style="margin:0;">The code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.</p>
        </td>
      </tr>
    </table>
  `;

  const text = `Verify your email\nHi ${displayName},\n${introLine}\nVerification code: ${otp}\nThis code expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`;

  await transport.sendMail({
    to,
    from: fromAddress,
    subject,
    html,
    text,
  });
};
