const DB_KEY = 'ganbatte_data_v1';

const DEFAULT_DATA = {
    tasks: [],   // { id, title, total, unit, dueDate, done, priority, memo, createdAt }
    logs: [],    // { id, taskId, date, amount, timestamp }
    settings: {
        mode: 'gentle', // 'gentle' | 'strict'
        studyWeekdays: [0, 1, 2, 3, 4, 5, 6], // 0=Sun
        onboardingDone: false
    }
};

export const Storage = {
    get: () => {
        if (typeof window === 'undefined') return DEFAULT_DATA;
        try {
            const stored = localStorage.getItem(DB_KEY);
            if (!stored) return DEFAULT_DATA;
            const parsed = JSON.parse(stored);
            // Merge with default to ensure schema compatibility
            return { ...DEFAULT_DATA, ...parsed, settings: { ...DEFAULT_DATA.settings, ...parsed.settings } };
        } catch (e) {
            console.error("Storage Load Error", e);
            return DEFAULT_DATA;
        }
    },

    save: (data) => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(DB_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Storage Save Error", e);
        }
    },

    // Helper to reset for testing
    reset: () => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(DB_KEY);
    }
};
