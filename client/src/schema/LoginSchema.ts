import { z } from 'zod';

export const RequestOtpSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email' }),
});

export const VerifyOtpSchema = z.object({
    email: z.string().email(),
    otp: z.string().length(6, { message: 'Please enter a valid 6-digit code' }),
});

export type RequestOtpFormValues = z.infer<typeof RequestOtpSchema>;
export type VerifyOtpFormValues = z.infer<typeof VerifyOtpSchema>;