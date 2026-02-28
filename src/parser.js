/**
 * Family Tree Text Syntax
 *
 * # Lines starting with # are comments / section headers (displayed as labels)
 *
 * Basic syntax:
 *   PersonName (dates)                          ← single person
 *   PersonName (dates) + PartnerName (dates)    ← couple (married/partnered)
 *     ChildName (dates)                         ← child (indented under parent)
 *     ChildName (dates) + PartnerName (dates)   ← child with partner
 *       GrandchildName (dates)                  ← grandchild
 *
 * Dates (optional, inside parentheses):
 *   1950         birth year only
 *   1950-2020    birth–death
 *   b. 1950      explicit birth
 *   d. 2020      death only
 *
 * Indentation: use 2 or 4 spaces, or tabs — be consistent.
 * The " + " separator (with spaces) connects partners on the same line.
 */

let _idCounter = 0;
function makeId() {
  return `node-${++_idCounter}`;
}

function parsePerson(raw) {
  const text = raw.trim();
  if (!text) return null;
  const m = text.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) return { name: m[1].trim(), dates: m[2].trim() };
  return { name: text, dates: null };
}

/**
 * Split a content string on " + " while ignoring occurrences inside parentheses.
 */
function splitOnPlus(content) {
  const parts = [];
  let depth = 0;
  let cur = '';
  for (let i = 0; i < content.length; i++) {
    const ch = content[i];
    if (ch === '(') { depth++; cur += ch; }
    else if (ch === ')') { depth--; cur += ch; }
    else if (depth === 0 && content.slice(i, i + 3) === ' + ') {
      parts.push(cur);
      cur = '';
      i += 2;
    } else {
      cur += ch;
    }
  }
  parts.push(cur);
  return parts;
}

function getIndent(line) {
  const m = line.match(/^(\s*)/);
  const raw = m ? m[1] : '';
  // Normalise tabs to 2 spaces for consistent indent level detection
  return raw.replace(/\t/g, '  ').length;
}

function parseLine(line) {
  const indent = getIndent(line);
  const content = line.trim();

  if (!content) return null;

  const isComment = content.startsWith('#');
  if (isComment) {
    return {
      id: makeId(),
      indent,
      isComment: true,
      label: content.slice(1).trim(),
      person1: null,
      person2: null,
      children: [],
    };
  }

  const parts = splitOnPlus(content);
  const person1 = parsePerson(parts[0]);
  const person2 = parts.length > 1 ? parsePerson(parts.slice(1).join(' + ')) : null;

  return {
    id: makeId(),
    indent,
    isComment: false,
    label: null,
    person1,
    person2,
    children: [],
  };
}

export function parseTree(text) {
  _idCounter = 0;
  const rawLines = text.split('\n');
  const nodes = rawLines
    .map(parseLine)
    .filter(Boolean);

  const roots = [];
  // Stack entries: { indent, node }
  const stack = [];

  for (const node of nodes) {
    // Pop until we find a node that could be the parent
    while (stack.length > 0 && stack[stack.length - 1].indent >= node.indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }

    stack.push({ indent: node.indent, node });
  }

  return roots;
}
