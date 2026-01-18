import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
};

const getVariantClass = (variant: ButtonVariant) => {
    switch (variant) {
        case "secondary":
            return styles.secondary;
        case "ghost":
            return styles.ghost;
        default:
            return styles.primary;
    }
};

export const Button = ({
    variant = "primary",
    fullWidth = false,
    className,
    ...props
}: ButtonProps) => {
    const classes = [
        styles.button,
        getVariantClass(variant),
        fullWidth ? styles.fullWidth : "",
        className ?? "",
    ]
        .filter(Boolean)
        .join(" ");

    return <button className={classes} {...props} />;
};
