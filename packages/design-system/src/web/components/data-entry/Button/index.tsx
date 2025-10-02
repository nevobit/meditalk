import React, { useEffect } from 'react';
import styles from './Button.module.css';
import { cx } from '../../../../utils';
import { VisuallyHidden } from '../../utilities';

const VARIANTS = [
    "plain",
    "primary",
    "secondary",
    "tertiary",
    "monochromePlain",
    "monochrome"
] as const;
type Variant = typeof VARIANTS[number];

const TONES = ["critical", "success"] as const;
type Tone = typeof TONES[number];

type Direction = "left" | "right";
type Disclosure = "down" | "up" | "select" | boolean;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    size?: 'micro' | 'slim' | 'medium' | 'large';
    textAlign?: 'left' | 'right' | 'center' | 'start' | 'end';
    fullWidth?: boolean;
    disclosure?: Disclosure;
    image?: { src: string; alt?: string };
    icon?: React.ReactElement;
    iconPosition?: Direction;
    imagePosition?: Direction;
    tone?: Tone;
    variant?: Variant;
    loading?: boolean;
}

const isVariant = (v?: string): v is Variant => !!v && (VARIANTS as readonly string[]).includes(v);
const isTone = (t?: string): t is Tone => !!t && (TONES as readonly string[]).includes(t);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
    disabled,
    loading,
    variant = 'primary',
    tone,
    icon,
    iconPosition = 'left',
    image,
    imagePosition = 'left',
    children,
    fullWidth,
    size = 'medium',
    textAlign,
    disclosure,
    className: externalClassName,
    type,
    onClick,
    ...rest
}, ref) => {
    const isDisabled = disabled || loading;

    useEffect(() => {
        if (!children && icon && !("aria-label" in rest)) {
            // eslint-disable-next-line no-console
            console.warn("Button with only icon requires aria-label for a11y");
        }
    }, [children, icon, rest]);

    const disclosureKind: "down" | "up" | "select" | undefined =
        disclosure === true ? "down" : disclosure === false ? undefined : disclosure || undefined;

    const className = cx(
        styles.button,
        isDisabled && styles.disabled,
        loading && styles.loading,
        fullWidth && styles.fullWidth,
        size && styles[size],
        textAlign && styles[textAlign],
        isVariant(variant) && styles[variant],
        isTone(tone) && styles[tone],
        externalClassName
    );

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (loading || disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick?.(e);
    };

    const commonProps = {
        ...rest,
        ref,
        className,
        disabled: isDisabled
    };


    return (
        <button
            {...commonProps}
            aria-busy={loading || undefined}
            onClick={handleClick}
            type={type ?? "button"}
            data-variant={variant}
            data-tone={tone}
            data-loading={loading ? "" : undefined}
        >
            {image && imagePosition === "left" && (
                <img src={image.src} alt={image.alt ?? ""} className={styles.image} decoding='async' loading='lazy' />
            )}
            {icon && iconPosition === "left" && (
                <span className={styles.icon} aria-hidden="true">
                    {icon}
                </span>
            )}
            {children && <span className={styles.label}>{children}</span>}

            {loading && (
                <>
                    <span className={styles.spinner} aria-hidden="true" />
                    <VisuallyHidden>Cargando…</VisuallyHidden>
                </>
            )}
            {icon && iconPosition === "right" && (
                <span className={styles.icon} aria-hidden="true">
                    {icon}
                </span>
            )}
            {image && imagePosition === "right" && (
                <img src={image.src} alt={image.alt ?? ""} className={styles.image} decoding="async"
                    loading="lazy" />
            )}

            {disclosureKind && (
                <span
                    className={cx(styles.disclosure, styles[`disclosure--${disclosureKind}`])}
                    aria-hidden="true"
                />
            )}
        </button>
    );
});

Button.displayName = 'Button';