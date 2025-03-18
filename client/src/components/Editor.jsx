import { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import "./Editor.css";

export default function CodeEditor({ visible, onClose, onAIOptimize }) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0 });
  const editorRef = useRef(null);
  const tooltipRef = useRef(null);

  const languages = ["javascript", "python", "java", "cpp", "go", "rust"];

  const handleEditorChange = (value) => {
    setCode(value);
  };
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection();

      if (selection && !selection.isEmpty()) {
        const { startLineNumber, startColumn } = selection;
        const position = editor.getScrolledVisiblePosition({
          lineNumber: startLineNumber,
          column: startColumn,
        });
        if (position) {
          const editorContainer = editor.getContainerDomNode();
          const rect = editorContainer.getBoundingClientRect();
          setTooltip({
            visible: true,
            x: position.left,
            y: rect.top + position.top - 30,
          });
        }
      } else {
        setTooltip({ ...tooltip, visible: false });
      }
    });
  };

  const handleAIOptimize = async () => {
    if (!editorRef.current) return;
    const selection = editorRef.current.getSelection();
    const selectedText = editorRef.current
      .getModel()
      .getValueInRange(selection);
    if (selectedText) {
      setTooltip({ ...tooltip, visible: false });
      const message = `请帮我优化以下${language}代码：\n\n${selectedText}`;
      if (onAIOptimize) {
        await onAIOptimize(message, selectedText, language);
      }
    }
  };

  const editorOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    lineNumbers: "on",
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
  };

  return (
    <div className={`editor-container ${visible ? "visible" : "hide"}`}>
      <div className="editor-header">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="language-selector"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>
      <div className="editor-content">
        <Editor
          height="100%"
          defaultLanguage={language}
          language={language}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={editorOptions}
          onMount={handleEditorDidMount}
        />
        {tooltip.visible && (
          <div
            ref={tooltipRef}
            className="ai-tooltip"
            style={{
              left: tooltip.x + "px",
              top: tooltip.y + "px",
            }}
            onClick={handleAIOptimize}
          >
            AI优化
          </div>
        )}
      </div>
    </div>
  );
}
