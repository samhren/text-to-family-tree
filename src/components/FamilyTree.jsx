import React, { useRef, useEffect, useState } from 'react';
import './FamilyTree.css';

function MemberCard({ node }) {
  const { person } = node;
  return (
    <div className="person-card">
      <span className="person-name">{person.name}</span>
      {person.dates && <span className="person-dates">{person.dates}</span>}
    </div>
  );
}

function CommentNode({ label }) {
  return <div className="comment-node">{label}</div>;
}

function TreeNode({ node }) {
  const hasChildren = node.children && node.children.length > 0;
  const hasCobigLittles = node.cobigLittles && node.cobigLittles.length > 0;

  if (node.isComment) {
    return (
      <div className="tree-node" data-nodeid={node.id}>
        <CommentNode label={node.label} />
        {hasChildren && (
          <div className="children-area">
            <div className="children-row">
              {node.children.map((child) => (
                <div key={child.id} className="child-col">
                  <TreeNode node={child} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tree-node" data-nodeid={node.id}>
      <MemberCard node={node} />
      {(hasChildren || hasCobigLittles) && (
        <div className="children-area">
          {hasChildren && (
            <div className="children-row">
              {node.children.map((child) => (
                <div key={child.id} className="child-col">
                  <TreeNode node={child} />
                </div>
              ))}
            </div>
          )}
          {hasCobigLittles && (
            <div className="cobig-littles-row">
              {node.cobigLittles.map((little) => (
                <div key={little.id} className="cobig-little-col">
                  <TreeNode node={little} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function FamilyTree({ roots, extraConnections = [] }) {
  const treeRef = useRef(null);
  const [svgLines, setSvgLines] = useState([]);

  useEffect(() => {
    if (!treeRef.current || extraConnections.length === 0) {
      setSvgLines([]);
      return;
    }

    function computeLines() {
      const el = treeRef.current;
      if (!el) return;
      const elRect = el.getBoundingClientRect();
      const lines = [];

      for (const { bigId, littleId, solid } of extraConnections) {
        const bigNode = el.querySelector(`[data-nodeid="${bigId}"]`);
        const littleNode = el.querySelector(`[data-nodeid="${littleId}"]`);
        if (!bigNode || !littleNode) continue;

        // Target the direct .person-card child only (not nested cards)
        const bigCard = bigNode.querySelector(':scope > .person-card');
        const littleCard = littleNode.querySelector(':scope > .person-card');
        if (!bigCard || !littleCard) continue;

        const bR = bigCard.getBoundingClientRect();
        const lR = littleCard.getBoundingClientRect();

        lines.push({
          x1: bR.left + bR.width / 2 - elRect.left,
          y1: bR.bottom - elRect.top,
          x2: lR.left + lR.width / 2 - elRect.left,
          y2: lR.top - elRect.top,
          solid: !!solid,
        });
      }

      setSvgLines(lines);
    }

    computeLines();
    const ro = new ResizeObserver(computeLines);
    ro.observe(treeRef.current);
    return () => ro.disconnect();
  }, [roots, extraConnections]);

  if (!roots || roots.length === 0) {
    return (
      <div className="tree-empty">
        <div className="tree-empty-icon" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
            <circle cx="10" cy="36" r="5" stroke="currentColor" strokeWidth="2" />
            <circle cx="38" cy="36" r="5" stroke="currentColor" strokeWidth="2" />
            <path d="M24 18v6M24 24l-14 8M24 24l14 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <p className="tree-empty-title">Your family tree will appear here</p>
        <p className="tree-empty-hint">Add members in the editor — one per line</p>
      </div>
    );
  }

  return (
    <div className="family-tree" ref={treeRef}>
      {/* SVG overlay for co-big connections */}
      {svgLines.length > 0 && (
        <svg className="cobig-svg" aria-hidden="true">
          {svgLines.map((l, i) => (
            <path
              key={i}
              d={`M ${l.x1} ${l.y1} C ${l.x1} ${(l.y1 + l.y2) / 2}, ${l.x2} ${(l.y1 + l.y2) / 2}, ${l.x2} ${l.y2}`}
              stroke="var(--line-color)"
              strokeWidth="1.5"
              fill="none"
            />
          ))}
        </svg>
      )}

      {roots.map((root, i) => (
        <React.Fragment key={root.id}>
          {i > 0 && <div className="tree-separator" />}
          <TreeNode node={root} />
        </React.Fragment>
      ))}
    </div>
  );
}
