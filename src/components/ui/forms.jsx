import { cn } from "@/lib/utils";

export const inputClassName = "min-h-[44px] w-full rounded-2xl border border-[#E2D4BC] bg-[#FFFCF6] px-4 py-3 text-sm text-[#3C2A1E] outline-none transition focus:border-[#C1622B] focus:ring-2 focus:ring-[#C1622B]/20";
export const labelClassName = "mb-2 block text-sm font-semibold text-[#6B5544]";

export function Field({ label, htmlFor, children, className }) {
  return (
    <div className={cn("mb-5", className)}>
      {label ? (
        <label htmlFor={htmlFor} className={labelClassName}>
          {label}
        </label>
      ) : null}
      {children}
    </div>
  );
}

export function Input({ className, ...props }) {
  return <input className={cn(inputClassName, className)} {...props} />;
}

export function Textarea({ className, ...props }) {
  return <textarea className={cn(inputClassName, className)} {...props} />;
}

export function Select({ className, ...props }) {
  return <select className={cn(inputClassName, className)} {...props} />;
}

export function Checkbox({ className, ...props }) {
  return <input type="checkbox" className={cn("h-4 w-4 rounded border-[#E2D4BC] text-[#C1622B] focus:ring-[#C1622B]/50", className)} {...props} />;
}
