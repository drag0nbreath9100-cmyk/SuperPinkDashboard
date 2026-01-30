"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
    // Create QueryClient instance inside component to avoid SSR issues
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Data is considered fresh for 2 minutes
                        staleTime: 2 * 60 * 1000,
                        // Cache data for 5 minutes after becoming unused
                        gcTime: 5 * 60 * 1000,
                        // Refetch when window regains focus (user tabs back)
                        refetchOnWindowFocus: true,
                        // Refetch when component mounts if data is stale
                        refetchOnMount: true,
                        // Retry failed requests once
                        retry: 1,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
