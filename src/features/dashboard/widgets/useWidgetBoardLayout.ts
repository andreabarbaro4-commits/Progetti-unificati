import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collides, type LayoutItem } from 'react-grid-layout';
import { defaultWidgetLayout, type WidgetLayoutItem } from '../../../mock/fixtures/widgetLayouts';

/**
 * Number of grid columns the Widget_Board uses. Matches the demo's 4-column
 * iOS-style square grid.
 */
const GRID_COLS = 4;

export interface WidgetBoardStore {
  layout: WidgetLayoutItem[];
  /** Adds a widget of `widgetId` at the first non-overlapping position for `defaultSize`. */
  addWidget: (widgetId: string, defaultSize: { w: number; h: number }) => void;
  /**
   * Moves `widgetId` to `(x, y)`. Returns `false` (and leaves the layout
   * unchanged) if the move would overlap another widget or fall outside the
   * grid's bounds.
   */
  moveWidget: (widgetId: string, x: number, y: number) => boolean;
  /**
   * Resizes `widgetId` to `(w, h)`. Returns `false` (and leaves the layout
   * unchanged) if the resize would overlap another widget or fall outside
   * the grid's bounds.
   */
  resizeWidget: (widgetId: string, w: number, h: number) => boolean;
  /** Removes `widgetId` from the layout, freeing its occupied cells. */
  removeWidget: (widgetId: string) => void;
}

function toLayoutItem(item: WidgetLayoutItem): LayoutItem {
  return { i: item.widgetId, x: item.x, y: item.y, w: item.w, h: item.h };
}

function isWithinBounds(x: number, y: number, w: number, h: number): boolean {
  return x >= 0 && y >= 0 && w >= 1 && h >= 1 && x + w <= GRID_COLS;
}

function collidesWithAny(candidate: LayoutItem, others: LayoutItem[]): boolean {
  return others.some((other) => collides(candidate, other));
}

/**
 * Finds the first non-overlapping `(x, y)` slot for a `w`x`h` widget by
 * scanning row by row, column by column, using AABB collision checks
 * against every existing item (via react-grid-layout's `collides`).
 */
function findFirstOpenSlot(
  layout: WidgetLayoutItem[],
  w: number,
  h: number
): { x: number; y: number } {
  const others = layout.map(toLayoutItem);
  const maxY = layout.reduce((max, item) => Math.max(max, item.y + item.h), 0);

  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= GRID_COLS - w; x++) {
      const candidate: LayoutItem = { i: '__candidate__', x, y, w, h };
      if (!collidesWithAny(candidate, others)) {
        return { x, y };
      }
    }
  }
  // No open slot within the existing occupied rows — append below everything.
  return { x: 0, y: maxY };
}

export const useWidgetBoardLayout = create<WidgetBoardStore>()(
  persist(
    (set, get) => ({
      layout: defaultWidgetLayout,

      addWidget: (widgetId, defaultSize) => {
        const { layout } = get();
        if (layout.some((item) => item.widgetId === widgetId)) return;
        const { w, h } = defaultSize;
        const { x, y } = findFirstOpenSlot(layout, w, h);
        set({ layout: [...layout, { widgetId, x, y, w, h }] });
      },

      moveWidget: (widgetId, x, y) => {
        const { layout } = get();
        const target = layout.find((item) => item.widgetId === widgetId);
        if (!target) return false;
        if (!isWithinBounds(x, y, target.w, target.h)) return false;

        const candidate: LayoutItem = { i: widgetId, x, y, w: target.w, h: target.h };
        const others = layout
          .filter((item) => item.widgetId !== widgetId)
          .map(toLayoutItem);
        if (collidesWithAny(candidate, others)) return false;

        set({
          layout: layout.map((item) => (item.widgetId === widgetId ? { ...item, x, y } : item)),
        });
        return true;
      },

      resizeWidget: (widgetId, w, h) => {
        const { layout } = get();
        const target = layout.find((item) => item.widgetId === widgetId);
        if (!target) return false;
        if (!isWithinBounds(target.x, target.y, w, h)) return false;

        const candidate: LayoutItem = { i: widgetId, x: target.x, y: target.y, w, h };
        const others = layout
          .filter((item) => item.widgetId !== widgetId)
          .map(toLayoutItem);
        if (collidesWithAny(candidate, others)) return false;

        set({
          layout: layout.map((item) => (item.widgetId === widgetId ? { ...item, w, h } : item)),
        });
        return true;
      },

      removeWidget: (widgetId) => {
        set((state) => ({
          layout: state.layout.filter((item) => item.widgetId !== widgetId),
        }));
      },
    }),
    {
      name: 'widget-board-layout',
      storage: {
        getItem: (name) => {
          try {
            const value = localStorage.getItem(name);
            if (!value) return null;
            return JSON.parse(value);
          } catch {
            // Handle localStorage corruption by removing bad data and falling back to defaults
            localStorage.removeItem(name);
            return null;
          }
        },
        setItem: (name, value: unknown) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch {
            // Silently fail if localStorage is full or unavailable
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch {
            // Silently fail if localStorage is unavailable
          }
        },
      },
      partialize: (state): Pick<WidgetBoardStore, 'layout'> => ({
        layout: state.layout,
      }),
    }
  )
);
