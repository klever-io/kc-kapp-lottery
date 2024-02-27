"use client";

import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, ScStatusProvider } from "@/contexts";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <ScStatusProvider>
        {children}
        <Toaster />
      </ScStatusProvider>
    </AuthProvider>
  );
}
