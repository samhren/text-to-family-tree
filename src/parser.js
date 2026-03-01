/**
 * Greek Life Family Tree — Syntax
 *
 * One person per line. Use  big: Name  to connect someone to their Big.
 * For co-bigs (two Bigs sharing one Little), separate names with a comma.
 *
 *   Jessica                                ← Grand Big, no Big listed
 *   Megan  big: Jessica                    ← Megan's Big is Jessica
 *   Taylor  big: Jessica                   ← also Jessica's Little (twins with Megan)
 *   Avery  big: Megan, Taylor              ← co-bigs: Megan AND Taylor
 *
 * Add a pledge class in parentheses:
 *   Jessica (Fall 2019)
 *   Megan (Spring 2021)  big: Jessica
 *
 * Section labels start with #:
 *   # Alpha Phi — Smith Family
 */

let _uid = 0;
const uid = () => `n${++_uid}`;

function parsePerson(raw) {
  const s = raw.trim();
  if (!s) return null;
  const m = s.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (m) return { name: m[1].trim(), dates: m[2].trim() };
  return { name: s, dates: null };
}

function parseLine(line) {
  const content = line.trim();
  if (!content) return null;

  if (content.startsWith('#')) {
    return { id: uid(), bigNames: [], isComment: true, label: content.slice(1).trim(), person: null, children: [] };
  }

  let bigNames = [];
  let rest = content;
  const bigMatch = content.match(/\s+big:\s*(.+)$/i);
  if (bigMatch) {
    bigNames = bigMatch[1].split(',').map((s) => s.trim()).filter(Boolean);
    rest = content.slice(0, content.length - bigMatch[0].length).trim();
  }

  const person = parsePerson(rest);
  if (!person) return null;

  return { id: uid(), bigNames, isComment: false, label: null, person, children: [] };
}

export function parseTree(text) {
  _uid = 0;
  const nodes = text.split('\n').map(parseLine).filter(Boolean);

  const byName = new Map();
  for (const node of nodes) {
    if (!node.isComment && node.person) {
      byName.set(node.person.name.toLowerCase(), node);
    }
  }

  // extraConnections: secondary Big→Little lines to draw as SVG overlays
  const extraConnections = [];

  const roots = [];
  for (const node of nodes) {
    if (node.bigNames.length === 0) {
      roots.push(node);
    } else {
      // First Big = primary tree parent (CSS lines)
      const primary = byName.get(node.bigNames[0].toLowerCase());
      if (primary) {
        primary.children.push(node);
      } else {
        roots.push(node);
      }
      // Remaining Bigs = extra SVG lines
      for (let i = 1; i < node.bigNames.length; i++) {
        const extra = byName.get(node.bigNames[i].toLowerCase());
        if (extra) {
          extraConnections.push({ bigId: extra.id, littleId: node.id });
        }
      }
    }
  }

  // Restructure co-big relationships: find the lowest common ancestor (LCA) of all
  // of a little's bigs and attach the little under the LCA so it renders below the
  // full subtree, with solid SVG lines converging from each big downward.
  const parentMap = new Map();
  function buildParentMap(nd) {
    for (const child of nd.children) {
      parentMap.set(child.id, nd);
      buildParentMap(child);
    }
  }
  for (const root of roots) buildParentMap(root);

  // Returns the deepest common ancestor node of a and b, or null if different trees.
  function findLCA(a, b) {
    const ancestors = new Set();
    let cur = a;
    while (cur) {
      ancestors.add(cur.id);
      cur = parentMap.get(cur.id) || null;
    }
    let c = b;
    while (c) {
      if (ancestors.has(c.id)) return c;
      c = parentMap.get(c.id) || null;
    }
    return null;
  }

  for (const node of nodes) {
    if (node.bigNames.length < 2) continue;
    const allBigs = node.bigNames.map((n) => byName.get(n.toLowerCase())).filter(Boolean);
    if (allBigs.length < 2) continue;

    // Remove all existing dashed extra-connections for this little
    for (let i = 1; i < allBigs.length; i++) {
      const idx = extraConnections.findIndex((e) => e.bigId === allBigs[i].id && e.littleId === node.id);
      if (idx !== -1) extraConnections.splice(idx, 1);
    }

    // Find LCA of all bigs
    let lca = allBigs[0];
    for (let i = 1; i < allBigs.length; i++) {
      lca = findLCA(lca, allBigs[i]);
      if (!lca) break;
    }

    if (lca && !allBigs.includes(lca)) {
      // Pull the little out of big0's children and attach to the LCA.
      // It will render in a cobig-littles-row below the LCA's full children subtree,
      // with SVG lines going downward from each big to the little.
      allBigs[0].children = allBigs[0].children.filter((c) => c.id !== node.id);
      if (!lca.cobigLittles) lca.cobigLittles = [];
      lca.cobigLittles.push(node);
      for (const big of allBigs) {
        extraConnections.push({ bigId: big.id, littleId: node.id });
      }
    } else {
      // No common ancestor (bigs in separate root trees) — keep under big0,
      // just add solid connections for the remaining bigs.
      for (let i = 1; i < allBigs.length; i++) {
        extraConnections.push({ bigId: allBigs[i].id, littleId: node.id });
      }
    }
  }

  return { roots, extraConnections };
}
