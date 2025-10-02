import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type SidebarItem = {
    key: string;
    label: string;
    icon: LucideIcon | ((props: { className?: string }) => ReactNode);
    href?: string;
    onClick?: () => void;
    badge?: string | number;
    active?: boolean;
    title?: string;
};

export type SidebarGroup = {
    id: string;
    items: SidebarItem[];
    gutterTop?: boolean;
};
