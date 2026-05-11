import api from './api';

export const analytics = {
    /**
     * Tracks a user visit.
     */
    trackVisit: async (userId?: string) => {
        try {
            const STORAGE_KEY = 'muc_library_visitor_token';
            let visitorToken = localStorage.getItem(STORAGE_KEY);

            if (!visitorToken) {
                visitorToken = crypto.randomUUID();
                localStorage.setItem(STORAGE_KEY, visitorToken);
            }

            const payload: any = {};
            if (userId) payload.userId = userId;
            else payload.visitorToken = visitorToken;

            await api.post('/analytics/track', payload);
        } catch (err) {
            console.error('Analytics error:', err);
        }
    },

    /**
     * Gets the total number of unique users tracked.
     */
    getTotalUniqueUsers: async () => {
        try {
            const { data } = await api.get('/analytics/users');
            return data || 0;
        } catch (error) {
            console.error('Error fetching total users:', error);
            return 0;
        }
    },

    /**
     * Gets book counts grouped by college/section.
     */
    getBookCountsByCollege: async () => {
        try {
            const { data, visits, growth } = await api.get('/analytics/books');
            return { data: data || {}, visits: visits || {}, growth: growth || {} };
        } catch (error) {
            console.error('Error fetching book counts by college:', error);
            return { data: {}, visits: {}, growth: {} };
        }
    },

    /**
     * Gets count of books in a specific category (Department).
     */
    getCategoryBookCount: async (category: string, collegeId?: string) => {
        try {
            let query = '';
            if (collegeId && collegeId !== 'all') {
                query = `?collegeId=${collegeId}`;
            }
            const { data } = await api.get(`/analytics/category/${encodeURIComponent(category)}${query}`);
            return data || 0;
        } catch (error) {
            console.error('Error fetching category count:', error);
            return 0;
        }
    },

    /**
     * Tracks a visit to a specific department.
     */
    trackDepartmentVisit: async (departmentId: string, userId?: string) => {
        try {
            const STORAGE_KEY = 'muc_library_visitor_token';
            let visitorToken = localStorage.getItem(STORAGE_KEY);
            if (!visitorToken) {
                visitorToken = crypto.randomUUID();
                localStorage.setItem(STORAGE_KEY, visitorToken);
            }

            const payload: any = {};
            if (userId) payload.userId = userId;
            else payload.visitorToken = visitorToken;

            await api.post(`/colleges/departments/${departmentId}/visit`, payload);
        } catch (err) {
            console.error('Dept Analytics error:', err);
        }
    },

    /**
     * Gets top performing departments by visit count.
     */
    getTopDepartments: async () => {
        try {
            const { data } = await api.get('/analytics/top-departments');
            return data || [];
        } catch (error) {
            console.error('Error fetching top departments:', error);
            return [];
        }
    },

    /**
     * Gets department breakdown for a specific college.
     */
    getDepartmentStatsByCollege: async (collegeId: string) => {
        try {
            const { data } = await api.get(`/analytics/college/${collegeId}/department-stats`);
            return data || [];
        } catch (error) {
            console.error('Error fetching department stats:', error);
            return [];
        }
    }
};
