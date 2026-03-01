import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { error?: boolean }>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-lg border bg-card px-3 py-2 text-body ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground transition-all duration-150 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-status-error focus-visible:border-status-error focus-visible:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]"
            : "border-input focus-visible:border-input-focus focus-visible:shadow-cake-focus",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
