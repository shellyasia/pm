"use client";

import React from "react";
import { AuthProvider } from "./auth-context";
import { MetaProvider } from "./meta-context";

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <MetaProvider>
        {children}
      </MetaProvider>
    </AuthProvider>
  );
}
