import * as React from "react";
import styles from "./Combobox.module.css";
import { cx } from "../../../../utils";
import { useId } from "../../../../hooks/useId";
import { ChevronDown } from "lucide-react";

export interface ComboboxOption {
    id: string;
    label: string;
    value?: string;
}

export interface ComboboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "onSelect"> {
    label?: string;
    hint?: string;
    error?: string;
    options: ComboboxOption[];
    onChange?: (value: string) => void;
    onSelect?: (option: ComboboxOption) => void;
    noResultsText?: string;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
    (
        {
            id: idProp,
            label,
            hint,
            error,
            options,
            onChange,
            onSelect,
            noResultsText = "No results",
            className,
            ...rest
        },
        ref
    ) => {
        const id = useId(idProp);
        const listId = `${id}-listbox`;
        const [open, setOpen] = React.useState(false);
        const [activeIndex, setActiveIndex] = React.useState<number>(-1);
        const [inputValue, setInputValue] = React.useState<string>((rest.defaultValue as string) ?? "");
        const filtered = React.useMemo(
            () => options.filter(o => o.label.toLowerCase().includes(inputValue.toLowerCase())),
            [options, inputValue]
        );

        const selectOption = (idx: number) => {
            const opt = filtered[idx];
            if (!opt) return;
            setInputValue(opt.label);
            onChange?.(opt.label);
            onSelect?.(opt);
            setOpen(false);
            setActiveIndex(-1);
        };

        const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const v = e.target.value;
            setInputValue(v);
            onChange?.(v);
            setOpen(true);
            setActiveIndex(-1);
        };

        const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
                setOpen(true);
                setActiveIndex(0);
                return;
            }
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setActiveIndex((i) => (i + 1) % Math.max(filtered.length, 1));
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
                    break;
                case "Enter":
                    if (open && activeIndex >= 0) {
                        e.preventDefault();
                        selectOption(activeIndex);
                    }
                    break;
                case "Escape":
                    setOpen(false);
                    setActiveIndex(-1);
                    break;
            }
        };

        const activeId = activeIndex >= 0 && filtered[activeIndex] ? `${id}-opt-${filtered[activeIndex].id}` : undefined;

        return (
            <div className={cx(styles.root, className)}>
                {label && <label className={styles.label} htmlFor={id}>{label}</label>}

                <div className={styles.field}>
                    <input
                        {...rest}
                        ref={ref}
                        id={id}
                        className={styles.control}
                        role="combobox"
                        aria-autocomplete="list"
                        aria-expanded={open}
                        aria-controls={listId}
                        aria-activedescendant={activeId}
                        value={inputValue}
                        onChange={onInputChange}
                        onKeyDown={onKeyDown}
                        onBlur={() => setTimeout(() => setOpen(false), 100)} /* close after click */
                        onFocus={() => filtered.length && setOpen(true)}
                    />

                    <button
                        type="button"
                        className={styles.toggle}
                        aria-label={open ? "Close" : "Open"}
                        onClick={() => setOpen((v) => !v)}
                    >
                        <ChevronDown strokeWidth="1.5" size={22} />
                    </button>
                </div>

                {open && (
                    <ul id={listId} role="listbox" className={styles.list} data-open>
                        {filtered.length === 0 ? (
                            <li className={styles.noResults} aria-live="polite">{noResultsText}</li>
                        ) : (
                            filtered.map((o, idx) => (
                                <li
                                    id={`${id}-opt-${o.id}`}
                                    role="option"
                                    aria-selected={idx === activeIndex}
                                    key={o.id}
                                    className={cx(styles.option, idx === activeIndex && styles.active)}
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => selectOption(idx)}
                                >
                                    {o.label}
                                </li>
                            ))
                        )}
                    </ul>
                )}

                {error ? <div className={cx(styles.message, styles.error)} role="alert">{error}</div> :
                    hint ? <div className={cx(styles.message, styles.hint)}>{hint}</div> : null}
            </div>
        );
    }
);

Combobox.displayName = "Combobox";
