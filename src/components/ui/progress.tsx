import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, ...props }, ref) => {
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full",
          className
        )}
        style={{
          backgroundColor: "hsl(var(--color-secondary))"
        }}
        {...props}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${clampedValue}%`,
            backgroundColor: "hsl(var(--color-primary))"
          }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }
