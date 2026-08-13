import {
  useEffect,
  useId,
  type ReactNode,
} from "react";

import {
  X,
} from "lucide-react";

export type AllyPopupProps = {
  isOpen: boolean;
  badge: string;
  badgeIcon?: ReactNode;
  mascotSrc: string;
  mascotAlt?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  mascotAnimated?: boolean;
};

/**
 * Ally's reusable popup shell.
 *
 * Important layout behavior:
 * - starts below the 80px sticky topbar (`top-20`);
 * - stays centered in the visible page area;
 * - does not portal over the topbar;
 * - keeps one consistent Ally visual language for popup experiences.
 */
export default function AllyPopup({
  isOpen,
  badge,
  badgeIcon,
  mascotSrc,
  mascotAlt = "Ally",
  title,
  description,
  children,
  onClose,
  closeLabel = "Close popup",
  mascotAnimated = false,
}: AllyPopupProps) {
  const titleId =
    useId();

  const descriptionId =
    useId();

  useEffect(
    () => {
      if (!isOpen) {
        return;
      }

      const previousOverflow =
        document.body.style.overflow;

      document.body.style.overflow =
        "hidden";

      function handleKeyDown(
        event: KeyboardEvent,
      ): void {
        if (
          event.key ===
            "Escape" &&
          onClose
        ) {
          onClose();
        }
      }

      window.addEventListener(
        "keydown",
        handleKeyDown,
      );

      return () => {
        document.body.style.overflow =
          previousOverflow;

        window.removeEventListener(
          "keydown",
          handleKeyDown,
        );
      };
    },
    [
      isOpen,
      onClose,
    ],
  );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="presentation"
      className={[
        "fixed inset-x-0 bottom-0 top-20 z-40",
        "flex items-center justify-center",
        "bg-slate-900/20 px-4 py-5",
        "backdrop-blur-[2px]",
        "sm:px-6",
      ].join(
        " ",
      )}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          titleId
        }
        aria-describedby={
          description
            ? descriptionId
            : undefined
        }
        className={[
          "relative w-full max-w-[440px]",
          "max-h-[calc(100vh-7rem)] overflow-y-auto",
          "rounded-[28px]",
          "border border-[#d7e4ec]",
          "bg-[#fffdfb]",
          "p-6 text-center",
          "shadow-[0_20px_60px_rgba(27,55,78,0.22)]",
          "sm:p-7",
        ].join(
          " ",
        )}
      >
        {onClose && (
          <button
            type="button"
            onClick={
              onClose
            }
            aria-label={
              closeLabel
            }
            className={[
              "absolute right-4 top-4 z-10",
              "grid h-9 w-9 place-items-center",
              "rounded-full",
              "border border-slate-200",
              "bg-white",
              "text-slate-500",
              "shadow-sm transition",
              "hover:bg-slate-50 hover:text-slate-800",
              "focus:outline-none focus:ring-2",
              "focus:ring-[#8fc3e2] focus:ring-offset-2",
            ].join(
              " ",
            )}
          >
            <X
              size={18}
              aria-hidden="true"
            />
          </button>
        )}

        <div className="relative mx-auto w-fit">
          <div
            aria-hidden="true"
            className="absolute inset-x-2 bottom-0 h-4 rounded-full bg-[#7f6a55]/10 blur-md"
          />

          <img
            src={
              mascotSrc
            }
            alt={
              mascotAlt
            }
            className={[
              "relative z-10 h-20 w-20 object-contain sm:h-24 sm:w-24",
              mascotAnimated
                ? "ally-mascot-float"
                : "",
            ].join(
              " ",
            )}
          />
        </div>

        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#bad6e7] bg-[#eaf5fb] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#16629b]">
          {badgeIcon}

          {badge}
        </div>

        <h2
          id={
            titleId
          }
          className="mt-3 text-xl font-extrabold tracking-tight text-[#2c1607] sm:text-2xl"
        >
          {title}
        </h2>

        {description && (
          <p
            id={
              descriptionId
            }
            className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500"
          >
            {description}
          </p>
        )}

        {children}
      </section>
    </div>
  );
}