export const logger = {
    info: (message: string, ...args: unknown[]) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    warn: (message: string, ...args: unknown[]) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    error: (message: string, error?: unknown) => {
        console.error(`[ERROR] ${message}`, error);
    },
    success: (message: string, ...args: unknown[]) => {
        console.log(`[SUCCESS] ✅ ${message}`, ...args);
    },
};
