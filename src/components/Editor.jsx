import { useRef, useState } from 'react';
import './Editor.css';

const SYNTAX_HELP = [
  { code: 'Jessica',                              desc: 'Grand Big — no Big listed' },
  { code: 'Megan  big: Jessica',                  desc: "Megan's Big is Jessica" },
  { code: 'Taylor  big: Jessica',                 desc: 'Twin — also Jessica\'s Little' },
  { code: 'Avery  big: Megan, Taylor',            desc: 'Co-bigs: two Bigs, one Little' },
  { code: 'Jessica (Fall 2019)',                  desc: 'Add pledge class in ( )' },
  { code: '# Alpha Phi — Smith Family',           desc: 'Section label — starts with #' },
];

export function Editor({ value, onChange }) {
  const textareaRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleClear = () => {
    if (window.confirm('Clear the editor? This cannot be undone.')) {
      onChange('');
    }
  };

  const lineCount = value ? value.split('\n').length : 0;

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <span className="editor-label">Family</span>
        <div className="editor-toolbar-right">
          <span className="editor-meta">{lineCount} {lineCount === 1 ? 'line' : 'lines'}</span>
          <button
            className={`toolbar-btn ${showHelp ? 'toolbar-btn--active' : ''}`}
            onClick={() => setShowHelp((v) => !v)}
            title="Toggle syntax reference"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M7.5 5v.01M7.5 7v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            How to write it
          </button>
          <button
            className="toolbar-btn toolbar-btn--danger"
            onClick={handleClear}
            title="Clear editor"
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M3 3l9 9M12 3l-9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Clear
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="editor-help">
          <p className="help-title">How it works</p>
          <div className="help-table">
            {SYNTAX_HELP.map(({ code, desc }) => (
              <div key={code} className="help-row">
                <code className="help-code">{code}</code>
                <span className="help-desc">{desc}</span>
              </div>
            ))}
          </div>
          <p className="help-note">
            One person per line. Add&nbsp;<code>big: Name</code>&nbsp;at the end to connect to their Big.
            For co-bigs, separate names with a comma:&nbsp;<code>big: Megan, Taylor</code>.
            No indenting — just names.
          </p>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        placeholder={`# My Sorority Family\nJessica (Fall 2019)\nMegan (Spring 2021)  big: Jessica\nAvery (Fall 2022)  big: Megan`}
      />
    </div>
  );
}
