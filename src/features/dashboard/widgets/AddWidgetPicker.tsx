import { useEffect, useRef } from 'react';
import { Card } from '../../../components/ui/Card';
import { cn } from '../../../lib/utils';
import { widgetCatalog } from './widgetCatalog';

export interface AddWidgetPickerProps {
  /** Whether the picker popover is currently revealed. Renders nothing when false. */
  open: boolean;
  /** Invoked to close the popover — on outside activation or after a selection. */
  onClose: () => void;
  /** Widget ids already present on the board, excluded from the pickable list (Req 11.6). */
  existingWidgetIds: string[];
  /** Invoked with the selected catalog entry's id when the user picks a row. */
  onAddWidget: (widgetId: string) => void;
  className?: string;
}

/**
 * AddWidgetPicker — the small popover opened from the Widget_Board's
 * add-widget control (Req 11.6).
 *
 * Lists every `widgetCatalog` entry not already present on the board
 * ("not currently on the board" per Req 11.6) as a clickable icon+label
 * row. Selecting a row calls `onAddWidget(entry.id)` then `onClose()`.
 * Dismisses itself when the user activates anything outside its own DOM
 * node, following the same click-outside pattern as
 * `MemberGraph/DetailPanel.tsx` and `AppShell/ProfilePanel.tsx`.
 */
export function AddWidgetPicker({
  open,
  onClose,
  existingWidgetIds,
  onAddWidget,
  className,
}: AddWidgetPickerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Click-outside dismissal, matching DetailPanel.tsx / ProfilePanel.tsx.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open, onClose]);

  if (!open) return null;

  const availableEntries = widgetCatalog.filter(
    (entry) => !existingWidgetIds.includes(entry.id),
  );

  const handleSelect = (widgetId: string) => {
    onAddWidget(widgetId);
    onClose();
  };

  return (
    <div ref={panelRef} className="absolute right-0 top-full z-50 mt-2">
      <Card size="sm" className={cn('w-56 items-stretch gap-1 text-left', className)}>
        {availableEntries.length === 0 ? (
          <p className="px-2 py-1 text-xs text-slate-500">All widgets are already on your board.</p>
        ) : (
          availableEntries.map((entry) => {
            const Icon = entry.icon;
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => handleSelect(entry.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100"
              >
                <Icon className="h-4 w-4 shrink-0 text-slate-500" aria-hidden="true" />
                <span className="truncate">{entry.label}</span>
              </button>
            );
          })
        )}
      </Card>
    </div>
  );
}
