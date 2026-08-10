import { cn } from '../../lib/utils';
import { useWizardStore } from './useWizardStore';

export interface OpenQuestionsListProps {
  className?: string;
}

/**
 * Displays open questions from the wizard store's analysis data as a numbered list.
 * Renders 1:1 with the source array — each question text is shown verbatim.
 */
export function OpenQuestionsList({ className }: OpenQuestionsListProps) {
  const openQuestions = useWizardStore((s) => s.analysis?.openQuestions ?? []);

  if (openQuestions.length === 0) {
    return (
      <p className={cn('text-sm text-gray-500 italic', className)}>
        No open questions.
      </p>
    );
  }

  return (
    <ol className={cn('list-decimal list-inside space-y-1.5 text-sm text-gray-800', className)} aria-label="Open questions">
      {openQuestions.map((question, index) => (
        <li key={index}>{question}</li>
      ))}
    </ol>
  );
}
