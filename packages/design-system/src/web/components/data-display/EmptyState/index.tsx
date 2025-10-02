import * as React from "react";
import styles from "./EmptyState.module.css";

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export const EmptyState = ({ icon, title, description, actions }: EmptyStateProps) => (
    <div className={styles.root}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <h2 className={styles.title}>{title}</h2>
        {description && <p className={styles.description}>{description}</p>}
        {actions && <div className={styles.actions}>{actions}</div>}
    </div>
);

EmptyState.displayName = "EmptyState";