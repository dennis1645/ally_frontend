import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type ButtonSize = "sm" | "md" | "lg";

export type PrimaryButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
  };

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

const PrimaryButton = forwardRef<
  HTMLButtonElement,
  PrimaryButtonProps
>(function PrimaryButton(
  {
    children,
    size = "md",
    fullWidth = false,
    isLoading = false,
    loadingText = "Loading...",
    leftIcon,
    rightIcon,
    disabled,
    type = "button",
    className = "",
    ...buttonProps
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-xl bg-ally-primary font-semibold text-white",
        "shadow-[3px_3px_0_#d1c0aa]",
        "transition duration-150",
        "hover:-translate-y-0.5 hover:brightness-105",
        "active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100",
        "disabled:cursor-not-allowed disabled:opacity-60",
        sizeClasses[size],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...buttonProps}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />

          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="shrink-0">
              {leftIcon}
            </span>
          )}

          <span>{children}</span>

          {rightIcon && (
            <span className="shrink-0">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </button>
  );
});

export default PrimaryButton;