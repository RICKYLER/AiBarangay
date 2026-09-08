import nodemailer from 'nodemailer';

const {
  SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM,
  APP_ORIGIN = 'http://localhost:3000',
  BACKEND_ORIGIN = 'http://localhost:4000',
} = process.env;

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT) || 465,
  secure: (Number(SMTP_PORT) || 465) === 465, // true for 465, false for 587/STARTTLS
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

export const mailFrom = SMTP_FROM || `"AI Barangay Problem Mapper" <${SMTP_USER}>`;

/**
 * Send the account-verification email.
 * The link points at the backend, which verifies the token and then
 * redirects the browser to the SPA's verify-account page.
 */
export async function sendVerificationEmail(user) {
  const verifyUrl = `${BACKEND_ORIGIN}/api/auth/verify/${user.verifyToken}`;

  const html = `
<!doctype html>
<html lang="en">
<body style="margin:0;padding:0;background:#F2F5F3;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background:#FCFDFC;border:1px solid #D6DEDB;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#0E7468;padding:22px 32px;">
            <span style="color:#FFFFFF;font-size:17px;font-weight:bold;letter-spacing:1px;">AI BARANGAY PROBLEM MAPPER</span><br>
            <span style="color:#BDE3DD;font-size:12px;">Tagum City &middot; Davao del Norte</span>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <h1 style="margin:0 0 12px;font-size:21px;color:#1E2A2B;">Confirm your email address</h1>
            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:#55686A;">
              Hi ${escapeHtml(user.fullName)},<br><br>
              thank you for registering as a resident reporter.
              Click the button below to activate your account. After that you can
              sign in and start reporting community problems in ${escapeHtml(user.barangay)}.
            </p>
            <p style="margin:0 0 24px;">
              <a href="${verifyUrl}"
                 style="display:inline-block;background:#0E7468;color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:bold;padding:14px 34px;border-radius:6px;">
                Verify My Account
              </a>
            </p>
            <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#55686A;">
              If the button does not work, copy this link into your browser:
            </p>
            <p style="margin:0 0 24px;font-size:12px;word-break:break-all;">
              <a href="${verifyUrl}" style="color:#0E7468;">${verifyUrl}</a>
            </p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:#55686A;border-top:1px solid #D6DEDB;padding-top:16px;">
              This link expires in 24 hours. If you did not create this account,
              you can safely ignore this email.
            </p>
          </td>
        </tr>
      </table>
      <p style="color:#75817F;font-size:11px;margin:16px 0 0;">
        AI Barangay Problem Mapper &middot; Government service email
      </p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = `Hi ${user.fullName},

Confirm your email to activate your AI Barangay Problem Mapper account:

${verifyUrl}

The link expires in 24 hours. If you did not create this account, ignore this email.`;

  return transporter.sendMail({
    from: mailFrom,
    to: user.email,
    subject: 'Verify your AI Barangay account',
    text,
    html,
  });
}

function escapeHtml(s) {
  return String(s || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
