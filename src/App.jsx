import { useState, useMemo, useEffect } from 'react';
import { parseTree } from './parser.js';
import { Editor } from './components/Editor.jsx';
import { FamilyTree } from './components/FamilyTree.jsx';
import './App.css';

const EXAMPLE = `# Kappa Delta — Fall 2024 Chapter Families

# The Johnson Family 
Madison (Spring 2015)
Olivia (Fall 2016)  big: Madison
Chloe (Fall 2016)  big: Madison
Sophia (Spring 2018)  big: Olivia
Emma (Spring 2018)  big: Chloe
Ava (Fall 2019)  big: Sophia
Isabella (Fall 2019)  big: Emma
Mia (Spring 2021)  big: Ava
Charlotte (Spring 2021)  big: Isabella
Harper (Fall 2022)  big: Mia, Charlotte
Luna (Spring 2024)  big: Harper
`;

function encode(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function decode(encoded) {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

function loadFromUrl() {
  const hash = window.location.hash.slice(1);
  if (!hash) return null;
  return decode(hash);
}

const PANELS = ['editor', 'tree'];

export default function App() {
  const [code, setCode] = useState(() => loadFromUrl() ?? EXAMPLE);
  const [activePanel, setActivePanel] = useState('tree');

  // Persist to URL on change (debounced)
  useEffect(() => {
    const id = setTimeout(() => {
      window.history.replaceState(null, '', '#' + encode(code));
    }, 400);
    return () => clearTimeout(id);
  }, [code]);

  const { roots, extraConnections } = useMemo(() => {
    try {
      return parseTree(code);
    } catch {
      return { roots: [], extraConnections: [] };
    }
  }, [code]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-left">
          <div className="app-logo" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="6.5" stroke="var(--accent)" strokeWidth="1.8" />
              <line x1="11" y1="2" x2="11" y2="20" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="app-title">Big/Little Family Tree</h1>
        </div>

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
                  Edit
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

      <main className="app-main">
        <div className={`pane pane-editor ${activePanel === 'editor' ? 'pane--active' : ''}`}>
          <Editor value={code} onChange={setCode} />
        </div>

        <div className="pane-divider" />

        <div className={`pane pane-tree ${activePanel === 'tree' ? 'pane--active' : ''}`}>
          <div className="tree-scroll">
            <FamilyTree roots={roots} extraConnections={extraConnections} />
          </div>
        </div>
      </main>
    </div>
  );
}
