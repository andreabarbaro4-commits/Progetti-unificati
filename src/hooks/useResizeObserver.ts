import { useEffect, type RefObject } from 'react';

/**
 * Observes an element's size changes via the `ResizeObserver` API and invokes
 * the provided callback with each `ResizeObserverEntry`.
 *
 * Used by ProjectsList to drive the responsive column count via
 * `columnsForWidth` — the observer fires whenever the container's content box
 * changes (e.g. on window resize, layout shift, etc.).
 *
 * @param ref A React ref pointing to the observed element.
 * @param callback Invoked on each resize entry.
 */
export function useResizeObserver(
  ref: RefObject<HTMLElement | null>,
  callback: (entry: ResizeObserverEntry) => void,
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      // Only the first entry matters — we observe a single element.
      const entry = entries[0];
      if (entry) {
        callback(entry);
      }
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}
