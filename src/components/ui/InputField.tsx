import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

export type InputFieldProps =
  InputHTMLAttributes<HTMLInputElement> & {
    id: string;
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightElement?: ReactNode;
    fullWidth?: boolean;
  };

const InputField = forwardRef<
  HTMLInputElement,
  InputFieldProps
>(function InputField(
  {
    id,
    label,
    error,
    helperText,
    leftIcon,
    rightElement,
    fullWidth = true,
    required,
    disabled,
    className = "",
    ...inputProps
  },
  ref,
) {
  const describedBy = error
    ? `${id}-error`
    : helperText
      ? `${id}-helper`
      : undefined;

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          {label}

          {required && (
            <span
              aria-hidden="true"
              className="ml-1 text-red-500"
            >
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            "w-full rounded-xl border-2 bg-white px-4 py-3",
            "text-sm text-slate-800 outline-none",
            "placeholder:text-slate-400",
            "transition",
            "focus:border-ally-primary focus:ring-4 focus:ring-blue-100",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            leftIcon ? "pl-11" : "",
            rightElement ? "pr-12" : "",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-ally-border",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...inputProps}
        />

        {rightElement && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm text-red-600"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${id}-helper`}
          className="mt-1.5 text-sm text-slate-500"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default InputField;