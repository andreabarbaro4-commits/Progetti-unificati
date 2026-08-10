import { useCallback, useMemo } from 'react';
import { useWizardStore } from './useWizardStore';

/**
 * Shared member-selection-state hook used by all three entry points in
 * Team_Selection_Step (Req 20.3, 20.8, 20.10):
 * - MemberGraph bubble clicks (toggle selection)
 * - AddMemberPopup (add to selection)
 * - List-view checkboxes (toggle selection)
 *
 * Wraps `useWizardStore.selectedMembers` / `toggleMember` / `setSelectedMembers`
 * to provide a stable, shareable interface that guarantees consistent state
 * across all three entry points and is unaffected by view toggling (Req 20.9).
 *
 * Property 29: Selection state is consistent across all three entry points and
 * unaffected by view toggling.
 */
export function useMemberSelection() {
  const selectedMembers = useWizardStore((s) => s.selectedMembers);
  const toggleMember = useWizardStore((s) => s.toggleMember);
  const setSelectedMembers = useWizardStore((s) => s.setSelectedMembers);

  /** A Set view of the current selection for O(1) membership checks. */
  const selectedMemberIds = useMemo(
    () => new Set(selectedMembers),
    [selectedMembers],
  );

  /** True when at least one member is selected (Req 20.6 gating). */
  const hasSelection = selectedMembers.length > 0;

  /** Number of currently selected members. */
  const selectionCount = selectedMembers.length;

  /**
   * Toggle a member's selection state (add if absent, remove if present).
   * Used by MemberGraph bubble clicks (Req 20.3) and list-view checkboxes (Req 20.10).
   */
  const toggle = useCallback(
    (memberId: string) => {
      toggleMember(memberId);
    },
    [toggleMember],
  );

  /**
   * Add a member to the selection (idempotent — no-op if already selected).
   * Used by the AddMemberPopup (Req 20.8) where selecting a member from the
   * popup always means "add", never "remove".
   */
  const addMember = useCallback(
    (memberId: string) => {
      if (!selectedMemberIds.has(memberId)) {
        toggleMember(memberId);
      }
    },
    [selectedMemberIds, toggleMember],
  );

  /**
   * Remove a member from the selection (idempotent — no-op if not selected).
   */
  const removeMember = useCallback(
    (memberId: string) => {
      if (selectedMemberIds.has(memberId)) {
        toggleMember(memberId);
      }
    },
    [selectedMemberIds, toggleMember],
  );

  /**
   * Check if a given member is currently selected.
   */
  const isMemberSelected = useCallback(
    (memberId: string): boolean => {
      return selectedMemberIds.has(memberId);
    },
    [selectedMemberIds],
  );

  /**
   * Replace the entire selection (e.g. bulk-select from AI suggestions).
   */
  const setSelection = useCallback(
    (memberIds: string[]) => {
      setSelectedMembers(memberIds);
    },
    [setSelectedMembers],
  );

  /**
   * Clear the entire selection.
   */
  const clearSelection = useCallback(() => {
    setSelectedMembers([]);
  }, [setSelectedMembers]);

  return {
    /** The raw array of selected member IDs (from the store). */
    selectedMembers,
    /** A Set of selected member IDs for O(1) lookups — pass to MemberGraph's `selectedMemberIds` prop. */
    selectedMemberIds,
    /** Whether at least one member is selected. */
    hasSelection,
    /** Number of selected members. */
    selectionCount,
    /** Toggle a member (add/remove). Used by MemberGraph clicks and list-view checkboxes. */
    toggle,
    /** Add a member (idempotent). Used by AddMemberPopup. */
    addMember,
    /** Remove a member (idempotent). */
    removeMember,
    /** Check if a member is selected. */
    isMemberSelected,
    /** Replace the entire selection set. */
    setSelection,
    /** Clear all selections. */
    clearSelection,
  };
}
