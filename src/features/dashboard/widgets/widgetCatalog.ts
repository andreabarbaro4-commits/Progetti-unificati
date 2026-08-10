import { lazy } from 'react';
import type { ComponentType } from 'react';
import type { IconType } from 'react-icons';
import {
  HiOutlineChartBar,
  HiOutlineBellAlert,
  HiOutlineDocumentText,
  HiOutlineCheckCircle,
  HiOutlineFlag,
  HiOutlinePhoto,
} from 'react-icons/hi2';

export interface WidgetSize {
  w: number;
  h: number;
}

export interface WidgetCatalogEntry {
  id: string;
  label: string;
  icon: IconType;
  defaultSize: WidgetSize;
  allowedSizes?: WidgetSize[];
  Component: React.LazyExoticComponent<ComponentType>;
}

/**
 * widgetCatalog — the registry of every Widget type the Widget_Board's
 * add-widget control can offer (Req 11.6, 12.1).
 *
 * `id` values intentionally match the `widgetId`s already used by
 * `defaultWidgetLayout` in `src/mock/fixtures/widgetLayouts.ts`, so the
 * default layout resolves against this catalog without drift.
 *
 * Each entry's `Component` is loaded via `React.lazy()` rather than a
 * static top-level import, following the same pattern as `src/routes.tsx`.
 * This keeps this file's own compile/type-check independent of whether the
 * real widget implementations (`StatsWidget.tsx`, `AlertsWidget.tsx`, etc.)
 * have already landed — some are built by parallel tasks (14.6, 14.8, 14.9)
 * and are placeholder stubs here until those tasks overwrite them in place.
 */
export const widgetCatalog: WidgetCatalogEntry[] = [
  {
    id: 'stats',
    label: 'Project Stats',
    icon: HiOutlineChartBar,
    defaultSize: { w: 2, h: 1 },
    Component: lazy(() => import('./StatsWidget')),
  },
  {
    id: 'alerts',
    label: 'Alerts',
    icon: HiOutlineBellAlert,
    defaultSize: { w: 2, h: 2 },
    Component: lazy(() => import('./AlertsWidget')),
  },
  {
    id: 'documents',
    label: 'Recent Documents',
    icon: HiOutlineDocumentText,
    defaultSize: { w: 2, h: 2 },
    Component: lazy(() => import('./DocumentsWidget')),
  },
  {
    id: 'action-items',
    label: 'Action Items',
    icon: HiOutlineCheckCircle,
    defaultSize: { w: 2, h: 2 },
    Component: lazy(() => import('./ActionItemsWidget')),
  },
  {
    id: 'milestones-week',
    label: "This Week's Milestones",
    icon: HiOutlineFlag,
    defaultSize: { w: 3, h: 2 },
    Component: lazy(() => import('./MilestonesWeekWidget')),
  },
  {
    id: 'photo-gallery',
    label: 'Photo Gallery',
    icon: HiOutlinePhoto,
    defaultSize: { w: 3, h: 2 },
    Component: lazy(() => import('./PhotoGalleryWidget')),
  },
];
