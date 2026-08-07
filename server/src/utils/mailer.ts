import dotenv from "dotenv";

dotenv.config();

const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  throw new Error("BREVO_API_KEY is not defined in the environment variables.");
}

interface BrevoEmailResponse {
  messageId?: string;
  code?: string;
  message?: string;
}

export const sendVerificationEmail = async (
  email: string,
  code: string
) => {
  const url = 'https://api.brevo.com/v3/smtp/email';
  
  const payload = {
    sender: {
      name: "MUC Library",
      email: "aymankhattap483@gmail.com" // Note: This should ideally be verified in Brevo
    },
    to: [
      {
        email: email
      }
    ],
    subject: "MUC Library - Verification Code 📚",
    htmlContent: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:15px;box-shadow:0 4px 10px rgba(0,0,0,.05);">
        <div style="text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #f8f9fa;">
          <h1 style="color:#c026d3;margin:0;">📚 MUC Library</h1>
          <p style="color:#666;font-size:14px;margin-top:5px;">
            University Resource Platform
          </p>
        </div>
        <div style="text-align:center;">
          <h2 style="color:#1e293b;">Verify Your Identity</h2>
          <p style="font-size:16px;color:#475569;">
            Use the following verification code to complete your login.
          </p>
          <div style="margin:35px 0;padding:25px;background:#f1f5f9;border-radius:12px;border:1px dashed #cbd5e1;display:inline-block;">
            <span style="font-size:38px;font-weight:bold;letter-spacing:8px;color:#c026d3;">
              ${code}
            </span>
          </div>
          <p style="color:#ef4444;font-weight:bold;">
            This code expires in 15 minutes.
          </p>
        </div>
        <div style="margin-top:30px;padding-top:20px;border-top:1px solid #eee;text-align:center;color:#94a3b8;font-size:12px;">
          <p>This email was sent to <strong>${email}</strong>.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
          <p style="margin-top:15px;font-weight:bold;color:#64748b;">
            © 2026 MUC Engineering College - Library Team
          </p>
        </div>
      </div>
    `
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json() as BrevoEmailResponse;
      console.error("Brevo API Error:", errorData);
      throw new Error(`Failed to send email: ${errorData.message || response.statusText}`);
    }

    const data = await response.json() as BrevoEmailResponse;
    return data;
  } catch (error: any) {
    console.error("Email Dispatch Error:", error.message || error);
    throw new Error("Failed to send verification email");
  }
};