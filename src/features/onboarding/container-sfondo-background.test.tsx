/**
 * Bug Condition Exploration Test — Container Background Transparency
 *
 * **Validates: Requirements 1.1, 1.2, 2.1, 2.2**
 *
 * This property-based test checks that `.container-sfondo` elements should have a
 * transparent background, allowing `AnimatedBackground` to show through.
 *
 * The test parses the actual App.css stylesheet and verifies that NO
 * standalone `.container-sfondo` rule applies an opaque background-color.
 *
 * EXPECTED BEHAVIOR: On UNFIXED code, this test FAILS because `.container-sfondo`
 * currently applies `background-color: #ffffff`.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';

// Read the raw CSS content using Node.js fs at test time
import { readFileSync } from 'fs';
import { resolve } from 'path';

const appCssPath = resolve(__dirname, '../../App.css');
const appCssContent = readFileSync(appCssPath, 'utf-8');

/**
 * Parses raw CSS and extracts all standalone `.container-sfondo` rule blocks.
 * "Standalone" means the selector is exactly `.container-sfondo` — not compound
 * selectors like `.container-sfondo.schermata-con-sfondo` or descendant selectors
 * like `body .container-sfondo .Step`.
 *
 * Returns array of { declarations, lineNumber } for each matching block.
 */
function extractStandaloneContainerSfondoRules(css: string): Array<{ declarations: string; lineNumber: number }> {
  const results: Array<{ declarations: string; lineNumber: number }> = [];
  const lines = css.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Match lines that are exactly `.container-sfondo {` (standalone selector)
    // This excludes compound selectors and descendant selectors
    if (trimmed === '.container-sfondo {' || trimmed === '.container-sfondo{') {
      // Collect the rule block content until closing brace
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

      results.push({ declarations: blockContent, lineNumber: i + 1 });
    }
  }

  return results;
}

/**
 * Checks whether a CSS declarations block contains an opaque background-color.
 * Returns the value if opaque, or null if transparent/absent.
 */
function getOpaqueBackgroundColor(declarations: string): string | null {
  const match = declarations.match(/background-color\s*:\s*([^;!]+)/);
  if (!match) return null;

  const value = match[1].trim().toLowerCase();

  // These are transparent — not a bug
  if (
    value === 'transparent' ||
    value === 'rgba(0, 0, 0, 0)' ||
    value === 'rgba(0,0,0,0)' ||
    value === 'initial' ||
    value === 'inherit'
  ) {
    return null;
  }

  // Any other value is opaque
  return value;
}

// Parse the CSS at module load time
const standaloneRules = extractStandaloneContainerSfondoRules(appCssContent);

describe('Bug Condition — Container Background Transparency', () => {
  it('Property 1: standalone .container-sfondo rules should NOT declare an opaque background-color', () => {
    // Precondition: we found at least one standalone .container-sfondo rule
    expect(
      standaloneRules.length,
      'Expected to find at least one standalone .container-sfondo { ... } rule in App.css',
    ).toBeGreaterThan(0);

    // Use fast-check to iterate over all discovered rule blocks
    const ruleArb = fc.constantFrom(
      ...standaloneRules.map((rule, idx) => ({ ...rule, ruleIndex: idx })),
    );

    fc.assert(
      fc.property(ruleArb, ({ declarations, lineNumber, ruleIndex }) => {
        const opaqueColor = getOpaqueBackgroundColor(declarations);

        expect(
          opaqueColor,
          `Bug condition detected in .container-sfondo rule #${ruleIndex + 1} (line ${lineNumber}): ` +
            `background-color is "${opaqueColor}" — expected transparent or no background-color. ` +
            `This opaque background blocks AnimatedBackground from showing through.`,
        ).toBeNull();
      }),
      { numRuns: 100 },
    );
  });
});
