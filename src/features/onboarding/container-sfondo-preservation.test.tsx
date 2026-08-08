/**
 * Preservation Property Tests — Step Card Appearance and Layout
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 *
 * These property-based tests verify that the layout and styling properties
 * that MUST be preserved after the bugfix remain intact. Written BEFORE
 * implementing the fix to establish a baseline on UNFIXED code.
 *
 * EXPECTED BEHAVIOR: These tests PASS on both UNFIXED and FIXED code —
 * confirming no regressions were introduced.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const appCssPath = resolve(__dirname, '../../App.css');
const appCssContent = readFileSync(appCssPath, 'utf-8');

/**
 * Extracts all rule blocks matching a given selector pattern from raw CSS.
 * Returns an array of { selector, declarations, lineNumber }.
 */
function extractRuleBlocks(
  css: string,
  selectorMatch: (trimmedLine: string) => boolean,
): Array<{ selector: string; declarations: string; lineNumber: number }> {
  const results: Array<{ selector: string; declarations: string; lineNumber: number }> = [];
  const lines = css.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (selectorMatch(trimmed)) {
      // Extract selector name (everything before the brace)
      const selector = trimmed.replace(/\s*\{$/, '');
      let braceCount = 1;
      let blockContent = '';
      let j = i + 1;

      while (j < lines.length && braceCount > 0) {
        const blockLine = lines[j];
        if (blockLine.includes('{')) braceCount++;
        if (blockLine.includes('}')) braceCount--;
        if (braceCount > 0) {
          blockContent += blockLine + '\n';
        }
        j++;
      }

      results.push({ selector, declarations: blockContent, lineNumber: i + 1 });
    }
  }

  return results;
}

/**
 * Extracts all standalone `.container-sfondo` rule blocks (not compound selectors).
 */
function extractStandaloneContainerSfondoRules(css: string) {
  return extractRuleBlocks(css, (line) =>
    line === '.container-sfondo {' || line === '.container-sfondo{',
  );
}

/**
 * Extracts all standalone `.Step` rule blocks (not compound/descendant selectors).
 */
function extractStandaloneStepRules(css: string) {
  return extractRuleBlocks(css, (line) =>
    line === '.Step {' || line === '.Step{',
  );
}

/**
 * Extracts `.container-sfondo.schermata-con-sfondo` rule blocks.
 */
function extractSchermataConSfondoRules(css: string) {
  return extractRuleBlocks(css, (line) =>
    line.startsWith('.container-sfondo.schermata-con-sfondo {') ||
    line.startsWith('.container-sfondo.schermata-con-sfondo{'),
  );
}

/**
 * Helper to extract a CSS property value from a declarations block.
 * Returns the value (trimmed, lowercase) or null if not found.
 */
function getCssPropertyValue(declarations: string, property: string): string | null {
  // Match the property, accounting for !important
  const regex = new RegExp(`${property.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\s*:\\s*([^;]+)`, 'i');
  const match = declarations.match(regex);
  if (!match) return null;
  return match[1].trim().replace(/\s*!important\s*$/, '').toLowerCase();
}

// Parse the CSS at module load
const containerSfondoRules = extractStandaloneContainerSfondoRules(appCssContent);
const stepRules = extractStandaloneStepRules(appCssContent);
const schermataConSfondoRules = extractSchermataConSfondoRules(appCssContent);

