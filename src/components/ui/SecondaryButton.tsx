import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

type ButtonSize = "sm" | "md" | "lg";

export type SecondaryButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    size?: ButtonSize;
    fullWidth?: boolean;
    isLoading?: boolean;
    loadingText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    destructive?: boolean;
  };

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-4 text-base",
};

const SecondaryButton = forwardRef<
  HTMLButtonElement,
  SecondaryButtonProps
>(function SecondaryButton(
  {
    children,
    size = "md",
    fullWidth = false,
    isLoading = false,
    loadingText = "Loading...",
    leftIcon,
    rightIcon,
    destructive = false,
    disabled,
    type = "button",
    className = "",
    ...buttonProps
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  const colorClasses = destructive
    ? [
        "border-red-200 bg-white text-red-600",
        "hover:border-red-300 hover:bg-red-50",
        "focus-visible:ring-red-100",
      ].join(" ")
    : [
        "border-ally-border bg-white text-ally-primary",
        "hover:border-ally-primary hover:bg-blue-50",
        "focus-visible:ring-blue-100",
      ].join(" ");

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-xl border font-semibold",
        "transition duration-150",
        "hover:-translate-y-0.5",
        "active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-4",
        "disabled:cursor-not-allowed disabled:opacity-60",
        sizeClasses[size],
        colorClasses,
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
            className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current"
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

export default SecondaryButton;