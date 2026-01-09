import { calculatePlan, getDays } from './src/lib/coreLogic.js';
import { MODES } from './src/lib/constants.js';

// Mock simple console test
console.log("=== Testing Logic ===");

const today = "2026-01-01";
const deadline = "2026-01-10"; // 10 days inclusive
const days = getDays(today, deadline);

console.log(`Total Days: ${days.length}`); // 10

// Test 1: Gentle Mode (Buffer Check)
// 10 days, rate 0.12 => 1.2 => floor(1) buffer = 1? But logic: min(2, floor(10*0.12)) = 1.
// So 9 active days, 1 buffer.
const planGentle = calculatePlan(100, days, 'gentle');
console.log("\n[Gentle Mode] (100 items, 10 days)");
console.log("Plan:", planGentle);
const lastDay = days[days.length - 1];
console.log(`Last Day Value (Buffer?): ${planGentle[lastDay]} (Expected: 0)`);
const sumGentle = Object.values(planGentle).reduce((a, b) => a + b, 0);
console.log(`Sum: ${sumGentle} (Expected: 100)`);

// Test 2: Strict Mode (Front Loading)
// 10 days, buffer 0.
// Slope 0.35.
// k=0 (start) should be heavier than k=9 (end).
const planStrict = calculatePlan(100, days, 'strict');
console.log("\n[Strict Mode] (100 items, 10 days)");
console.log("Plan:", planStrict);
console.log(`First Day: ${planStrict[days[0]]}`);
console.log(`Last Day: ${planStrict[days[9]]}`);
if (planStrict[days[0]] > planStrict[days[9]]) console.log("PASS: Front loaded");
else console.log("FAIL: Not front loaded");

// Test 3: Short Duration (3 days)
// Gentle: 3 * 0.12 = 0.36 => 0 buffer.
const shortDays = getDays(today, "2026-01-03");
const planShort = calculatePlan(10, shortDays, 'gentle');
console.log("\n[Short Duration] (10 items, 3 days)");
console.log(planShort);

console.log("=== Test Complete ===");