describe('Preservation — Container-Sfondo Layout Properties', () => {
  it('Property 2a: .container-sfondo rules collectively provide flexbox centering (display: flex, justify-content: center, align-items: center)', () => {
    /**
     * **Validates: Requirements 3.2**
     *
     * The .container-sfondo element MUST continue to center its child content
     * both horizontally and vertically using flexbox.
     */
    expect(
      containerSfondoRules.length,
      'Expected to find at least one standalone .container-sfondo rule in App.css',
    ).toBeGreaterThan(0);

    // Collect all declarations across all .container-sfondo rules to find
    // the combined set of properties (CSS cascade applies all matching rules)
    const allDeclarations = containerSfondoRules.map((r) => r.declarations).join('\n');

    const ruleArb = fc.constantFrom(
      ...containerSfondoRules.map((rule, idx) => ({ ...rule, ruleIndex: idx })),
    );

    // At least one rule must declare each flexbox centering property
    const hasDisplay = getCssPropertyValue(allDeclarations, 'display');
    const hasJustifyContent = getCssPropertyValue(allDeclarations, 'justify-content');
    const hasAlignItems = getCssPropertyValue(allDeclarations, 'align-items');

    expect(hasDisplay, 'Expected at least one .container-sfondo rule to declare display: flex').toBe('flex');
    expect(hasJustifyContent, 'Expected at least one .container-sfondo rule to declare justify-content: center').toBe('center');
    expect(hasAlignItems, 'Expected at least one .container-sfondo rule to declare align-items: center').toBe('center');

    // Property-based: for all rules that declare these, they must be correct values
    fc.assert(
      fc.property(ruleArb, ({ declarations, lineNumber, ruleIndex }) => {
        const display = getCssPropertyValue(declarations, 'display');
        const justifyContent = getCssPropertyValue(declarations, 'justify-content');
        const alignItems = getCssPropertyValue(declarations, 'align-items');

        // If a rule declares these properties, they must be the centering values
        if (display !== null) {
          expect(
            display,
            `.container-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has display: ${display}, expected flex`,
          ).toBe('flex');
        }
        if (justifyContent !== null) {
          expect(
            justifyContent,
            `.container-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has justify-content: ${justifyContent}, expected center`,
          ).toBe('center');
        }
        if (alignItems !== null) {
          expect(
            alignItems,
            `.container-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has align-items: ${alignItems}, expected center`,
          ).toBe('center');
        }
      }),
      { numRuns: 100 },
    );
  });

  it('Property 2b: .container-sfondo rules collectively provide full viewport height (min-height: 100vh) and full width (width: 100%)', () => {
    /**
     * **Validates: Requirements 3.3**
     *
     * The .container-sfondo element MUST continue to take up the full viewport
     * height (min-height: 100vh) and full width (width: 100%).
     *
     * Note: There are multiple .container-sfondo rules in App.css. In CSS,
     * the last valid value in cascade order wins. We verify that at least one
     * rule provides the correct values (the browser ignores invalid values like "autos").
     */

    // Collect all min-height and width values across all rules
    const allMinHeights = containerSfondoRules
      .map((r) => getCssPropertyValue(r.declarations, 'min-height'))
      .filter((v): v is string => v !== null);
    const allWidths = containerSfondoRules
      .map((r) => getCssPropertyValue(r.declarations, 'width'))
      .filter((v): v is string => v !== null);

    // At least one rule must declare min-height: 100vh (invalid values like "autos" are ignored by browsers)
    expect(
      allMinHeights.includes('100vh'),
      `Expected at least one .container-sfondo rule to declare min-height: 100vh, found: [${allMinHeights.join(', ')}]`,
    ).toBe(true);

    expect(
      allWidths.includes('100%') || allWidths.includes('100vw'),
      `Expected at least one .container-sfondo rule to declare width: 100% or 100vw, found: [${allWidths.join(', ')}]`,
    ).toBe(true);

    const ruleArb = fc.constantFrom(
      ...containerSfondoRules.map((rule, idx) => ({ ...rule, ruleIndex: idx })),
    );

    fc.assert(
      fc.property(ruleArb, ({ declarations, lineNumber, ruleIndex }) => {
        const minHeight = getCssPropertyValue(declarations, 'min-height');
        const width = getCssPropertyValue(declarations, 'width');

        // If a rule declares valid min-height (not a typo), it must be 100vh
        if (minHeight !== null && minHeight !== 'autos') {
          expect(
            minHeight,
            `.container-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has min-height: ${minHeight}, expected 100vh`,
          ).toBe('100vh');
        }
        // If a rule declares width, it must be full-width (100% or 100vw)
        if (width !== null) {
          const isFullWidth = width === '100%' || width === '100vw';
          expect(
            isFullWidth,
            `.container-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has width: ${width}, expected 100% or 100vw`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });
});

describe('Preservation — Step Card Appearance', () => {
  it('Property 2c: .Step rules provide white background (background-color: #ffffff)', () => {
    /**
     * **Validates: Requirements 3.1**
     *
     * The .Step card MUST continue to display with its own white background.
     */
    expect(
      stepRules.length,
      'Expected to find at least one standalone .Step rule in App.css',
    ).toBeGreaterThan(0);

    const allDeclarations = stepRules.map((r) => r.declarations).join('\n');
    const hasBgColor = getCssPropertyValue(allDeclarations, 'background-color');

    expect(
      hasBgColor,
      'Expected at least one .Step rule to declare background-color: #ffffff',
    ).toBe('#ffffff');
  });

  it('Property 2d: .Step rules provide rounded corners (border-radius: 20px)', () => {
    /**
     * **Validates: Requirements 3.1**
     *
     * The .Step card MUST continue to display with rounded corners.
     */
    const allDeclarations = stepRules.map((r) => r.declarations).join('\n');
    const hasBorderRadius = getCssPropertyValue(allDeclarations, 'border-radius');

    expect(
      hasBorderRadius,
      'Expected at least one .Step rule to declare border-radius: 20px',
    ).toBe('20px');
  });

  it('Property 2e: .Step rules provide a box-shadow', () => {
    /**
     * **Validates: Requirements 3.1**
     *
     * The .Step card MUST continue to display with a box shadow.
     */
    const allDeclarations = stepRules.map((r) => r.declarations).join('\n');
    const hasBoxShadow = getCssPropertyValue(allDeclarations, 'box-shadow');

    expect(
      hasBoxShadow,
      'Expected at least one .Step rule to declare a box-shadow',
    ).not.toBeNull();
    expect(
      hasBoxShadow,
      'Expected .Step box-shadow to not be "none"',
    ).not.toBe('none');
  });
});

describe('Preservation — schermata-con-sfondo Variant', () => {
  it('Property 2f: .container-sfondo.schermata-con-sfondo variant has its own layout rules and is unaffected', () => {
    /**
     * **Validates: Requirements 3.4**
     *
     * The .container-sfondo.schermata-con-sfondo variant styling must remain unaffected.
     */
    expect(
      schermataConSfondoRules.length,
      'Expected to find at least one .container-sfondo.schermata-con-sfondo rule in App.css',
    ).toBeGreaterThan(0);

    const ruleArb = fc.constantFrom(
      ...schermataConSfondoRules.map((rule, idx) => ({ ...rule, ruleIndex: idx })),
    );

    fc.assert(
      fc.property(ruleArb, ({ declarations, lineNumber, ruleIndex }) => {
        // Verify the variant retains its own display/centering properties
        const display = getCssPropertyValue(declarations, 'display');
        const justifyContent = getCssPropertyValue(declarations, 'justify-content');
        const alignItems = getCssPropertyValue(declarations, 'align-items');
        const width = getCssPropertyValue(declarations, 'width');
        const minHeight = getCssPropertyValue(declarations, 'min-height');

        if (display !== null) {
          expect(
            display,
            `.container-sfondo.schermata-con-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has display: ${display}, expected flex`,
          ).toBe('flex');
        }
        if (justifyContent !== null) {
          expect(
            justifyContent,
            `.container-sfondo.schermata-con-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has justify-content: ${justifyContent}, expected center`,
          ).toBe('center');
        }
        if (alignItems !== null) {
          expect(
            alignItems,
            `.container-sfondo.schermata-con-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has align-items: ${alignItems}, expected center`,
          ).toBe('center');
        }
        if (width !== null) {
          expect(
            width,
            `.container-sfondo.schermata-con-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has width: ${width}, expected 100%`,
          ).toBe('100%');
        }
        if (minHeight !== null) {
          expect(
            minHeight,
            `.container-sfondo.schermata-con-sfondo rule #${ruleIndex + 1} (line ${lineNumber}) has min-height: ${minHeight}, expected 100vh`,
          ).toBe('100vh');
        }
      }),
      { numRuns: 100 },
    );
  });
});
