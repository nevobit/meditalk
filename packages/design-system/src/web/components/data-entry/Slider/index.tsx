import * as React from "react";
import styles from "./Slider.module.css";
import { useId } from "../../../../hooks";
import { cx } from "../../../../utils";

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    hint?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ id: idProp, label, hint, error, fullWidth, className, ...rest }, ref) => {
        const id = useId(idProp);
        const hintId = hint ? `${id}-hint` : undefined;
        const errorId = error ? `${id}-error` : undefined;

        return (
            <div className={cx(styles.root, fullWidth && styles.fullWidth, className)}>
                {label && <label className={styles.label} htmlFor={id}>{label}</label>}
                <input
                    {...rest}
                    ref={ref}
                    id={id}
                    type="range"
                    className={styles.control}
                    aria-invalid={!!error || undefined}
                    aria-describedby={[error ? errorId : undefined, !error ? hintId : undefined]
                        .filter(Boolean).join(" ") || undefined}
                />
                {error ? (
                    <div id={errorId} className={cx(styles.message, styles.error)} role="alert">{error}</div>
                ) : hint ? (
                    <div id={hintId} className={cx(styles.message, styles.hint)}>{hint}</div>
                ) : null}
            </div>
        );
    }
);

Slider.displayName = "Slider";
