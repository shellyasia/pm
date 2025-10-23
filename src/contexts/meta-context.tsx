"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface MetaData {
    optionsPriority: string[];
    optionsFactory: string[];
    optionsTag: string[];
    optionsStatus: string[];
    oauthServer: string;
    registerURL: string;
    confluenceBaseURL: string;
}

interface MetaContextType {
    meta: MetaData | null;
    loading: boolean;
    error: Error | null;
}

const MetaContext = createContext<MetaContextType | undefined>(undefined);

export function MetaProvider({ children }: { children: React.ReactNode }) {
    const [meta, setMeta] = useState<MetaData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchMeta() {
            try {
                const response = await fetch("/api/meta");
                if (!response.ok) {
                    throw new Error("Failed to fetch meta data");
                }
                const data = await response.json();
                setMeta(data);
            } catch (err) {
                setError(
                    err instanceof Error ? err : new Error("Unknown error"),
                );
            } finally {
                setLoading(false);
            }
        }

        fetchMeta();
    }, []);

    return (
        <MetaContext.Provider value={{ meta, loading, error }}>
            {children}
        </MetaContext.Provider>
    );
}

export function useMeta(): MetaContextType {
    const context = useContext(MetaContext);
    if (context === undefined) {
        throw new Error("useMeta must be used within a MetaProvider");
    }
    return context;
}
