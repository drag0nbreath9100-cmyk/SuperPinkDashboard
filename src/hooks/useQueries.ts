"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, Client, Coach, Alert, ChurnRisk, CURRENT_COACH_ID } from "@/lib/api";

// ============================================================================
// Query Keys - Centralized for consistency and easy invalidation
// ============================================================================
export const queryKeys = {
    // Base keys
    coaches: ["coaches"] as const,
    clients: ["clients"] as const,
    alerts: ["alerts"] as const,
    dashboardStats: ["dashboardStats"] as const,
    churnRisks: ["churnRisks"] as const,
    intelligenceFeed: ["intelligenceFeed"] as const,

    // Parameterized keys
    coach: (id: string) => ["coaches", id] as const,
    client: (id: string | number) => ["clients", id] as const,
    coachClients: (coachId: string) => ["clients", "coach", coachId] as const,
    coachStats: (coachId: string) => ["coachStats", coachId] as const,
    coachChurnRisks: (coachId: string) => ["churnRisks", "coach", coachId] as const,
    coachAdherence: (coachId: string) => ["adherence", coachId] as const,
};

// ============================================================================
// Coach Hooks
// ============================================================================
export function useCoaches() {
    return useQuery({
        queryKey: queryKeys.coaches,
        queryFn: () => api.getCoaches({ bypassCache: true }),
    });
}

export function useCoach(id: string) {
    return useQuery({
        queryKey: queryKeys.coach(id),
        queryFn: () => api.getCoach(id),
        enabled: !!id,
    });
}

// ============================================================================
// Client Hooks
// ============================================================================
export function useClients(options?: { lightweight?: boolean }) {
    return useQuery({
        queryKey: [...queryKeys.clients, options?.lightweight ? "light" : "full"],
        queryFn: () => api.getClients({ bypassCache: true, lightweight: options?.lightweight }),
    });
}

export function useClient(id: string | number) {
    return useQuery({
        queryKey: queryKeys.client(id),
        queryFn: () => api.getClient(id),
        enabled: !!id,
    });
}

export function useCoachClients(coachId: string) {
    return useQuery({
        queryKey: queryKeys.coachClients(coachId),
        queryFn: () => api.getCoachClients(coachId, { bypassCache: true }),
        enabled: !!coachId,
    });
}

// ============================================================================
// Stats Hooks
// ============================================================================
export function useDashboardStats() {
    return useQuery({
        queryKey: queryKeys.dashboardStats,
        queryFn: () => api.getDashboardStats(),
    });
}

export function useCoachStats(coachId: string) {
    return useQuery({
        queryKey: queryKeys.coachStats(coachId),
        queryFn: () => api.getCoachStats(coachId, { bypassCache: true }),
        enabled: !!coachId,
    });
}

// ============================================================================
// Risk & Intelligence Hooks
// ============================================================================
export function useAlerts() {
    return useQuery({
        queryKey: queryKeys.alerts,
        queryFn: () => api.getAlerts({ bypassCache: true }),
        // Alerts should refresh more frequently
        staleTime: 1 * 60 * 1000, // 1 minute
    });
}

export function useChurnRisks() {
    return useQuery({
        queryKey: queryKeys.churnRisks,
        queryFn: () => api.getChurnRiskReport(),
    });
}

export function useCoachChurnRisks(coachId: string) {
    return useQuery({
        queryKey: queryKeys.coachChurnRisks(coachId),
        queryFn: () => api.getCoachChurnRiskReport(coachId),
        enabled: !!coachId,
    });
}

export function useIntelligenceFeed() {
    return useQuery({
        queryKey: queryKeys.intelligenceFeed,
        queryFn: () => api.getIntelligenceFeed(),
    });
}

export function useClientAdherenceScores(coachId: string) {
    return useQuery({
        queryKey: queryKeys.coachAdherence(coachId),
        queryFn: () => api.getClientAdherenceScores(coachId),
        enabled: !!coachId,
    });
}

// ============================================================================
// Convenience Hooks for Current Coach
// ============================================================================
export function useCurrentCoach() {
    return useCoach(CURRENT_COACH_ID);
}

export function useCurrentCoachClients() {
    return useCoachClients(CURRENT_COACH_ID);
}

export function useCurrentCoachStats() {
    return useCoachStats(CURRENT_COACH_ID);
}

export function useCurrentCoachChurnRisks() {
    return useCoachChurnRisks(CURRENT_COACH_ID);
}

export function useCurrentCoachAdherence() {
    return useClientAdherenceScores(CURRENT_COACH_ID);
}

// ============================================================================
// Mutation Hooks (with cache invalidation)
// ============================================================================
export function useUpdateClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: number; updates: Partial<Client> }) =>
            api.updateClient(id, updates),
        onSuccess: (_, { id }) => {
            // Invalidate specific client and all client lists
            queryClient.invalidateQueries({ queryKey: queryKeys.client(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.clients });
        },
    });
}

export function useUpdateCoach() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: Partial<Coach> }) =>
            api.updateCoach(id, updates),
        onSuccess: (_, { id }) => {
            // Invalidate specific coach and coach list
            queryClient.invalidateQueries({ queryKey: queryKeys.coach(id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.coaches });
        },
    });
}
