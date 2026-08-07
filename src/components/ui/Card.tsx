import type {
  HTMLAttributes,
  ReactNode,
} from "react";

type CardVariant =
  | "default"
  | "cream"
  | "passport"
  | "dashed";

export type CardProps =
  HTMLAttributes<HTMLElement> & {
    children: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    footer?: ReactNode;
    variant?: CardVariant;
    padding?: "none" | "sm" | "md" | "lg";
  };

const variantClasses: Record<CardVariant, string> = {
  default:
    "border border-slate-200 bg-white shadow-sm",

  cream:
    "border border-orange-100 bg-ally-surface shadow-sm",

  passport:
    "border-[7px] border-[#543b32] bg-white shadow-xl",

  dashed:
    "border border-dashed border-ally-border bg-white/70",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  title,
  description,
  action,
  footer,
  variant = "default",
  padding = "md",
  className = "",
  ...articleProps
}: CardProps) {
  const hasHeader =
    title !== undefined ||
    description !== undefined ||
    action !== undefined;

  return (
    <article
      className={[
        "overflow-hidden rounded-3xl",
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...articleProps}
    >
      <div className={paddingClasses[padding]}>
        {hasHeader && (
          <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              {title && (
                <h2 className="text-xl font-bold text-slate-900">
                  {title}
                </h2>
              )}

              {description && (
                <div className="mt-1 text-sm leading-relaxed text-slate-500">
                  {description}
                </div>
              )}
            </div>

            {action && (
              <div className="shrink-0">
                {action}
              </div>
            )}
          </header>
        )}

        {children}
      </div>

      {footer && (
        <footer className="border-t border-slate-200 bg-slate-50/70 px-6 py-4">
          {footer}
        </footer>
      )}
    </article>
  );
}