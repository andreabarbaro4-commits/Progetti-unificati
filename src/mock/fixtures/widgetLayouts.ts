// Default Widget_Board layout — iOS-style 4-column square grid.
// Consumed directly by the `useWidgetBoardLayout` zustand store as the
// fallback when a device has no previously persisted layout.

export interface WidgetLayoutItem {
  /** Matches an id in the Dashboard's widgetCatalog registry. */
  widgetId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// 4 columns. Sizes: small=1×1, medium=2×1, large=2×2.
export const defaultWidgetLayout: WidgetLayoutItem[] = [
  { widgetId: 'stats', x: 0, y: 0, w: 2, h: 2 },       // large
  { widgetId: 'alerts', x: 2, y: 0, w: 1, h: 1 },       // small
  { widgetId: 'action-items', x: 3, y: 0, w: 1, h: 1 },  // small
  { widgetId: 'documents', x: 0, y: 2, w: 2, h: 2 },    // large
  { widgetId: 'milestones-week', x: 2, y: 1, w: 2, h: 2 }, // large
  { widgetId: 'photo-gallery', x: 2, y: 3, w: 2, h: 2 }, // large
];
