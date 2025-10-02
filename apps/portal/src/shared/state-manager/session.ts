import type { User } from "@mdi/contracts";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type SessionState = {
    token: string | null;
    accessToken: string | null;
    user: User | null;
    signIn: (token: string, accessToken: string, user: User) => void;
    signOut: () => void;
    isAuthenticated: () => boolean;
};

export const useSession = create<SessionState>()(
    persist(
        (set, get) => ({
            token: null,
            accessToken: null,
            user: null,
            signIn: (token, accessToken, user) => set({ token, accessToken, user }),
            signOut: () => set({ token: null, accessToken: null, user: null }),
            isAuthenticated: () => !!get().token,
        }),
        {
            name: "mdi/session",
            storage: typeof window !== "undefined"
                ? createJSONStorage(() => window.localStorage)
                : undefined,
            partialize: (s) => ({ token: s.token, accessToken: s.accessToken, user: s.user }),
            version: 1,
        }
    )
);
