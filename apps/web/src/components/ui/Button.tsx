import React from 'react';
import { cn } from '../../utils/helpers';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'glow' | 'minimal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    outline: 'btn-outline',
    glow: 'btn-primary shadow-lg glow-indigo',
    minimal: 'text-white hover:text-indigo-400 transition-colors',
  };

  const sizes: Record<string, string> = {
    xs: 'px-3 py-1.5 text-xs font-medium rounded-md',
    sm: 'px-4 py-2 text-sm font-medium rounded-lg',
    md: 'px-6 py-3 text-base font-semibold rounded-lg',
    lg: 'px-8 py-4 text-lg font-semibold rounded-xl',
    xl: 'px-10 py-5 text-xl font-bold rounded-2xl',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-150 font-medium',
        'focus-visible:outline-none disabled:opacity-60 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        isLoading && 'opacity-70 cursor-wait',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
      {children && <span>{children}</span>}
      {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}


