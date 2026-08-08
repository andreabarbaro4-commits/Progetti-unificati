import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AnimatedBackground } from './AnimatedBackground';

describe('AnimatedBackground', () => {
  it('renders with aria-hidden="true" on container', () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders exactly 8 blob child divs', () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild as HTMLElement;
    const blobs = root.querySelectorAll('.blob');
    expect(blobs).toHaveLength(8);
  });

  it('container has pointer-events: none', () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.pointerEvents).toBe('none');
  });

  it('contains no focusable elements (no tabindex, links, buttons)', () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild as HTMLElement;
    const focusable = root.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]'
    );
    expect(focusable).toHaveLength(0);
  });

  it('visible={false} sets visibility: hidden and DOM node stays mounted', () => {
    const { container } = render(<AnimatedBackground visible={false} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.visibility).toBe('hidden');
    expect(root).toBeInTheDocument();
  });

  it('default render (no prop) shows blobs visible', () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.visibility).toBe('visible');
  });

  it('container has position: fixed and inset: 0', () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.position).toBe('fixed');
    expect(root.style.inset).toBe('0px');
  });

  it('container has overflow: hidden', () => {
    const { container } = render(<AnimatedBackground />);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.overflow).toBe('hidden');
  });
});
