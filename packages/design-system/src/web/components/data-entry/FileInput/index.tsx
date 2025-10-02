import * as React from "react";
import styles from "./FileInput.module.css";
import { useId } from "../../../../hooks";
import { cx } from "../../../../utils";

export interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    hint?: string;
    error?: string;
    buttonLabel?: string;
    multiple?: boolean;
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
    ({ id: idProp, label, hint, error, buttonLabel = "Choose file", multiple, className, ...rest }, ref) => {
        const id = useId(idProp);
        const hintId = hint ? `${id}-hint` : undefined;
        const errorId = error ? `${id}-error` : undefined;

        const [files, setFiles] = React.useState<FileList | null>(null);

        return (
            <div className={cx(styles.root, className)}>
                {label && <label htmlFor={id} className={styles.label}>{label}</label>}

                <div className={styles.field}>
                    <input
                        {...rest}
                        ref={ref}
                        id={id}
                        type="file"
                        className={styles.input}
                        multiple={multiple}
                        onChange={(e) => setFiles(e.currentTarget.files)}
                        aria-invalid={!!error || undefined}
                        aria-describedby={[error ? errorId : undefined, !error ? hintId : undefined]
                            .filter(Boolean).join(" ") || undefined}
                    />
                    <label htmlFor={id} className={styles.button} role="button">{buttonLabel}</label>
                    <div className={styles.filename} aria-live="polite">
                        {files && files.length > 0
                            ? Array.from(files).map(f => f.name).join(", ")
                            : "No file selected"}
                    </div>
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

FileInput.displayName = "FileInput";
