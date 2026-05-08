import { useState, useCallback } from 'react';
import {
  Mail,
  Clock,
  Trash2,
  GripVertical,
  Plus,
  ChevronDown,
  ChevronUp,
  Eye,
  MousePointerClick,
  MessageSquare,
  ArrowDown,
  Sparkles,
  Settings,
  SkipForward,
  GitBranch,
  Webhook,
  ShieldCheck,
  Brain,
} from 'lucide-react';
import { StepType, ConditionField, ConditionOperator } from '@lemlist/shared';
import type { CreateStepInput } from '@lemlist/shared';
import { cn } from '../../lib/utils';

export type FlowStepType = 'email' | 'delay' | 'condition' | 'webhook_wait';

export interface FlowStep extends CreateStepInput {
  id?: string;
}

interface FlowBuilderProps {
  steps: FlowStep[];
  onStepsChange: (steps: FlowStep[]) => void;
  onEditStep: (index: number) => void;
  editingStep: number | null;
}

const stepTypeConfig: Record<string, {
  icon: any;
  label: string;
}> = {
  email: {
    icon: Mail,
    label: 'Email',
  },
  delay: {
    icon: Clock,
    label: 'Delay',
  },
  condition: {
    icon: GitBranch,
    label: 'Condition',
  },
  webhook_wait: {
    icon: Webhook,
    label: 'Webhook Wait',
  },
};

const conditionFieldOptions = [
  { value: ConditionField.Opened, label: 'Email Opened', icon: Eye },
  { value: ConditionField.Clicked, label: 'Link Clicked', icon: MousePointerClick },
  { value: ConditionField.Replied, label: 'Reply Received', icon: MessageSquare },
  { value: ConditionField.SaraIntent, label: 'SARA Intent', icon: Brain },
  { value: ConditionField.DcsScore, label: 'DCS Score', icon: ShieldCheck },
  { value: ConditionField.WebhookReceived, label: 'Webhook Received', icon: Webhook },
];

const conditionOperatorOptions = [
  { value: ConditionOperator.IsTrue, label: 'Is True' },
  { value: ConditionOperator.IsFalse, label: 'Is False' },
  { value: ConditionOperator.Equals, label: 'Equals' },
  { value: ConditionOperator.NotEquals, label: 'Not Equals' },
  { value: ConditionOperator.GreaterThan, label: 'Greater Than' },
  { value: ConditionOperator.LessThan, label: 'Less Than' },
  { value: ConditionOperator.Contains, label: 'Contains' },
];

interface AddStepMenuProps {
  onAdd: (type: StepType) => void;
  showAbove?: boolean;
}

