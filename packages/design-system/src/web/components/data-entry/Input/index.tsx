import React from "react";
import styles from "./Input.module.css";
import { cx } from "../../../../utils";
import { VisuallyHidden } from "../../utilities";
import { useId } from "../../../../hooks/useId";
import { Eye, EyeOff, X } from "lucide-react";

type InputStatus = "none" | "error" | "success";
type InputSize = "sm" | "md" | "lg";

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "prefix" | "suffix"> {
    label?: string;
    labelHidden?: boolean;
    hint?: string;
    error?: string;
    success?: string;
    status?: InputStatus;
    size?: InputSize;
    fullWidth?: boolean;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
    icon?: React.ReactNode;
    clearable?: boolean;
    onClear?: () => void;
    togglePassword?: boolean;
    deprecatedCheckbox?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
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
            prefix,
            suffix,
            icon,
            clearable,
            onClear,
            togglePassword,
            type = "text",
            disabled,
            readOnly,
            className,
            "aria-describedby": ariaDescribedByProp,
            deprecatedCheckbox,
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

        const derivedStatus: InputStatus =
            error ? "error" : success ? "success" : status;

        const [revealed, setRevealed] = React.useState(false);
        const isPassword = type === "password";
        const inputType = isPassword && togglePassword ? (revealed ? "text" : "password") : type;

        const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            onClear?.();
        };

        // if (process.env.NODE_ENV !== "production") {
        //     if (!label && !ariaLabel) {
        //         // eslint-disable-next-line no-console
        //         console.warn(
        //             "Input: provide either `label` or `aria-label` for accessibility."
        //         );
        //     }
        // }

        const rootClass = cx(
            styles.root,
            styles[size],
            fullWidth && styles.fullWidth,
            disabled && styles.disabled,
            readOnly && styles.readOnly,
            derivedStatus !== "none" && styles[derivedStatus],
            deprecatedCheckbox && styles.legacyCheckbox,
            className
        );

        const showClear =
            clearable && !disabled && !readOnly && !!(rest.value ?? rest.defaultValue);

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
                    {(prefix || icon) && (
                        <div className={styles.affix} aria-hidden="true">
                            {icon ?? prefix}
                        </div>
                    )}

                    <input
                        id={controlId}
                        ref={ref}
                        type={inputType}
                        className={styles.control}
                        aria-invalid={derivedStatus === "error" || undefined}
                        aria-describedby={describedBy}
                        disabled={disabled}
                        readOnly={readOnly}
                        {...rest}
                    />

                    {isPassword && togglePassword && (
                        <button
                            type="button"
                            className={cx(styles.action, styles.password)}
                            onClick={() => setRevealed((v) => !v)}
                            aria-label={revealed ? "Hide password" : "Show password"}
                            tabIndex={disabled ? -1 : 0}
                            disabled={disabled}
                        >
                            {revealed ? <EyeOff strokeWidth='1.5' size={22} /> : <Eye strokeWidth='1.5' size={22} />}
                        </button>
                    )}

                    {showClear && (
                        <button
                            type="button"
                            className={cx(styles.action, styles.clear)}
                            onClick={handleClear}
                            aria-label="Clear input"
                            tabIndex={disabled ? -1 : 0}
                            disabled={disabled}
                        ><X strokeWidth='1.5' size={22} />
                        </button>
                    )}

                    {suffix && (
                        <div className={styles.affix} aria-hidden="true">
                            {suffix}
                        </div>
                    )}
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

Input.displayName = "Input";
