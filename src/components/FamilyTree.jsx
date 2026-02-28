import React from 'react';
import './FamilyTree.css';

function PersonCard({ person, variant }) {
  if (!person) return null;
  const cls = ['person-card', variant && `person-card--${variant}`].filter(Boolean).join(' ');
  return (
    <div className={cls}>
      <span className="person-name">{person.name}</span>
      {person.dates && <span className="person-dates">{person.dates}</span>}
    </div>
  );
}

function NodeCard({ node }) {
  return (
    <div className="node-card">
      <PersonCard person={node.person1} variant="primary" />
      {node.person2 && (
        <>
          <div className="couple-connector" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 15s-6-4.35-6-7.5a3.5 3.5 0 0 1 6-2.45A3.5 3.5 0 0 1 16 7.5c0 3.15-6 7.5-6 7.5z"
                fill="#e879f9"
                opacity="0.7"
              />
            </svg>
          </div>
          <PersonCard person={node.person2} variant="partner" />
        </>
      )}
    </div>
  );
}

function CommentNode({ label }) {
  return <div className="comment-node">{label}</div>;
}

function TreeNode({ node, depth = 0 }) {
  const hasChildren = node.children && node.children.length > 0;

  if (node.isComment) {
    return (
      <div className="tree-node">
        <CommentNode label={node.label} />
        {hasChildren && (
          <div className="children-area">
            <div className="children-row">
              {node.children.map((child) => (
                <div key={child.id} className="child-col">
                  <TreeNode node={child} depth={depth + 1} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="tree-node">
      <NodeCard node={node} />
      {hasChildren && (
        <div className="children-area">
          <div className="children-row">
            {node.children.map((child) => (
              <div key={child.id} className="child-col">
                <TreeNode node={child} depth={depth + 1} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function FamilyTree({ roots }) {
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
        <p className="tree-empty-title">Your tree will appear here</p>
        <p className="tree-empty-hint">Start typing in the editor on the left</p>
      </div>
    );
  }

  return (
    <div className="family-tree">
      {roots.map((root, i) => (
        <React.Fragment key={root.id}>
          {i > 0 && <div className="tree-separator" />}
          <TreeNode node={root} depth={0} />
        </React.Fragment>
      ))}
    </div>
  );
}
