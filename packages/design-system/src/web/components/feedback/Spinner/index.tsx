import * as React from "react";
import styles from "./Spinner.module.css";
import { cx } from "../../../../utils";

export interface SpinnerProps extends React.SVGAttributes<SVGElement> {
    size?: "sm" | "md" | "lg";
    tone?: "default" | "accent" | "inverse";
}

export const Spinner = ({ size = "md", tone = "default", className, ...rest }: SpinnerProps) => (
    <svg
        viewBox="0 0 50 50"
        className={cx(styles.root, styles[size], styles[tone], className)}
        {...rest}
    >
        <circle className={styles.circle} cx="25" cy="25" r="20" fill="none" strokeWidth="5" />
    </svg>
);
