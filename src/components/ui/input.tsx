import * as React from "react";

import { cn } from "@/lib/utils";
import { IconType } from "react-icons";
import { Eye, EyeOff, Lock, LucideIcon, LucideProps } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: LucideIcon | IconType;
  endIcon?: LucideIcon | IconType;
  iconProps?: LucideProps;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, iconProps = {}, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    const StartIcon = startIcon;
    const EndIcon = endIcon;
    const { className: iconClassName, ...iconRest } = iconProps;

    if (type === "password") {
      return (
        <div className="relative w-full">
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 transform">
            <Lock
              size={18}
              className={cn("text-muted-foreground", iconClassName)}
              {...iconRest}
            />
          </div>
          <input
            autoComplete="off"
            type={!show ? type : "text"}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
              className,
            )}
            ref={ref}
            {...props}
          />
          <button
            onClick={() => setShow((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 transform"
            type="button"
          >
            {show ? (
              <Eye className="stroke-slate-700/70" size={18} />
            ) : (
              <EyeOff className="stroke-slate-700/70" size={18} />
            )}
          </button>
        </div>
      );
    }

    return (
      <div className="relative w-full">
        {StartIcon && (
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 transform">
            <StartIcon
              size={18}
              className={cn("text-muted-foreground", iconClassName)}
              {...iconRest}
            />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
            startIcon ? "pl-8" : "",
            endIcon ? "pr-8" : "",
            className,
          )}
          ref={ref}
          {...props}
        />
        {EndIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 transform">
            <EndIcon
              className={cn("text-muted-foreground", iconClassName)}
              {...iconRest}
              size={18}
            />
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
