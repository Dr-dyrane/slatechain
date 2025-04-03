export function passwordResetEmail(resetLink: string, userName: string, resetCode: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Reset Your Password</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="background-color: #f6f9fc; padding: 10px 0;">
        <div style="background-color: #ffffff; border: 1px solid #f0f0f0; padding: 45px; max-width: 600px; margin: 0 auto;">
          <img src="https://supplycycles.com/logo.png" alt="Supply Cycles Logo" style="width: 100px; margin-bottom: 20px;">          
          <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 20px;">Hi ${userName},</h1>
          <p style="font-size: 16px; line-height: 26px; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to choose a new password:
          </p>
          <a href="${resetLink}" style="background-color: #000000; border-radius: 5px; color: #fff; display: inline-block; font-size: 16px; font-weight: bold; padding: 12px 30px; text-decoration: none; text-align: center; margin-bottom: 20px;">
            Reset Password
          </a>
          <p style="font-size: 16px; line-height: 26px; margin-bottom: 20px;">
            Or enter this 6-digit code on the password reset page:
          </p>
          <div style="font-family: monospace; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; background-color: #f4f4f4; padding: 12px; border-radius: 5px; margin-bottom: 20px;">
            ${resetCode}
          </div>
          <p style="font-size: 16px; line-height: 26px; margin-bottom: 20px;">If you didn't request this, you can safely ignore this email.</p>
          <p style="color: #666666; font-size: 14px; font-style: italic;">This code will expire in 1 hour for security reasons.</p>
        </div>
      </body>
    </html>
  `
}

