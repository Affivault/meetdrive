import { type LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
        <Icon className="h-5 w-5 text-[var(--text-tertiary)]" strokeWidth={1.5} />
      </div>
      <h3 className="mb-1 text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">{title}</h3>
      <p className="mb-4 max-w-xs text-[12.5px] text-[var(--text-secondary)] leading-snug">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">{actionLabel}</Button>
      )}
    </div>
  );
}
