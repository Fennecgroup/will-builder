// Diff Engine - Compare existing vs generated content

import { PlateNode, DiffResult } from './types';

/**
 * Extract plain text from Plate nodes recursively
 * @param nodes Array of PlateNodes or mixed nodes
 * @returns Plain text string
 */
function extractPlainText(nodes: (PlateNode | any)[]): string {
  const lines: string[] = [];

  for (const node of nodes) {
    if ('text' in node && typeof node.text === 'string') {
      lines.push(node.text);
    } else if ('children' in node && Array.isArray(node.children)) {
      const childText = extractPlainText(node.children);
      if (childText) {
        lines.push(childText);
      }
    }
  }

  return lines.join('\n');
}

/**
 * Convert Plate nodes to text lines for diffing
 * @param nodes Array of PlateNodes
 * @returns Array of text lines
 */
function nodesToLines(nodes: PlateNode[]): string[] {
  const lines: string[] = [];

  for (const node of nodes) {
    const text = extractPlainText([node]);
    if (text.trim()) {
      // Split by newlines if text contains multiple lines
      const splitLines = text.split('\n').filter((line) => line.trim());
      lines.push(...splitLines);
    }
  }

  return lines;
}

/**
 * Simple diff algorithm (Myers' diff simplified)
 * @param oldLines Array of old text lines
 * @param newLines Array of new text lines
 * @returns Array of diff operations
 */
function computeDiff(
  oldLines: string[],
  newLines: string[]
): Array<{ type: 'add' | 'remove' | 'same'; line: string }> {
  const result: Array<{ type: 'add' | 'remove' | 'same'; line: string }> = [];

  // Simple line-by-line comparison
  // For a production app, consider using a proper diff library like 'diff'
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (oldIndex >= oldLines.length) {
      // Remaining lines are additions
      result.push({ type: 'add', line: newLines[newIndex] });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // Remaining lines are removals
      result.push({ type: 'remove', line: oldLines[oldIndex] });
      oldIndex++;
    } else if (oldLines[oldIndex] === newLines[newIndex]) {
      // Lines are the same
      result.push({ type: 'same', line: oldLines[oldIndex] });
      oldIndex++;
      newIndex++;
    } else {
      // Lines differ - check if line exists elsewhere
      const oldInNew = newLines.indexOf(oldLines[oldIndex], newIndex);
      const newInOld = oldLines.indexOf(newLines[newIndex], oldIndex);

      if (oldInNew !== -1 && (newInOld === -1 || oldInNew < newInOld)) {
        // Old line exists later in new - treat as insertion before it
        result.push({ type: 'add', line: newLines[newIndex] });
        newIndex++;
      } else if (newInOld !== -1) {
        // New line exists later in old - treat as deletion
        result.push({ type: 'remove', line: oldLines[oldIndex] });
        oldIndex++;
      } else {
        // Lines are truly different - treat as remove + add
        result.push({ type: 'remove', line: oldLines[oldIndex] });
        result.push({ type: 'add', line: newLines[newIndex] });
        oldIndex++;
        newIndex++;
      }
    }
  }

  return result;
}

/**
 * Generate unified diff string
 * @param diffOps Array of diff operations
 * @param contextLines Number of context lines to show
 * @returns Unified diff string
 */
function generateUnifiedDiff(
  diffOps: Array<{ type: 'add' | 'remove' | 'same'; line: string }>,
  contextLines: number = 3
): string {
  const lines: string[] = [];

  for (let i = 0; i < diffOps.length; i++) {
    const op = diffOps[i];

    switch (op.type) {
      case 'add':
        lines.push(`+ ${op.line}`);
        break;
      case 'remove':
        lines.push(`- ${op.line}`);
        break;
      case 'same':
        // Only show context lines around changes
        const hasChangeNearby =
          (i > 0 && diffOps[i - contextLines]?.type !== 'same') ||
          (i < diffOps.length - 1 &&
            diffOps[i + contextLines]?.type !== 'same');

        if (hasChangeNearby) {
          lines.push(`  ${op.line}`);
        }
        break;
    }
  }

  return lines.join('\n');
}

/**
 * Generate diff between existing and generated content
 * @param existingContent Array of existing PlateNodes
 * @param generatedContent Array of generated PlateNodes
 * @returns DiffResult object
 */
export function generateDiff(
  existingContent: PlateNode[],
  generatedContent: PlateNode[]
): DiffResult {
  // Convert nodes to text lines
  const oldLines = nodesToLines(existingContent);
  const newLines = nodesToLines(generatedContent);

  // Compute diff
  const diffOps = computeDiff(oldLines, newLines);

  // Count changes
  const additions = diffOps.filter((op) => op.type === 'add').length;
  const deletions = diffOps.filter((op) => op.type === 'remove').length;
  const modifications = Math.min(additions, deletions);

  // Generate unified diff
  const unifiedDiff = generateUnifiedDiff(diffOps);

  return {
    hasChanges: additions > 0 || deletions > 0,
    unifiedDiff,
    additions,
    deletions,
    modifications,
    existingContent,
    generatedContent,
  };
}

/**
 * Compare two Plate node arrays for equality
 * @param nodes1 First array of nodes
 * @param nodes2 Second array of nodes
 * @returns true if nodes are equal
 */
export function areNodesEqual(
  nodes1: PlateNode[],
  nodes2: PlateNode[]
): boolean {
  const text1 = extractPlainText(nodes1);
  const text2 = extractPlainText(nodes2);

  return text1.trim() === text2.trim();
}

/**
 * Get diff summary string
 * @param diff DiffResult object
 * @returns Human-readable summary
 */
export function getDiffSummary(diff: DiffResult): string {
  if (!diff.hasChanges) {
    return 'No changes';
  }

  const parts: string[] = [];

  if (diff.additions > 0) {
    parts.push(`${diff.additions} addition${diff.additions > 1 ? 's' : ''}`);
  }

  if (diff.deletions > 0) {
    parts.push(`${diff.deletions} deletion${diff.deletions > 1 ? 's' : ''}`);
  }

  return parts.join(', ');
}
