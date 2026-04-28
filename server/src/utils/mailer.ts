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
        from: process.env.SMTP_USER,
        to: email,
        subject: 'MUC Library - Verification Code',
        html: `<p>Your verification code is: <strong>${code}</strong></p>
               <p>It will expire in 15 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);
};
