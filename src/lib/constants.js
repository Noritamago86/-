export const MODES = {
    gentle: {
        dailyLimit: 3, // hours
        warningThreshold: 0.8,
        maxBuffer: 3,
        bufferRate: 0.2,
        slope: 0.5,
        copy: {
            ok: "今日も1日頑張りましょう！",
            warn: "マイペースで進めましょう"
        }
    },
    strict: {
        dailyLimit: 5,
        warningThreshold: 0.9,
        maxBuffer: 2,
        bufferRate: 0.1,
        slope: 1.5,
        copy: {
            ok: "自分を追い込め！限界を超えろ！",
            warn: "遅れています！気合いを入れ直せ！"
        }
    }
};

export const THEMES = {
    midnight: {
        name: 'Midnight (Default)',
        colors: {
            '--bg-primary': '#1a1b26',
            '--bg-gradient': 'linear-gradient(135deg, #1f2335 0%, #1a1b26 100%)',
            '--accent': '#7aa2f7',
            '--card-bg': 'rgba(26, 27, 38, 0.8)', // Increased opacity
            '--text-main': '#ffffff', // Pure white for better contrast
            '--text-sub': '#a9b1d6', // Lighter subtext
            '--white-a10': 'rgba(255, 255, 255, 0.15)',
            '--white-a20': 'rgba(255, 255, 255, 0.25)'
        }
    },
    ocean: {
        name: 'Ocean',
        colors: {
            '--bg-primary': '#0f172a',
            '--bg-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            '--accent': '#38bdf8',
            '--card-bg': 'rgba(15, 23, 42, 0.85)', // Higher opacity
            '--text-main': '#f0f9ff', // Brighter white
            '--text-sub': '#94a3b8',
            '--white-a10': 'rgba(255, 255, 255, 0.1)',
            '--white-a20': 'rgba(255, 255, 255, 0.2)'
        }
    },
    forest: {
        name: 'Forest',
        colors: {
            '--bg-primary': '#1a2f1a',
            '--bg-gradient': 'linear-gradient(135deg, #14532d 0%, #1a2f1a 100%)',
            '--accent': '#4ade80',
            '--card-bg': 'rgba(20, 50, 20, 0.85)',
            '--text-main': '#ffffff',
            '--text-sub': '#bbf7d0', // High contrast green-white
            '--white-a10': 'rgba(255, 255, 255, 0.1)',
            '--white-a20': 'rgba(255, 255, 255, 0.2)'
        }
    },
    sunset: {
        name: 'Sunset',
        colors: {
            '--bg-primary': '#4c0519',
            '--bg-gradient': 'linear-gradient(135deg, #881337 0%, #4c0519 100%)',
            '--accent': '#fb7185',
            '--card-bg': 'rgba(80, 20, 30, 0.85)',
            '--text-main': '#fff1f2',
            '--text-sub': '#fecdd3',
            '--white-a10': 'rgba(255, 255, 255, 0.1)',
            '--white-a20': 'rgba(255, 255, 255, 0.2)'
        }
    },
    snow: {
        name: 'Snow (Light)',
        colors: {
            '--bg-primary': '#f8fafc',
            '--bg-gradient': 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            '--accent': '#2563eb', // Darker blue for contrast on light bg
            '--card-bg': 'rgba(255, 255, 255, 0.95)', // Almost opaque
            '--text-main': '#0f172a', // Very dark slate
            '--text-sub': '#475569',
            '--white-a10': 'rgba(0, 0, 0, 0.05)',
            '--white-a20': 'rgba(0, 0, 0, 0.1)'
        }
    }
};

export const TIME_UNITS = [
    { value: 'page', label: 'ページ' },
    { value: 'min', label: '分' },
    { value: 'hour', label: '時間' },
    { value: 'count', label: '回/個' }
];

export const TASK_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEEAD', // Cream
    '#D4A5A5', // Pink
    '#9B59B6', // Purple
    '#3498DB', // Dark Blue
    '#E67E22', // Orange
    '#2ECC71'  // Emerald
];

export const FONTS = {
    sans: {
        name: 'Standard (Gothic)',
        value: '"Inter", "Noto Sans JP", sans-serif'
    },
    serif: {
        name: 'Classic (Mincho)',
        value: '"Shippori Mincho", serif'
    },
    rounded: {
        name: 'Cute (Rounded)',
        value: '"Zen Maru Gothic", sans-serif'
    }
};
