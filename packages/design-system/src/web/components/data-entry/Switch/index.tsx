import * as React from "react";
import styles from "./Switch.module.css";
import { useId } from "../../../../hooks/useId";
import { cx } from "../../../../utils";

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?: (checked: boolean) => void;
    label?: string;
    hint?: string;
    disabled?: boolean;
    size?: "sm" | "md" | "lg";
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ checked, defaultChecked, onChange, label, hint, disabled, size = "md", className, ...rest }, ref) => {
        const [internal, setInternal] = React.useState(!!defaultChecked);
        const isControlled = typeof checked === "boolean";
        const isOn = isControlled ? !!checked : internal;
        const id = useId();

        const toggle = () => {
            if (disabled) return;
            if (!isControlled) setInternal(v => !v);
            onChange?.(!isOn);
        };

        return (
            <div className={cx(styles.root, styles[size], disabled && styles.disabled, className)}>
                <button
                    {...rest}
                    ref={ref}
                    id={id}
                    type="button"
                    role="switch"
                    aria-checked={isOn}
                    aria-disabled={disabled || undefined}
                    onClick={toggle}
                    className={cx(styles.control, isOn && styles.on)}
                    disabled={disabled}
                >
                    <span className={styles.thumb} aria-hidden="true" />
                </button>

                {label && <label htmlFor={id} className={styles.label} onClick={(e) => e.preventDefault()}>{label}</label>}
                {hint && <div className={styles.hint}>{hint}</div>}
            </div>
        );
    }
);

Switch.displayName = "Switch";
