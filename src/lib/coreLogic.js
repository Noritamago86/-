import { MODES } from './constants.js';

/**
 * Valid dates between start and end (inclusive).
 * Simplified to just return array of ISO strings for now.
 * In a real app we'd filter by allowed weekdays.
 */
export function getDays(startDate, endDate) {
    const days = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Set to noon to avoid timezone issues for simple counting
    start.setHours(12, 0, 0, 0);
    end.setHours(12, 0, 0, 0);

    const current = new Date(start);
    while (current <= end) {
        days.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return days;
}

/**
 * Main planning function
 * @param {number} remain - Amount remaining to do
 * @param {string[]} days - Array of available date strings (YYYY-MM-DD)
 * @param {string} modeId - 'gentle' or 'strict'
 * @returns {Object} Map of date -> amount
 */
export function calculatePlan(remain, days, modeId) {
    const mode = MODES[modeId] || MODES.gentle;
    const totalDays = days.length;

    if (totalDays === 0) return {};
    if (remain <= 0) return days.reduce((acc, d) => ({ ...acc, [d]: 0 }), {});

    // 1. Calculate Buffer
    // buffer = min(maxBuffer, floor(m * bufferRate))
    const bufferCount = Math.min(
        mode.maxBuffer,
        Math.floor(totalDays * mode.bufferRate)
    );

    // Buffer days are usually at the END (safeguard). 
    // We exclude the LAST 'bufferCount' days from distribution.
    const activeDaysCount = totalDays - bufferCount;

    // If no active days (e.g. deadline is too close for buffer), fall back to using all days
    const effectiveActiveCount = activeDaysCount > 0 ? activeDaysCount : totalDays;
    const activeDays = days.slice(0, effectiveActiveCount);
    const bufferDays = days.slice(effectiveActiveCount);

    // 2. Weights Logic
    // w_k = 1 + slope * ((m-1)/2 - k) / ((m-1)/2)
    // k is index 0..m-1
    const m = effectiveActiveCount;
    const weights = [];

    if (m === 1) {
        weights.push(1);
    } else {
        const denominator = (m - 1) / 2;
        for (let k = 0; k < m; k++) {
            const w = 1 + mode.slope * (denominator - k) / denominator; // ((m-1)/2 - k) / ((m-1)/2)
            // Ensure weight is not negative (though slope < 1 prevents this typically)
            weights.push(Math.max(0, w));
        }
    }

    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // 3. Float Allocation
    const rawAllocation = weights.map(w => remain * (w / totalWeight));

    // 4. Rounding (Floor)
    const integerAllocation = rawAllocation.map(val => Math.floor(val));
    const currentSum = integerAllocation.reduce((sum, v) => sum + v, 0);
    const remainder = remain - currentSum; // Must be integer since remain is integer

    // 5. Distribute Remainder
    // "Prioritize larger decimal parts, then earlier days"
    // Create array of objects to sort: { index, decimal }
    const remainders = rawAllocation.map((val, idx) => ({
        index: idx,
        decimal: val - integerAllocation[idx]
    }));

    // Sort: descending decimal, then ascending index
    remainders.sort((a, b) => {
        if (b.decimal !== a.decimal) return b.decimal - a.decimal; // Larger decimal first
        return a.index - b.index; // Earlier day first if tie
    });

    // Distribute +1 to top 'remainder' items
    for (let i = 0; i < remainder; i++) {
        const targetIndex = remainders[i].index;
        integerAllocation[targetIndex] += 1;
    }

    // 6. Build Result Map
    const result = {};

    // Active days get allocation
    activeDays.forEach((date, idx) => {
        result[date] = integerAllocation[idx];
    });

    // Buffer days get 0
    bufferDays.forEach(date => {
        result[date] = 0;
    });

    return result;
}
