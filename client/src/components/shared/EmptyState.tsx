import { type LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Optional secondary (ghost) action shown next to the primary one */
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
        <Icon className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.75} />
      </div>
      <h3 className="mb-1.5 text-[14px] font-semibold text-[var(--text-primary)] tracking-[-0.01em]">{title}</h3>
      <p className="mb-5 max-w-sm text-[12.5px] text-[var(--text-secondary)] leading-relaxed">{description}</p>
      {(actionLabel && onAction) || (secondaryActionLabel && onSecondaryAction) ? (
        <div className="flex items-center gap-2">
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} size="sm" variant="secondary">{secondaryActionLabel}</Button>
          )}
          {actionLabel && onAction && (
            <Button onClick={onAction} size="sm">{actionLabel}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
