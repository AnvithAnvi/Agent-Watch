import { useState } from "react";

const TYPE_COLORS = {
  tool_call: "#2563eb",
  llm_call: "#7c3aed",
  http: "#0891b2",
  error: "#dc2626",
};

export default function SpanCard({ span, index }) {
  const [expanded, setExpanded] = useState(false);
  const isError = span.status === "error";
  const color = TYPE_COLORS[span.span_type] || "#6b7280";

  let inputParsed = null;
  let outputParsed = null;
  try { inputParsed = span.input_json ? JSON.parse(span.input_json) : null; } catch {}
  try { outputParsed = span.output_json ? JSON.parse(span.output_json) : null; } catch {}

  return (
    <div className={`span-card ${isError ? "span-error" : ""}`}>
      <div className="span-header" onClick={() => setExpanded((v) => !v)} style={{ cursor: "pointer" }}>
        <div className="span-index">{index + 1}</div>
        <div className="span-info">
          <strong>{span.name}</strong>
          <div className="span-meta">
            <span className="badge" style={{ background: color, color: "#fff" }}>
              {span.span_type}
            </span>
            <span className={`status ${span.status}`}>{span.status}</span>
            {span.latency_ms != null && (
              <span className="latency">{span.latency_ms} ms</span>
            )}
          </div>
        </div>
        <div className="span-toggle">{expanded ? "▲" : "▼"}</div>
      </div>

      {expanded && (
        <div className="span-body">
          {span.error_message && (
            <div className="error-box">{span.error_message}</div>
          )}
          {inputParsed != null && (
            <div className="span-section">
              <div className="span-section-label">Input</div>
              <pre className="span-json">{JSON.stringify(inputParsed, null, 2)}</pre>
            </div>
          )}
          {outputParsed != null && (
            <div className="span-section">
              <div className="span-section-label">Output</div>
              <pre className="span-json">{JSON.stringify(outputParsed, null, 2)}</pre>
            </div>
          )}
          {inputParsed == null && outputParsed == null && !span.error_message && (
            <p style={{ color: "#9ca3af", margin: 0 }}>No input/output recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}
