import React from "react";
import styles from "./Select.module.css";
import { useId } from "../../../../hooks/useId";
import { VisuallyHidden } from "../../utilities";
import { cx } from "../../../../utils";

type SelectStatus = "none" | "error" | "success";
type SelectSize = "sm" | "md" | "lg";

export interface SelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    label?: string;
    labelHidden?: boolean;
    hint?: string;
    error?: string;
    success?: string;
    status?: SelectStatus;
    size?: SelectSize;
    fullWidth?: boolean;
    /** Optional leading icon (decorative) */
    icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            id: idProp,
            label,
            labelHidden,
            hint,
            error,
            success,
            status = "none",
            size = "md",
            fullWidth,
            icon,
            disabled,
            className,
            children,
            "aria-describedby": ariaDescribedByProp,
            ...rest
        },
        ref
    ) => {
        const controlId = useId(idProp);
        const hintId = hint ? `${controlId}-hint` : undefined;
        const errorId = error ? `${controlId}-error` : undefined;
        const successId = success ? `${controlId}-success` : undefined;

        const describedBy = [
            ariaDescribedByProp,
            error ? errorId : undefined,
            !error && success ? successId : undefined,
            !error && !success && hint ? hintId : undefined,
        ]
            .filter(Boolean)
            .join(" ")
            .trim() || undefined;

        const derivedStatus: SelectStatus =
            error ? "error" : success ? "success" : status;

        const rootClass = cx(
            styles.root,
            styles[size],
            fullWidth && styles.fullWidth,
            disabled && styles.disabled,
            derivedStatus !== "none" && styles[derivedStatus],
            className
        );

        return (
            <div className={rootClass} data-status={derivedStatus} data-size={size}>
                {label && (
                    labelHidden ? (
                        <VisuallyHidden as="label" htmlFor={controlId}>
                            {label}
                        </VisuallyHidden>
                    ) : (
                        <label className={styles.label} htmlFor={controlId}>
                            {label}
                        </label>
                    )
                )}

                <div className={styles.field}>
                    {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}

                    <select
                        id={controlId}
                        ref={ref}
                        className={styles.control}
                        aria-invalid={derivedStatus === "error" || undefined}
                        aria-describedby={describedBy}
                        disabled={disabled}
                        {...rest}
                    >
                        {children}
                    </select>
                </div>

                {error ? (
                    <div id={errorId} className={cx(styles.message, styles.error)} role="alert">
                        {error}
                    </div>
                ) : success ? (
                    <div id={successId} className={cx(styles.message, styles.success)} role="status" aria-live="polite">
                        {success}
                    </div>
                ) : hint ? (
                    <div id={hintId} className={cx(styles.message, styles.hint)}>
                        {hint}
                    </div>
                ) : null}
            </div>
        );
    }
);

Select.displayName = "Select";
