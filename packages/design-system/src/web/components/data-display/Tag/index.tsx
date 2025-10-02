import * as React from "react";
import styles from "./Tag.module.css";
import { cx } from "../../../../utils";

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
    tone?: "default" | "success" | "warning" | "danger";
}

export const Tag = ({ tone = "default", className, ...rest }: TagProps) => {
    return (
        <span className={cx(styles.root, styles[tone], className)} {...rest} />
    );
};

Tag.displayName = "Tag";