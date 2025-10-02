import * as React from "react";
import styles from "./Alert.module.css";
import { cx } from "../../../../utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
    tone?: "info" | "success" | "warning" | "error";
    title?: string;
}

export const Alert = ({ tone = "info", title, children, className, ...rest }: AlertProps) => (
    <div className={cx(styles.root, styles[tone], className)} role="alert" {...rest}>
        {title && <strong className={styles.title}>{title}</strong>}
        <div className={styles.content}>{children}</div>
    </div>
);
