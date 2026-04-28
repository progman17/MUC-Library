const getBaseUrl = () => {
    // نستخدم الرابط من الـ env أو نعتمد البورت 5000 كافتراضي
    const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;
};

const API_URL = getBaseUrl();

export const api = {
    async request(endpoint: string, options: RequestInit = {}) {
        const token = localStorage.getItem('auth_token');
        const headers = new Headers(options.headers || {});
        
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }
        
        if (!(options.body instanceof FormData)) {
            headers.set('Content-Type', 'application/json');
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers,
            });

            // محاولة قراءة الـ JSON، وإذا فشل نرجع كائن فارغ
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                // إظهار تفاصيل الخطأ القادم من السيرفر في الكونسول للمساعدة
                console.error(`API Error (${response.status}):`, data);
                throw new Error(data.error || data.details || 'API Request Failed');
            }

            return data;
        } catch (error: any) {
            console.error('Fetch Network Error:', error);
            throw error;
        }
    },
    get(endpoint: string, options?: RequestInit) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },
    post(endpoint: string, body: any, options?: RequestInit) {
        return this.request(endpoint, { 
            ...options, 
            method: 'POST', 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        });
    },
    put(endpoint: string, body: any, options?: RequestInit) {
        return this.request(endpoint, { 
            ...options, 
            method: 'PUT', 
            body: body instanceof FormData ? body : JSON.stringify(body) 
        });
    },
    delete(endpoint: string, options?: RequestInit) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }
};

export default api;