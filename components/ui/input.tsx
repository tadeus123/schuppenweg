'use client'

import { cn } from '@/lib/utils'
import { forwardRef, InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          ref={ref}
          className={cn(
            'w-full px-0 py-4 sm:py-4 bg-transparent border-b border-border text-foreground text-base sm:text-base transition-all duration-200',
            'placeholder:text-foreground-subtle',
            'focus:border-foreground focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'min-h-[48px] sm:min-h-[44px]', // Better touch target on mobile
            className,
            error && '!border-red-500 !focus:border-red-500'
          )}
          {...props}
        />
        {error && (
          <p className={cn('mt-1 text-xs', className?.includes('text-gray') ? 'text-red-600' : 'text-error')}>{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
