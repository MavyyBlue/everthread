export const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
export const roundMoney = (value: number) => Math.round(value * 100) / 100;
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const percent = (value: number, total: number) => (total === 0 ? 0 : (value / total) * 100);
export const gaussianish = (randomA: number, randomB: number, randomC: number) => (randomA + randomB + randomC) / 3;
