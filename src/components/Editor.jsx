import { useRef, useCallback, useState } from 'react';
import './Editor.css';

const SYNTAX_HELP = [
  { code: 'Alice (1950)',                            desc: 'Person with birth year' },
  { code: 'Alice (1950-2020)',                       desc: 'Birth and death year' },
  { code: 'Alice (1950) + Bob (1948)',               desc: 'Couple — use " + "' },
  { code: '  Child (1975)',                          desc: 'Child — indent 2 spaces' },
  { code: '    Grandchild (2000)',                   desc: 'Grandchild — indent 4 spaces' },
  { code: '# The Smith Family',                     desc: 'Section label (starts with #)' },
];

export function Editor({ value, onChange }) {
  const textareaRef = useRef(null);
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyDown = useCallback((e) => {
    // Allow Tab to insert spaces instead of losing focus
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.slice(0, start) + '  ' + value.slice(end);
      onChange(newVal);
      // Restore cursor after React re-render
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  }, [value, onChange]);

  const handleClear = () => {
    if (window.confirm('Clear the editor? This cannot be undone.')) {
      onChange('');
    }
  };

  const lineCount = value ? value.split('\n').length : 0;

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <span className="editor-label">Tree Code</span>
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
            Syntax
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
          <p className="help-title">Syntax Reference</p>
          <div className="help-table">
            {SYNTAX_HELP.map(({ code, desc }) => (
              <div key={code} className="help-row">
                <code className="help-code">{code}</code>
                <span className="help-desc">{desc}</span>
              </div>
            ))}
          </div>
          <p className="help-note">
            Indent children under their parents using 2 or 4 spaces.
            Partners on the same line are joined with&nbsp;<code> + </code>.
          </p>
        </div>
      )}

      <textarea
        ref={textareaRef}
        className="editor-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        autoComplete="off"
        placeholder={`# My Family\nAlice (1950) + Bob (1948)\n  Carol (1975)\n  David (1977) + Eve (1978)\n    Frank (2005)\n    Grace (2008)`}
      />
    </div>
  );
}
