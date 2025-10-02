import * as React from "react";
import styles from "./Kbd.module.css";
import { cx } from "../../../../utils";

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
    keys: string | string[];
}

export const Kbd = ({ keys, className, ...rest }: KbdProps) => {
    const arr = Array.isArray(keys) ? keys : [keys];
    return (
        <kbd className={cx(styles.root, className)} {...rest}>
            {arr.join(" + ")}
        </kbd>
    );
};

Kbd.displayName = "Kbd";