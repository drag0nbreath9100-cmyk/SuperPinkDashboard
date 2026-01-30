/**
 * Session-based cache manager for Supabase data
 * Reduces egress by caching API responses in sessionStorage with TTL
 */

interface CacheEntry<T> {
    data: T;
    expiry: number;
    timestamp: number;
}

const CACHE_PREFIX = 'spd_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

export const CacheManager = {
    /**
     * Get cached data if it exists and hasn't expired
     */
    get<T>(key: string): T | null {
        if (!isBrowser) return null;

        try {
            const raw = sessionStorage.getItem(CACHE_PREFIX + key);
            if (!raw) return null;

            const entry: CacheEntry<T> = JSON.parse(raw);
            const now = Date.now();

            if (now > entry.expiry) {
                // Cache expired, remove it
                sessionStorage.removeItem(CACHE_PREFIX + key);
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Cache] EXPIRED: ${key}`);
                }
                return null;
            }

            if (process.env.NODE_ENV === 'development') {
                const remaining = Math.round((entry.expiry - now) / 1000);
                console.log(`[Cache] HIT: ${key} (${remaining}s remaining)`);
            }

            return entry.data;
        } catch (error) {
            console.error('[Cache] Error reading cache:', error);
            return null;
        }
    },

    /**
     * Store data in cache with TTL
     */
    set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
        if (!isBrowser) return;

        try {
            const entry: CacheEntry<T> = {
                data,
                expiry: Date.now() + ttl,
                timestamp: Date.now()
            };
            sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));

            if (process.env.NODE_ENV === 'development') {
                console.log(`[Cache] SET: ${key} (TTL: ${Math.round(ttl / 1000)}s)`);
            }
        } catch (error) {
            // Handle quota exceeded or other storage errors
            console.error('[Cache] Error setting cache:', error);
            // Try to clear old entries if storage is full
            CacheManager.clearExpired();
        }
    },

    /**
     * Invalidate a specific cache entry
     */
    invalidate(key: string): void {
        if (!isBrowser) return;
        sessionStorage.removeItem(CACHE_PREFIX + key);
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Cache] INVALIDATED: ${key}`);
        }
    },

    /**
     * Invalidate all cache entries matching a pattern
     */
    invalidatePattern(pattern: string): void {
        if (!isBrowser) return;

        const keys = Object.keys(sessionStorage);
        const regex = new RegExp(pattern);
        let count = 0;

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX) && regex.test(key.replace(CACHE_PREFIX, ''))) {
                sessionStorage.removeItem(key);
                count++;
            }
        });

        if (process.env.NODE_ENV === 'development') {
            console.log(`[Cache] INVALIDATED ${count} entries matching: ${pattern}`);
        }
    },

    /**
     * Clear all expired cache entries
     */
    clearExpired(): void {
        if (!isBrowser) return;

        const now = Date.now();
        const keys = Object.keys(sessionStorage);
        let cleared = 0;

        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                try {
                    const raw = sessionStorage.getItem(key);
                    if (raw) {
                        const entry: CacheEntry<unknown> = JSON.parse(raw);
                        if (now > entry.expiry) {
                            sessionStorage.removeItem(key);
                            cleared++;
                        }
                    }
                } catch {
                    // Remove corrupted entries
                    sessionStorage.removeItem(key);
                    cleared++;
                }
            }
        });

        if (process.env.NODE_ENV === 'development' && cleared > 0) {
            console.log(`[Cache] Cleared ${cleared} expired entries`);
        }
    },

    /**
     * Clear all cache entries
     */
    clearAll(): void {
        if (!isBrowser) return;

        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
            if (key.startsWith(CACHE_PREFIX)) {
                sessionStorage.removeItem(key);
            }
        });

        if (process.env.NODE_ENV === 'development') {
            console.log('[Cache] CLEARED ALL');
        }
    }
};

// Cache key constants for consistency
export const CACHE_KEYS = {
    CLIENTS_ALL: 'clients_all',
    CLIENTS_LIGHT: 'clients_light', // Lightweight version with fewer columns
    COACHES_ALL: 'coaches_all',
    DASHBOARD_STATS: 'dashboard_stats',
    ALERTS: 'alerts',
    CHURN_RISKS: 'churn_risks',
    COACH_CLIENTS: (coachId: string) => `coach_clients_${coachId}`,
    COACH_STATS: (coachId: string) => `coach_stats_${coachId}`,
    COACH_CHURN: (coachId: string) => `coach_churn_${coachId}`,
    COACH_ADHERENCE: (coachId: string) => `coach_adherence_${coachId}`,
} as const;

// TTL constants (in milliseconds)
export const CACHE_TTL = {
    SHORT: 2 * 60 * 1000,   // 2 minutes - for frequently changing data
    MEDIUM: 5 * 60 * 1000,  // 5 minutes - default
    LONG: 10 * 60 * 1000,   // 10 minutes - for rarely changing data
} as const;
