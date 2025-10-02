import React from "react";
import styles from "./Textarea.module.css";
import { useId } from "../../../../hooks/useId";
import { cx } from "../../../../utils";
import { VisuallyHidden } from "../../utilities";

type TextareaStatus = "none" | "error" | "success";
type TextareaSize = "sm" | "md" | "lg";

export interface TextareaProps
    extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
    label?: string;
    labelHidden?: boolean;
    hint?: string;
    error?: string;
    success?: string;
    status?: TextareaStatus;
    size?: TextareaSize;
    fullWidth?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
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
            disabled,
            readOnly,
            className,
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

        const derivedStatus: TextareaStatus =
            error ? "error" : success ? "success" : status;

        const rootClass = cx(
            styles.root,
            styles[size],
            fullWidth && styles.fullWidth,
            disabled && styles.disabled,
            readOnly && styles.readOnly,
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

                <textarea
                    id={controlId}
                    ref={ref}
                    className={styles.control}
                    aria-invalid={derivedStatus === "error" || undefined}
                    aria-describedby={describedBy}
                    disabled={disabled}
                    readOnly={readOnly}
                    {...rest}
                />

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

Textarea.displayName = "Textarea";
