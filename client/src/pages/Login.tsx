import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../lib/api';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { siteConfig } from '../config/siteConfig';
import { RequestOtpSchema, VerifyOtpSchema, type RequestOtpFormValues, type VerifyOtpFormValues } from '../schema/LoginSchema';

const Login = () => {
    const [sent, setSent] = useState(false);
    const [serverError, setServerError] = useState('');

    const { setAuthToken } = useAuth();
    const navigate = useNavigate();

    const requestOtpForm = useForm<RequestOtpFormValues>({
        resolver: zodResolver(RequestOtpSchema),
        defaultValues: { email: '' }
    });

    const verifyOtpForm = useForm<VerifyOtpFormValues>({
        resolver: zodResolver(VerifyOtpSchema),
        defaultValues: { email: '', otp: '' }
    });

    const onOtpRequest = async (data: RequestOtpFormValues) => {
        setServerError('');
        const adminEmails = ['admin@admin.com', 'admin@muc.edu.eg'];
        const isAllowed = data.email.endsWith(siteConfig.allowedEmailDomain) || adminEmails.includes(data.email);

        if (!isAllowed) {
            requestOtpForm.setError('email', { type: 'manual', message: `Please use your organization email (${siteConfig.allowedEmailDomain})` });
            return;
        }

        try {
            await api.post('/auth/request-otp', { email: data.email });
            verifyOtpForm.setValue('email', data.email);
            setSent(true);
        } catch (err: any) {
            console.error('Login error:', err);
            setServerError(err.message || 'Failed to send verification email');
        }
    };

    const onOtpVerify = async (data: VerifyOtpFormValues) => {
        setServerError('');
        try {
            const res = await api.post('/auth/verify-otp', { email: data.email, code: data.otp });
            if (res.token) {
                await setAuthToken(res.token);
                navigate('/');
            } else {
                throw new Error("Login failed, no token received.");
            }
        } catch (err: any) {
            console.error('Verification error:', err);
            setServerError(err.message || 'Failed to verify code');
        }
    };

    const inputBase = "w-full px-4 py-3 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950 px-4 transition-colors duration-300">
            <SEO
                title="Login"
                description={`Sign in to ${siteConfig.siteName} to access academic resources.`}
            />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl dark:shadow-slate-900/50 p-8 border border-transparent dark:border-slate-700/50"
            >
                {sent ? (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-primary-600 dark:text-red-400 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Security Verification</h1>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">Enter the 6-digit code from your email</p>
                        
                        <form onSubmit={verifyOtpForm.handleSubmit(onOtpVerify)} className="space-y-6">
                            <div className="text-left">
                                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Verification Code
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    placeholder="123456"
                                    maxLength={6}
                                    {...verifyOtpForm.register('otp')}
                                    className={`${inputBase} text-center text-2xl tracking-widest ${verifyOtpForm.formState.errors.otp ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                                />
                                {verifyOtpForm.formState.errors.otp && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{verifyOtpForm.formState.errors.otp.message}</p>
                                )}
                                {serverError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{serverError}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={verifyOtpForm.formState.isSubmitting}
                                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {verifyOtpForm.formState.isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Verify & Sign In</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                        
                        <button
                            type="button"
                            onClick={() => { 
                                setSent(false); 
                                verifyOtpForm.reset(); 
                                setServerError(''); 
                            }}
                            className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors flex items-center justify-center space-x-2"
                        >
                            <ArrowLeft size={20} />
                            <span>Back to re-enter email</span>
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back</h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                <span className="text-primary-600 dark:text-red-400 font-medium">Sign in</span> to access the {siteConfig.siteName}
                            </p>
                        </div>
                        
                        <form onSubmit={requestOtpForm.handleSubmit(onOtpRequest)} className="space-y-6">
                            <div className="text-left">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Organization Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                                    <input
                                        type="email"
                                        id="email"
                                        placeholder={`student${siteConfig.allowedEmailDomain}`}
                                        {...requestOtpForm.register('email')}
                                        className={`${inputBase} pl-10 ${requestOtpForm.formState.errors.email ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`}
                                    />
                                </div>
                                {requestOtpForm.formState.errors.email && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{requestOtpForm.formState.errors.email.message}</p>
                                )}
                                {serverError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{serverError}</p>}
                            </div>
                            <button
                                type="submit"
                                disabled={requestOtpForm.formState.isSubmitting}
                                className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 dark:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md dark:shadow-red-900/30"
                            >
                                {requestOtpForm.formState.isSubmitting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Send Verification</span>
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default Login;