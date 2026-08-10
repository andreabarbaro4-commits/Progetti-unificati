import type { DragEventHandler, MouseEventHandler } from 'react';
import type { TimelineBlock } from '../../../mock/fixtures/types';

/** Format duration for display: "1h", "30min", "1h 30min". */
function formatDuration(minutes: number): string {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

const TYPE_CONFIG: Record<string, { bg: string; text: string; label: string; emoji: string; border: string }> = {
  meeting: { bg: '#463a93', text: 'white', label: 'CALL', emoji: '📞', border: 'transparent' },
  task: { bg: 'white', text: '#333', label: '', emoji: '', border: '#f0f0f0' },
  deadline: { bg: '#FEF2F2', text: '#991B1B', label: 'DEADLINE', emoji: '🎯', border: '#FECACA' },
  break: { bg: '#F0FDF4', text: '#166534', label: 'BREAK', emoji: '☕', border: '#BBF7D0' },
};

export interface TimelineBlockCardProps {
  block: TimelineBlock;
  topPx: number;
  heightPx: number;
  leftPercent: number;
  widthPercent: number;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLButtonElement>;
}

/**
 * TimelineBlockCard — renders timeline blocks matching the demo's visual style.
 *
 * Meeting: purple/indigo card with phone emoji, "CALL · duration" label, white title.
 * Task: white card with border, project dot, project name, duration, title.
 * Deadline: red-tinted card with target emoji.
 * Break: green-tinted card with coffee emoji.
 */
export function TimelineBlockCard({
  block,
  topPx,
  heightPx,
  leftPercent,
  widthPercent,
  onClick,
  draggable = false,
  onDragStart,
}: TimelineBlockCardProps) {
  const config = TYPE_CONFIG[block.type] ?? TYPE_CONFIG.task;
  const durationLabel = formatDuration(block.duration);
  const isCompact = heightPx < 44;
  const isMeeting = block.type === 'meeting';

  const handleClick: MouseEventHandler<HTMLButtonElement> | undefined = onClick
    ? () => onClick()
    : undefined;

  return (
    <button
      type="button"
      style={{
        position: 'absolute',
        top: `${topPx}px`,
        height: `${heightPx}px`,
        left: `${leftPercent}%`,
        width: `${widthPercent}%`,
        boxSizing: 'border-box',
        background: config.bg,
        borderRadius: isCompact ? '0.625rem' : '0.75rem',
        border: `1px solid ${config.border}`,
        padding: isCompact ? '0.375rem 0.625rem' : '0.625rem 0.875rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflow: 'hidden',
        cursor: draggable ? 'grab' : 'pointer',
        textAlign: 'left',
        boxShadow: isMeeting ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
        opacity: block.completed ? 0.5 : 1,
        fontFamily: 'inherit',
      }}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={onDragStart}
      title={`${block.title} — ${block.time} (${durationLabel})`}
    >
      {/* Emoji or project accent strip */}
      {config.emoji ? (
        <span style={{ fontSize: isCompact ? '0.875rem' : '1rem', flexShrink: 0 }}>
          {config.emoji}
        </span>
      ) : (
        <div
          style={{
            width: isCompact ? '0.25rem' : '0.3125rem',
            alignSelf: 'stretch',
            borderRadius: '0.1875rem',
            background: '#463a93',
            flexShrink: 0,
          }}
        />
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* Label row */}
        {(config.label || (block.type === 'task' && block.projectId)) && !isCompact && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.125rem',
          }}>
            {block.type === 'task' && block.projectId && (
              <span style={{
                width: '0.375rem',
                height: '0.375rem',
                borderRadius: '50%',
                background: '#463a93',
                flexShrink: 0,
              }} />
            )}
            <span style={{
              fontSize: isCompact ? '0.625rem' : '0.6875rem',
              fontWeight: 700,
              color: isMeeting ? 'rgba(255,255,255,0.85)' : '#111',
              textTransform: 'uppercase',
              letterSpacing: '0.3px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {config.label}{config.label && durationLabel ? ` · ${durationLabel}` : ''}
              {!config.label && block.projectId ? block.projectId.replace('proj-', '').toUpperCase() : ''}
            </span>
            {!config.label && durationLabel && (
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#111', flexShrink: 0 }}>
                · {durationLabel}
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: isCompact ? '0.75rem' : '0.875rem',
          fontWeight: isMeeting ? 600 : 500,
          color: config.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          lineHeight: 1.3,
        }}>
          {block.title}
        </div>
      </div>
    </button>
  );
}

export { TYPE_CONFIG as timelineBlockCardVariants };
