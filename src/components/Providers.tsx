'use client';

import { SessionProvider } from "next-auth/react";
import { GameProvider } from "@/lib/GameContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <GameProvider>
        {children}
      </GameProvider>
    </SessionProvider>
  );
}
