"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "system" | "light" | "dark";

type UIState = {
    sidebarOpen: boolean;
    mobileNavOpen: boolean;
    theme: Theme;
};

type UIActions = {
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;

    setMobileNavOpen: (open: boolean) => void;
    toggleMobileNav: () => void;

    setTheme: (theme: Theme) => void;
};

export const useUIStore = create<UIState & UIActions>()(
    persist(
        (set, get) => ({
            sidebarOpen: false,
            mobileNavOpen: false,
            theme: "system",

            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

            setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
            toggleMobileNav: () => set({ mobileNavOpen: !get().mobileNavOpen }),

            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "ui-store",
            partialize: (state) => ({
                sidebarOpen: state.sidebarOpen,
                mobileNavOpen: state.mobileNavOpen,
                theme: state.theme,
            }),
        }
    )
);
