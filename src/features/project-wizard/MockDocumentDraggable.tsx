import { useCallback } from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { useWizardStore, type WizardFormData } from './useWizardStore';

/**
 * Predefined demo project data used when the mock document is dropped
 * onto the WizardChatPanel.
 */
const DEMO_FORM_DATA: WizardFormData = {
  name: 'Flowlee Mobile App',
  brief:
    'Build a native-feeling mobile companion that mirrors the core web experience — dashboard, projects, and team views — optimized for on-the-go usage.',
  owner: 'member-alice',
  deadline: '2025-09-30',
  budget: '250000',
  type: 'Mobile',
};

/**
 * The MIME type used for the drag-and-drop data transfer to identify
 * this specific drag source when dropped onto the chat panel.
 */
export const MOCK_DOCUMENT_DRAG_TYPE = 'application/x-flowlee-mock-document';

const draggableStyles = cva(
  [
    'inline-flex items-center gap-2 rounded-xl px-3 py-2',
    'bg-white shadow-[0px_2px_12px_0px_rgba(0,0,0,0.08)]',
    'border border-gray-200',
    'cursor-grab active:cursor-grabbing',
    'select-none transition-shadow duration-150',
    'hover:shadow-[0px_4px_16px_0px_rgba(0,0,0,0.12)]',
    'text-sm font-medium text-gray-700',
  ],
  {
    variants: {
      dragging: {
        true: 'opacity-50 shadow-none',
        false: '',
      },
    },
    defaultVariants: {
      dragging: false,
    },
  }
);

/**
 * MockDocumentDraggable — a draggable card/pill that, when dropped onto the
 * WizardChatPanel, populates the project form with predefined demo values
 * and appends a confirmation chat message.
 *
 * Behavior:
 * - Uses native HTML5 drag events (no DnD library)
 * - On successful drop onto chat panel: fills form via useWizardStore,
 *   adds confirmation message, hides itself for the session
 * - On drop outside the panel: reverts (stays visible, no data change)
 * - Hidden after first successful use (`usedMockDocument` in store)
 *
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */
export function MockDocumentDraggable({ className }: { className?: string }) {
  const { usedMockDocument } = useWizardStore();

  // Req 17.5: hidden after first use in session
  if (usedMockDocument) {
    return null;
  }

  return <MockDocumentDraggableInner className={className} />;
}

function MockDocumentDraggableInner({ className }: { className?: string }) {
  const { setFormData, addChatMessage, setUsedMockDocument } = useWizardStore();

  const handleDragStart = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // Set the drag data with our custom type so the drop target can identify it
      e.dataTransfer.setData(MOCK_DOCUMENT_DRAG_TYPE, JSON.stringify(DEMO_FORM_DATA));
      e.dataTransfer.effectAllowed = 'copy';
    },
    []
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      // dropEffect is 'none' when the drop was not accepted by a valid target
      // In that case, revert (do nothing) per Req 17.4
      if (e.dataTransfer.dropEffect === 'none') {
        // Drop was outside the panel — no action needed, element stays visible
        return;
      }
    },
    []
  );

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(draggableStyles({ dragging: false }), className)}
      aria-label="Drag demo document onto chat to auto-fill project form"
      role="img"
    >
      {/* Document icon */}
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 text-indigo-500"
        aria-hidden="true"
      >
        <path
          d="M4 1h5.586L13 4.414V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 1v4h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 8h6M5 10.5h4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>Demo Brief</span>
    </div>
  );
}

/**
 * Handler to be called by the WizardChatPanel's onDrop event.
 * Validates the drop contains our mock document data, fills the form,
 * adds a confirmation chat message, and hides the draggable.
 *
 * Returns `true` if the drop was handled, `false` otherwise.
 */
export function handleMockDocumentDrop(
  e: React.DragEvent,
  store: {
    setFormData: (data: Partial<WizardFormData>) => void;
    addChatMessage: (msg: { id: string; role: 'user' | 'assistant'; text: string; timestamp: string }) => void;
    setUsedMockDocument: (used: boolean) => void;
  }
): boolean {
  const data = e.dataTransfer.getData(MOCK_DOCUMENT_DRAG_TYPE);
  if (!data) {
    return false;
  }

  try {
    const formData = JSON.parse(data) as WizardFormData;

    // Req 17.2: Populate every project form field with demo values
    store.setFormData(formData);

    // Req 17.3: Append confirmation chat message
    store.addChatMessage({
      id: `msg-mock-doc-${Date.now()}`,
      role: 'assistant',
      text: '📋 Demo data loaded! The project form has been populated with sample values. You can review and adjust the fields, then proceed to generate an analysis.',
      timestamp: new Date().toISOString(),
    });

    // Req 17.5: Hide the draggable for the rest of the session
    store.setUsedMockDocument(true);

    return true;
  } catch {
    return false;
  }
}
