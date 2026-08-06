import {
  forwardRef,
  type InputHTMLAttributes,
} from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField(
    {
      id,
      label,
      error,
      className,
      ...inputProps
    },
    ref,
  ) {
    return (
      <label htmlFor={id} className="block">
        <span className="mb-2 block text-sm font-medium text-ally-text">
          {label}
        </span>

        <input
          ref={ref}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            "w-full rounded-xl border-2 bg-white px-4 py-3",
            "text-base text-ally-text outline-none transition",
            "placeholder:text-slate-400",
            "focus:border-ally-blue focus:ring-4 focus:ring-blue-100",
            error ? "border-ally-error" : "border-ally-brown",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          {...inputProps}
        />

        {error && (
          <span
            id={`${id}-error`}
            role="alert"
            className="mt-1.5 block text-sm text-ally-error"
          >
            {error}
          </span>
        )}
      </label>
    );
  },
);

export default FormField;