import { create } from "zustand";

type SessionState = {
    token: string | null;
    userName: string | null;
    signIn: (token: string, userName: string) => void;
    signOut: () => void;
    isAuthenticated: () => boolean;
};

export const useSession = create<SessionState>((set, get) => ({
    token: null,
    userName: null,
    signIn: (token, userName) => set({ token, userName }),
    signOut: () => set({ token: null, userName: null }),
    isAuthenticated: () => !!get().token
}));
