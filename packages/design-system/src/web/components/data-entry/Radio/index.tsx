import * as React from "react";
import styles from "./Radio.module.css";
import { useId } from "../../../../hooks/useId";
import { cx } from "../../../../utils";
import { VisuallyHidden } from "../../utilities";

export interface RadioProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    label?: string;
    labelHidden?: boolean;
    hint?: string;
    error?: string;
    size?: "sm" | "md" | "lg";
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    ({ id: idProp, label, labelHidden, hint, error, size = "md", disabled, className, ...rest }, ref) => {
        const id = useId(idProp);
        const hintId = hint ? `${id}-hint` : undefined;
        const errorId = error ? `${id}-error` : undefined;

        return (
            <div className={cx(styles.root, styles[size], disabled && styles.disabled, className)}>
                <div className={styles.controlRow}>
                    <input
                        {...rest}
                        ref={ref}
                        id={id}
                        type="radio"
                        className={styles.input}
                        aria-invalid={!!error || undefined}
                        aria-describedby={[error ? errorId : undefined, !error ? hintId : undefined]
                            .filter(Boolean).join(" ") || undefined}
                        disabled={disabled}
                    />
                    <span aria-hidden="true" className={styles.box}>
                        <span className={styles.dot} />
                    </span>

                    {label ? labelHidden ? (
                        <VisuallyHidden as="label" htmlFor={id}>{label}</VisuallyHidden>
                    ) : (
                        <label className={styles.label} htmlFor={id}>{label}</label>
                    ) : null}
                </div>

                {error ? (
                    <div id={errorId} className={cx(styles.message, styles.error)} role="alert">{error}</div>
                ) : hint ? (
                    <div id={hintId} className={cx(styles.message, styles.hint)}>{hint}</div>
                ) : null}
            </div>
        );
    }
);

Radio.displayName = "Radio";
