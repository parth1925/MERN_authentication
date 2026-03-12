export const getOtpHtml = ({ email, otp }) => {
  const appName = process.env.APP_NAME || "Authentication App";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${appName} Verification Code</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;background:#ffffff;border-radius:12px;border:1px solid #e9ecf3;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:18px 24px;text-align:center;">
              <span style="color:#ffffff;font-weight:700;font-size:16px;letter-spacing:0.3px;">
                ${appName}
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#111;font-weight:700;">
                Verify your email
              </h1>

              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#444;">
                Hello <strong>${email}</strong>,<br /><br />
                Use the verification code below to complete your sign-in to ${appName}.
              </p>

              <!-- OTP -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
                <tr>
                  <td align="center">
                    <div
                      style="
                        display:inline-block;
                        background:#f3f4f6;
                        border:1px solid #e5e7eb;
                        border-radius:10px;
                        padding:14px 18px;
                        font-size:32px;
                        font-weight:700;
                        letter-spacing:10px;
                        color:#111;
                        font-family:Arial,Helvetica,sans-serif;
                      "
                    >
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 12px 0;font-size:14px;line-height:1.6;color:#555;">
                This code will expire in <strong>5 minutes</strong>.
              </p>

              <p style="margin:0;font-size:14px;line-height:1.6;color:#555;">
                If this wasnt initiated by you, this email can be safely ignored.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding:16px 24px;color:#6b7280;font-size:12px;">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const getVerifyEmailHtml = ({ email, token }) => {
  const appName = process.env.APP_NAME || "Authentication App";
  const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const verifyUrl = `${baseUrl.replace(/\/+$/, "")}/token/${encodeURIComponent(token)}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${appName} Verify Account</title>
</head>
<body style="margin:0;padding:0;background:#f6f7fb;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f7fb;padding:24px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px;background:#ffffff;border-radius:12px;border:1px solid #e9ecf3;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#111827;padding:18px 24px;text-align:center;">
              <span style="color:#ffffff;font-size:16px;font-weight:700;letter-spacing:0.3px;">
                ${appName}
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h1 style="margin:0 0 12px 0;font-size:22px;color:#111;font-weight:700;">
                Verify your account
              </h1>

              <p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:#444;">
                Hello <strong>${email}</strong>,<br /><br />
                Thanks for registering with ${appName}. Click the button below to verify your account.
              </p>

              <!-- Button -->
              <table cellpadding="0" cellspacing="0" style="margin:20px 0;">
                <tr>
                  <td align="center">
                    <a href="${verifyUrl}" target="_blank"
                      style="
                        display:inline-block;
                        background:#111827;
                        color:#ffffff;
                        text-decoration:none;
                        padding:12px 20px;
                        border-radius:8px;
                        font-size:14px;
                        font-weight:600;
                      ">
                      Verify Account
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;color:#555;line-height:1.6;margin:0 0 8px 0;">
                If the button doesn’t work, copy and paste this link into your browser:
              </p>

              <p style="font-size:14px;word-break:break-all;">
                <a href="${verifyUrl}" target="_blank" style="color:#111827;text-decoration:underline;">
                  ${verifyUrl}
                </a>
              </p>

              <p style="font-size:14px;color:#555;line-height:1.6;">
                If this wasn’t you, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align:center;padding:16px 24px;color:#6b7280;font-size:12px;">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
