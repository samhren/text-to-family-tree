import { useState, useMemo } from 'react';
import { parseTree } from './parser.js';
import { Editor } from './components/Editor.jsx';
import { FamilyTree } from './components/FamilyTree.jsx';
import './App.css';

const EXAMPLE = `# The Harrison Family

William Harrison (1918-1994) + Dorothy Mills (1922-2009)
  Robert Harrison (1945) + Linda Chen (1948)
    Sophie Harrison (1972) + Marcus Webb (1970)
      Lily Webb (2001)
      James Webb (2004)
    Daniel Harrison (1975)
  Carol Harrison (1948) + Frank Murphy (1945-2018)
    Amy Murphy (1970) + Sean Doyle (1968)
      Mia Doyle (2000)
      Noah Doyle (2003)
    Brian Murphy (1973) + Kate Novak (1975)
      Zoe Murphy (2008)
      Luke Murphy (2011)
`;

// Panel names for the mobile tab toggle
const PANELS = ['editor', 'tree'];

export default function App() {
  const [code, setCode] = useState(EXAMPLE);
  const [activePanel, setActivePanel] = useState('tree');

  const roots = useMemo(() => {
    try {
      return parseTree(code);
    } catch {
      return [];
    }
  }, [code]);

  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="4" r="3" fill="var(--accent)" />
              <circle cx="4" cy="17" r="3" fill="var(--accent)" opacity="0.6" />
              <circle cx="18" cy="17" r="3" fill="var(--accent)" opacity="0.6" />
              <path d="M11 7v5M11 12l-7 5M11 12l7 5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="app-title">Family Tree Builder</h1>
        </div>
        {/* Mobile tab toggle */}
        <div className="tab-toggle" role="tablist">
          {PANELS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={activePanel === p}
              className={`tab-btn ${activePanel === p ? 'tab-btn--active' : ''}`}
              onClick={() => setActivePanel(p)}
            >
              {p === 'editor' ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M1 3h11M1 6.5h7M1 10h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Code
                </>
              ) : (
                <>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="2.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="2.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="10.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M6.5 4v3M6.5 7l-4 2M6.5 7l4 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Tree
                </>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* ── Main two-pane layout ── */}
      <main className="app-main">
        <div className={`pane pane-editor ${activePanel === 'editor' ? 'pane--active' : ''}`}>
          <Editor value={code} onChange={setCode} />
        </div>

        <div className="pane-divider" />

        <div className={`pane pane-tree ${activePanel === 'tree' ? 'pane--active' : ''}`}>
          <div className="tree-scroll">
            <FamilyTree roots={roots} />
          </div>
        </div>
      </main>
    </div>
  );
}
