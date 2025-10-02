import * as React from "react";
import styles from "./Checkbox.module.css";
import { useId } from "../../../../hooks/useId";
import { cx } from "../../../../utils";
import { VisuallyHidden } from "../../utilities";

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
    label?: string;
    labelHidden?: boolean;
    hint?: string;
    error?: string;
    indeterminate?: boolean;
    size?: "sm" | "md" | "lg";
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            id: idProp,
            label,
            labelHidden,
            hint,
            error,
            disabled,
            indeterminate,
            size = "md",
            className,
            ...rest
        },
        ref
    ) => {
        const id = useId(idProp);
        const hintId = hint ? `${id}-hint` : undefined;
        const errorId = error ? `${id}-error` : undefined;

        const inputRef = React.useRef<HTMLInputElement>(null);
        React.useEffect(() => {
            if (inputRef.current) inputRef.current.indeterminate = !!indeterminate;
        }, [indeterminate]);

        return (
            <div
                className={cx(styles.root, styles[size], disabled && styles.disabled, className)}
                data-size={size}
            >
                <div className={styles.controlRow}>
                    <input
                        {...rest}
                        ref={(node) => {
                            inputRef.current = node!;
                            if (typeof ref === "function") ref(node);
                            else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
                        }}
                        id={id}
                        type="checkbox"
                        className={styles.input}
                        aria-invalid={!!error || undefined}
                        aria-describedby={[error ? errorId : undefined, !error ? hintId : undefined]
                            .filter(Boolean)
                            .join(" ") || undefined}
                        disabled={disabled}
                    />
                    <span aria-hidden="true" className={styles.box}>
                        <svg className={styles.icon} viewBox="0 0 16 16" focusable="false">
                            {/* check */}
                            <polyline points="3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <svg className={styles.iconInd} viewBox="0 0 16 16" focusable="false">
                            {/* indeterminate */}
                            <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </span>

                    {label ? (
                        labelHidden ? (
                            <VisuallyHidden as="label" htmlFor={id}>{label}</VisuallyHidden>
                        ) : (
                            <label className={styles.label} htmlFor={id}>{label}</label>
                        )
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

Checkbox.displayName = "Checkbox";
