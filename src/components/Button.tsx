import { forwardRef, ButtonHTMLAttributes } from "react";
import { Loader2 } from "lucide-react";

type Variant = "brand" | "outline" | "ghost" | "danger" | "white";
type Size    = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const SIZE_CLASSES: Record<Size, string> = {
  sm:  "text-xs px-3 py-1.5 gap-1.5",
  md:  "text-sm px-4 py-2.5 gap-2",
  lg:  "text-sm px-5 py-3 gap-2",
  xl:  "text-base px-7 py-4 gap-2.5",
};

const VARIANT_CLASSES: Record<Variant, string> = {
  brand:   "bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-brand-sm hover:shadow-brand focus-visible:ring-brand-400",
  outline: "border border-[var(--border)] bg-white text-[var(--text-muted)] hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-300",
  ghost:   "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-black/5 focus-visible:ring-slate-300",
  danger:  "bg-red-500 hover:bg-red-600 active:bg-red-700 text-white focus-visible:ring-red-400",
  white:   "bg-white hover:bg-slate-50 text-[var(--text)] border border-[var(--border)] shadow-sm focus-visible:ring-slate-300",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "brand",
      size = "md",
      loading = false,
      icon,
      iconRight,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...rest
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          // base
          "inline-flex items-center justify-center font-semibold rounded-xl",
          "transition-all duration-150 select-none cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
          // size
          SIZE_CLASSES[size],
          // variant
          VARIANT_CLASSES[variant],
          // full width
          fullWidth ? "w-full" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
        ) : icon ? (
          <span className="flex-shrink-0">{icon}</span>
        ) : null}
        {children && <span>{children}</span>}
        {iconRight && !loading && (
          <span className="flex-shrink-0">{iconRight}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
