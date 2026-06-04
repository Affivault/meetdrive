import { cn } from '../../lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = {
    sm: 'h-3.5 w-3.5 border-[1.5px]',
    md: 'h-5 w-5 border-2',
    lg: 'h-6 w-6 border-2',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-[var(--border-default)] border-t-[var(--indigo)]',
        sizes[size],
        className
      )}
    />
  );
}
