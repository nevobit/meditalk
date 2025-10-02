import * as React from "react";
import styles from "./Progress.module.css";
import { cx } from "../../../../utils";
export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    label?: string;
}

export const Progress = ({ value, max = 100, label, className, ...rest }: ProgressProps) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
        <div className={cx(styles.root, className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label} {...rest}>
            <div className={styles.bar} style={{ width: `${pct}%` }} />
        </div>
    );
};

Progress.displayName = "Progress";