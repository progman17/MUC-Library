import { createContext, useContext, useEffect, useState } from 'react';
import api from '../lib/api';

type UserRole = 'student' | 'admin' | null;

interface User {
    id: string;
    email: string;
    displayName?: string;
    phone?: string;
    role: string;
    profilePath?: string;
}

interface AuthContextType {
    session: boolean;
    user: User | null;
    role: UserRole;
    profilePath: string | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
    setAuthToken: (token: string) => Promise<void>;
    updateUserSession: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Builds an absolute URL for any uploaded file.
 *
 * Handles two storage formats that may exist in the DB:
 *   1. Legacy flat filename:  "cover-1234.jpg"
 *   2. Full relative path:    "books-covers/cover-1234.jpg"
 *
 * For flat filenames it detects the subfolder from the multer fieldname prefix.
 */
export const getMediaUrl = (filePath: string | null | undefined): string => {
    if (!filePath) return '';

    // لو رابط خارجي (جوجل درايف أو غيره)
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        const match = filePath.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.google\.com\/uc\?.*?id=)([-_a-zA-Z0-9]+)/);
        if (match && match[1]) {
            return `https://drive.google.com/uc?export=view&id=${match[1]}`;
        }
        return filePath;
    }

    // Strip accidental leading 'uploads/' stored in DB
    let clean = filePath.replace(/^uploads[\\/]/, '').replace(/\\/g, '/');

    // If no subfolder is present, infer it from the filename prefix
    if (!clean.includes('/')) {
        if (clean.startsWith('cover-'))   clean = `books-covers/${clean}`;
        else if (clean.startsWith('pdf-'))    clean = `books-pdfs/${clean}`;
        else if (clean.startsWith('profile-')) clean = `profiles/${clean}`;
    }

    const base = import.meta.env.VITE_API_URL || '';
    return `${base}/uploads/${clean}`;
};
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const initialUser: User | null = (() => {
        try { return JSON.parse(localStorage.getItem('user_data') || 'null'); }
        catch { return null; }
    })();

    const [session, setSession] = useState<boolean>(!!localStorage.getItem('auth_token'));
    const [user, setUser] = useState<User | null>(initialUser);
    const [role, setRole] = useState<UserRole>((initialUser?.role as UserRole) || null);
    const [profilePath, setProfilePath] = useState<string | null>(initialUser?.profilePath || null);
    const [loading, setLoading] = useState<boolean>(!initialUser);

    useEffect(() => {
        // Only hit /auth/me if a token already exists — avoids unnecessary CORS preflight errors
        if (localStorage.getItem('auth_token')) {
            fetchUserProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const saveUserSession = (userData: User) => {
        setUser(userData);
        setSession(true);
        setRole(userData.role as UserRole);
        setProfilePath(userData.profilePath || null);
        localStorage.setItem('user_data', JSON.stringify(userData));
    };

    const clearSession = () => {
        setUser(null);
        setSession(false);
        setRole(null);
        setProfilePath(null);
        setLoading(false);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
    };

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) { clearSession(); return; }
        try {
            const data = await api.get('/auth/me');
            if (data?.user) {
                saveUserSession(data.user);
            } else {
                throw new Error('Invalid user data');
            }
        } catch (err) {
            console.error('Auth session error:', err);
            clearSession();
        } finally {
            setLoading(false);
        }
    };

    /**
     * Persists the token then awaits the profile fetch before resolving.
     * This ensures `session` is true before any caller does navigate().
     */
    const setAuthToken = async (token: string): Promise<void> => {
        localStorage.setItem('auth_token', token);
        await fetchUserProfile();
    };

    const refreshProfile = async () => { await fetchUserProfile(); };

    const signOut = async () => { clearSession(); };

    const updateUserSession = (data: Partial<User>) => {
        if (user) saveUserSession({ ...user, ...data });
    };

    return (
        <AuthContext.Provider value={{ session, user, role, profilePath, loading, signOut, refreshProfile, setAuthToken, updateUserSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