function AddStepMenu({ onAdd, showAbove }: AddStepMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex justify-center">
      {/* Connector line */}
      <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-[var(--border-default)] to-[var(--border-subtle)]" />

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-surface)] border-2 border-dashed border-[#6366F1]/30 hover:border-[#6366F1] hover:bg-[rgba(99,102,241,0.08)] transition-all duration-200 my-2"
      >
        <Plus className="h-4 w-4 text-[#6366F1]/40 group-hover:text-[#6366F1]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className={cn(
            "absolute z-30 w-56 bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] shadow-2xl py-2 animate-fade-in",
            showAbove ? "bottom-full mb-2" : "top-full mt-2"
          )}>
            <p className="px-3 pb-2 pt-1 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
              Add Step
            </p>
            <button
              type="button"
              onClick={() => { onAdd(StepType.Email); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white">
                <Mail className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">Email Step</p>
                <p className="text-xs text-[var(--text-tertiary)]">Send a personalized email</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { onAdd(StepType.Delay); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
                <Clock className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">Wait / Delay</p>
                <p className="text-xs text-[var(--text-tertiary)]">Wait before the next step</p>
              </div>
            </button>
            <div className="border-t border-[var(--border-subtle)] my-1" />
            <button
              type="button"
              onClick={() => { onAdd(StepType.Condition); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <GitBranch className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">Condition</p>
                <p className="text-xs text-[var(--text-tertiary)]">If/else branch logic</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => { onAdd(StepType.WebhookWait); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                <Webhook className="h-4 w-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-[var(--text-primary)]">Webhook Wait</p>
                <p className="text-xs text-[var(--text-tertiary)]">Wait for external event</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

const getStepColors = (stepType: string) => {
  switch (stepType) {
    case 'email':
      return {
        iconBg: 'bg-gradient-to-br from-[#6366F1] to-[#8B5CF6]',
        borderColor: 'border-l-[3px] border-l-[#6366F1]',
        badgeBg: 'bg-[#6366F1] text-white border-none',
      };
    case 'delay':
      return {
        iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
        borderColor: 'border-l-[3px] border-l-amber-400',
        badgeBg: 'bg-amber-400 text-white border-none',
      };
    case 'condition':
      return {
        iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
        borderColor: 'border-l-[3px] border-l-violet-500',
        badgeBg: 'bg-violet-500 text-white border-none',
      };
    case 'webhook_wait':
      return {
        iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
        borderColor: 'border-l-[3px] border-l-cyan-500',
        badgeBg: 'bg-cyan-500 text-white border-none',
      };
    default:
      return {
        iconBg: 'bg-gradient-to-br from-slate-400 to-slate-500',
        borderColor: 'border-l-[3px] border-l-slate-400',
        badgeBg: 'bg-slate-500 text-white border-none',
      };
  }
};

function FlowNode({
  step,
  index,
  totalSteps,
  isEditing,
  onEdit,
  onRemove,
  onMoveUp,
  onMoveDown,
  onUpdate,
}: {
  step: FlowStep;
  index: number;
  totalSteps: number;
  isEditing: boolean;
  onEdit: () => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: (updates: Partial<FlowStep>) => void;
}) {
  const config = stepTypeConfig[step.step_type] || stepTypeConfig.email;
  const Icon = config.icon;
  const stepColors = getStepColors(step.step_type);

  const getStepSummary = () => {
    if (step.step_type === 'email') {
      return step.subject || 'Untitled Email';
    }
    if (step.step_type === 'delay') {
      const parts = [];
      if (step.delay_days) parts.push(`${step.delay_days} day${step.delay_days !== 1 ? 's' : ''}`);
      if (step.delay_hours) parts.push(`${step.delay_hours} hour${step.delay_hours !== 1 ? 's' : ''}`);
      if (step.delay_minutes) parts.push(`${step.delay_minutes} min`);
      return parts.length > 0 ? `Wait ${parts.join(', ')}` : 'No delay set';
    }
    if (step.step_type === 'condition') {
      const field = conditionFieldOptions.find((f) => f.value === step.condition_field);
      const op = conditionOperatorOptions.find((o) => o.value === step.condition_operator);
      if (field && op) {
        const valueStr = step.condition_value ? ` "${step.condition_value}"` : '';
        return `If ${field.label} ${op.label}${valueStr}`;
      }
      return 'Configure condition...';
    }
    if (step.step_type === 'webhook_wait') {
      return step.webhook_event
        ? `Wait for: ${step.webhook_event} (${step.webhook_timeout_hours || 72}h timeout)`
        : 'Configure webhook event...';
    }
    return '';
  };

  return (
    <div className="relative">
      {/* Node Card */}
      <div
        className={cn(
          'group relative mx-auto max-w-xl rounded-2xl border-2 bg-[var(--bg-surface)] shadow-card transition-all duration-300 overflow-hidden',
          stepColors.borderColor,
          isEditing
            ? 'border-[var(--text-primary)] shadow-lg ring-4 ring-[var(--text-primary)]/20'
            : 'border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:shadow-card-hover'
        )}
      >
        {/* Step Number Badge */}
        <div className={cn(
          'absolute -top-3 left-6 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold',
          stepColors.badgeBg
        )}>
          <span>Step {index + 1}</span>
          <span className="opacity-70">/ {totalSteps}</span>
        </div>

        <div className="p-5 pt-6">
          <div className="flex items-start gap-4">
            {/* Drag Handle & Icon */}
            <div className="flex flex-col items-center gap-1">
              <button type="button" className="text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-grab active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </button>
              <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl text-white', stepColors.iconBg)}>
                <Icon className="h-6 w-6" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-[var(--text-primary)]">{config.label}</h3>
                {step.step_type === 'email' && step.skip_if_replied !== false && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                    <SkipForward className="h-3 w-3" />
                    Skip if replied
                  </span>
                )}
                {step.step_type === 'condition' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
                    <GitBranch className="h-3 w-3" />
                    If/Else
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] truncate">{getStepSummary()}</p>

              {/* Email preview */}
              {step.step_type === 'email' && step.body_html && (
                <div className="mt-3 p-3 bg-[var(--bg-elevated)] rounded-lg text-xs text-[var(--text-secondary)] line-clamp-2 border border-[var(--border-subtle)]">
                  {step.body_html.replace(/<[^>]*>/g, '').slice(0, 120)}...
                </div>
              )}

              {/* Condition inline config */}
              {step.step_type === 'condition' && isEditing && (
                <div className="mt-3 p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Condition Field</label>
                    <select
                      value={step.condition_field || ''}
                      onChange={(e) => onUpdate({ condition_field: e.target.value })}
                      className="w-full h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm focus:border-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20"
                    >
                      <option value="">Select field...</option>
                      {conditionFieldOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Operator</label>
                      <select
                        value={step.condition_operator || ''}
                        onChange={(e) => onUpdate({ condition_operator: e.target.value })}
                        className="w-full h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm focus:border-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20"
                      >
                        <option value="">Select...</option>
                        {conditionOperatorOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Value</label>
                      <input
                        type="text"
                        value={step.condition_value || ''}
                        onChange={(e) => onUpdate({ condition_value: e.target.value })}
                        placeholder="e.g., interested"
                        className="w-full h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm focus:border-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-700">✓ True Branch</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Continues to next step</p>
                    </div>
                    <div className="p-2.5 bg-[var(--bg-surface)] rounded-lg border border-[var(--border-default)] space-y-1.5">
                      <p className="text-xs font-semibold text-[var(--text-primary)]">✗ False Branch</p>
                      <select
                        value={step.false_branch_step ?? ''}
                        onChange={(e) => onUpdate({ false_branch_step: e.target.value === '' ? undefined : Number(e.target.value) })}
                        className="w-full h-7 rounded border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-2 text-xs focus:border-[#6366F1] outline-none"
                      >
                        <option value="">Skip to end</option>
                        {Array.from({ length: totalSteps }, (_, i) => i).filter((i) => i !== index).map((i) => (
                          <option key={i} value={i}>Jump to Step {i + 1}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Webhook wait inline config */}
              {step.step_type === 'webhook_wait' && isEditing && (
                <div className="mt-3 p-4 bg-[var(--bg-elevated)] rounded-xl border border-[var(--border-subtle)] space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Webhook Event</label>
                    <input
                      type="text"
                      value={step.webhook_event || ''}
                      onChange={(e) => onUpdate({ webhook_event: e.target.value })}
                      placeholder="e.g., payment.completed"
                      className="w-full h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm focus:border-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Timeout (hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={step.webhook_timeout_hours || 72}
                      onChange={(e) => onUpdate({ webhook_timeout_hours: parseInt(e.target.value) || 72 })}
                      className="w-full h-9 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3 text-sm focus:border-[var(--text-primary)] focus:ring-2 focus:ring-[var(--text-primary)]/20"
                    />
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">Contact proceeds to next step after timeout if webhook not received.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={index === 0}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={index === totalSteps - 1}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              {(step.step_type === 'email' || step.step_type === 'condition' || step.step_type === 'webhook_wait') && (
                <button
                  type="button"
                  onClick={onEdit}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isEditing
                      ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  )}
                >
                  {isEditing ? 'Close' : 'Edit'}
                </button>
              )}
              <button
                type="button"
                onClick={onRemove}
                className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--error)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlowBuilder({ steps, onStepsChange, onEditStep, editingStep }: FlowBuilderProps) {
  const addStep = useCallback((type: StepType, atIndex?: number) => {
    const newStep: FlowStep = {
      step_type: type,
      step_order: steps.length,
      subject: type === StepType.Email ? '' : undefined,
      body_html: type === StepType.Email ? '' : undefined,
      delay_days: type === StepType.Delay ? 1 : 0,
      delay_hours: 0,
      delay_minutes: 0,
      skip_if_replied: type === StepType.Email ? true : undefined,
      condition_field: type === StepType.Condition ? '' : undefined,
      condition_operator: type === StepType.Condition ? '' : undefined,
      condition_value: type === StepType.Condition ? '' : undefined,
      webhook_event: type === StepType.WebhookWait ? '' : undefined,
      webhook_timeout_hours: type === StepType.WebhookWait ? 72 : undefined,
    };

    if (atIndex !== undefined) {
      const newSteps = [...steps];
      newSteps.splice(atIndex, 0, newStep);
      onStepsChange(newSteps);
      if (type === StepType.Email || type === StepType.Condition || type === StepType.WebhookWait) onEditStep(atIndex);
    } else {
      onStepsChange([...steps, newStep]);
      if (type === StepType.Email || type === StepType.Condition || type === StepType.WebhookWait) onEditStep(steps.length);
    }
  }, [steps, onStepsChange, onEditStep]);

  const removeStep = useCallback((index: number) => {
    onStepsChange(steps.filter((_, i) => i !== index));
    if (editingStep === index) onEditStep(-1);
  }, [steps, onStepsChange, editingStep, onEditStep]);

  const moveStep = useCallback((from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const newSteps = [...steps];
    const [moved] = newSteps.splice(from, 1);
    newSteps.splice(to, 0, moved);
    onStepsChange(newSteps);
    if (editingStep === from) onEditStep(to);
  }, [steps, onStepsChange, editingStep, onEditStep]);

  const updateStep = useCallback((index: number, updates: Partial<FlowStep>) => {
    onStepsChange(steps.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  }, [steps, onStepsChange]);

  if (steps.length === 0) {
    return (
      <div className="flex flex-col items-center py-12">
        {/* Start node */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[rgba(99,102,241,0.1)] to-[rgba(139,92,246,0.1)] border border-[rgba(99,102,241,0.15)] mb-4">
          <Sparkles className="h-8 w-8 text-[#6366F1]" />
        </div>
        <p className="text-lg font-semibold text-[var(--text-primary)] mb-1">Campaign Start</p>
        <p className="text-sm text-[var(--text-tertiary)] mb-6">Add your first step to begin building the sequence</p>

        <div className="flex flex-wrap gap-4 justify-center">
          <button
            type="button"
            onClick={() => addStep(StepType.Email)}
            className="flex items-center gap-3 px-6 py-4 bg-[var(--bg-surface)] rounded-2xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white group-hover:shadow-lg transition-shadow">
              <Mail className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[var(--text-primary)]">Add Email</p>
              <p className="text-xs text-[var(--text-tertiary)]">Send a personalized message</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => addStep(StepType.Delay)}
            className="flex items-center gap-3 px-6 py-4 bg-[var(--bg-surface)] rounded-2xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white group-hover:shadow-lg transition-shadow">
              <Clock className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[var(--text-primary)]">Add Delay</p>
              <p className="text-xs text-[var(--text-tertiary)]">Wait before next step</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => addStep(StepType.Condition)}
            className="flex items-center gap-3 px-6 py-4 bg-[var(--bg-surface)] rounded-2xl border-2 border-dashed border-[var(--border-default)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200 group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white group-hover:shadow-lg transition-shadow">
              <GitBranch className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="font-medium text-[var(--text-primary)]">Add Condition</p>
              <p className="text-xs text-[var(--text-tertiary)]">If/else branching</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-6">
      {/* Start Node */}
      <div className="flex justify-center mb-2">
        <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold shadow-[0_2px_8px_rgba(99,102,241,0.35)]">
          <Sparkles className="h-4 w-4" />
          Campaign Start
        </div>
      </div>

      {/* Steps */}
      {steps.map((step, index) => (
        <div key={index}>
          {/* Add step between nodes */}
          <AddStepMenu onAdd={(type) => addStep(type, index)} />

          {/* Flow Node */}
          <FlowNode
            step={step}
            index={index}
            totalSteps={steps.length}
            isEditing={editingStep === index}
            onEdit={() => onEditStep(editingStep === index ? -1 : index)}
            onRemove={() => removeStep(index)}
            onMoveUp={() => moveStep(index, index - 1)}
            onMoveDown={() => moveStep(index, index + 1)}
            onUpdate={(updates) => updateStep(index, updates)}
          />
        </div>
      ))}

      {/* Add step at end */}
      <AddStepMenu onAdd={(type) => addStep(type)} showAbove />

      {/* End Node */}
      <div className="flex justify-center mt-2">
        <div className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)] text-sm font-semibold border border-[var(--border-default)] shadow-sm">
          <Settings className="h-4 w-4" />
          Campaign End
        </div>
      </div>
    </div>
  );
}
