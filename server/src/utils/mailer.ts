import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (email: string, code: string) => {
    const mailOptions = {
        from: `"MUC Library - Academic Support" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'MUC Library - Verification Code 📚',
        html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #f8f9fa;">
                <h1 style="color: #c026d3; margin: 0;">📚 MUC Library</h1>
                <p style="color: #666; font-size: 14px; margin-top: 5px;">University Resource Platform</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 10px; text-align: center;">
                <h2 style="color: #1e293b; font-size: 22px;">Verify Your Identity</h2>
                <p style="font-size: 16px; color: #475569;">Use the following security code to access your account.</p>
                
                <div style="margin: 35px 0; padding: 25px; background-color: #f1f5f9; border-radius: 12px; display: inline-block; border: 1px dashed #cbd5e1;">
                    <span style="font-size: 38px; font-weight: 800; color: #c026d3; letter-spacing: 6px;">${code}</span>
                </div>
                
                <p style="font-size: 14px; color: #ef4444; font-weight: 600;">⚠️ This code will expire in 15 minutes.</p>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f8f9fa; text-align: center; font-size: 12px; color: #94a3b8;">
                <p>This is an automated message for <strong>${email}</strong>.</p>
                <p>If you did not request this code, please secure your account.</p>
                <p style="margin-top: 15px; font-weight: bold; color: #64748b;">&copy; 2026 MUC Engineering College - Library Team</p>
            </div>
        </div>
        `,
    };

    await transporter.sendMail(mailOptions);
}