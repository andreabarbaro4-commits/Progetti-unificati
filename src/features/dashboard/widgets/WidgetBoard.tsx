import { Suspense, useEffect, useRef, useState } from 'react';
import ReactGridLayout from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Button } from '../../../components/ui/Button';
import { AddWidgetPicker } from './AddWidgetPicker';
import { widgetCatalog } from './widgetCatalog';
import { useWidgetBoardLayout } from './useWidgetBoardLayout';

/**
 * 4-column iOS-style grid. Square tiles sized from available height.
 */
const GRID_COLS = 4;
const MARGIN = 12;
const MIN_CELL = 64;
const HEADER_GAP = 8;

const catalogById = new Map(widgetCatalog.map((entry) => [entry.id, entry]));

export interface WidgetBoardProps {
  /**
   * Target height for the board to fill exactly (desktop mode).
   * The square tile edge is solved from this height divided across rows.
   * When undefined (mobile), tiles size from the measured container width.
   */
  heightPx?: number;
  /**
   * Reports the height-fitted grid's content width so a split-panel parent can
   * reserve the precise horizontal footprint before its flexible sibling grows.
   */
  onWidthChange?: (width: number) => void;
}

/**
 * WidgetBoard — iOS-style square-tile widget grid (Requirement 11).
 *
 * In desktop mode (heightPx provided): tiles size from the available height
 * so the widget grid fills the same vertical space as the timeline.
 * In mobile mode: tiles size from container width so they're square.
 */
export function WidgetBoard({ heightPx, onWidthChange }: WidgetBoardProps) {
  const { layout, addWidget, moveWidget, removeWidget } = useWidgetBoardLayout();
  const [isEditing, setIsEditing] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  // Measure container width (for mobile mode or when heightPx not provided)
  const gridRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => setMeasuredWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Measure header height
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const layoutItems = layout.filter((item) => catalogById.has(item.widgetId));

  const gridLayout: Layout = layoutItems.map((item) => ({
    i: item.widgetId,
    x: item.x,
    y: item.y,
    w: item.w,
    h: item.h,
  }));

  // Compute the number of rows the layout occupies
  const numRows = Math.max(
    1,
    layoutItems.reduce((max, it) => Math.max(max, it.y + it.h), 0),
  );

  // Compute cell size
  let colWidth: number;
  let rowHeight: number;
  let gridWidth: number;

  if (heightPx !== undefined && heightPx > 0) {
    // Height-fit mode: derive square edge from available vertical space
    const availableHeight = Math.max(
      0,
      heightPx - headerHeight - HEADER_GAP - MARGIN * (numRows - 1),
    );
    const edgeFromHeight = Math.max(MIN_CELL, availableHeight / numRows);
    rowHeight = edgeFromHeight;
    colWidth = edgeFromHeight;
    gridWidth = GRID_COLS * colWidth + MARGIN * (GRID_COLS - 1);
  } else {
    // Width-fit mode (mobile): derive from measured container width
    colWidth = measuredWidth > 0
      ? (measuredWidth - MARGIN * (GRID_COLS - 1)) / GRID_COLS
      : 0;
    rowHeight = colWidth || 1;
    gridWidth = measuredWidth;
  }

  const width = gridWidth;

  // A height-fitted board has an intrinsic width: four square cells plus gaps.
  // Publish only a real desktop measurement so the parent never reserves a
  // transient zero-width/mobile fallback during initial layout.
  useEffect(() => {
    if (
      heightPx === undefined
      || heightPx <= 0
      || !onWidthChange
      || !Number.isFinite(gridWidth)
      || gridWidth <= 0
    ) {
      return;
    }

    onWidthChange(gridWidth);
  }, [gridWidth, heightPx, onWidthChange]);

  const handleAddWidget = (widgetId: string) => {
    const entry = catalogById.get(widgetId);
    if (entry) addWidget(widgetId, entry.defaultSize);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div
        ref={headerRef}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: HEADER_GAP,
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111' }}>Widget</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isEditing && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setPickerOpen((open) => !open)}
              >
                +
              </Button>
              <AddWidgetPicker
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                existingWidgetIds={layout.map((item) => item.widgetId)}
                onAddWidget={handleAddWidget}
              />
            </>
          )}
          <button
            type="button"
            onClick={() => setIsEditing((v) => !v)}
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: isEditing ? '#463a93' : '#555',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div ref={gridRef}>
        {width > 0 && (
          <ReactGridLayout
            width={width}
            layout={gridLayout}
            gridConfig={{
              cols: GRID_COLS,
              rowHeight,
              margin: [MARGIN, MARGIN] as readonly [number, number],
              containerPadding: [0, 0] as readonly [number, number],
            }}
            resizeConfig={{ enabled: false }}
            dragConfig={{ enabled: isEditing }}
            onDragStop={(_layout, _oldItem, newItem) => {
              if (newItem) moveWidget(newItem.i, newItem.x, newItem.y);
            }}
          >
            {layoutItems.map((item) => {
              const entry = catalogById.get(item.widgetId)!;
              const WidgetComponent = entry.Component;
              return (
                <div
                  key={item.widgetId}
                  style={{
                    borderRadius: '1.25rem',
                    overflow: 'hidden',
                    background: 'white',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.04)',
                    position: 'relative',
                  }}
                >
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => removeWidget(item.widgetId)}
                      aria-label={`Remove ${entry.label}`}
                      style={{
                        position: 'absolute',
                        right: '0.375rem',
                        top: '0.375rem',
                        zIndex: 10,
                        width: '1.25rem',
                        height: '1.25rem',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(0,0,0,0.08)',
                        color: '#666',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      ×
                    </button>
                  )}
                  <Suspense
                    fallback={<div style={{ padding: '0.75rem', fontSize: '0.75rem', color: '#999' }}>Loading…</div>}
                  >
                    <WidgetComponent />
                  </Suspense>
                </div>
              );
            })}
          </ReactGridLayout>
        )}
      </div>
    </div>
  );
}

export default WidgetBoard;
