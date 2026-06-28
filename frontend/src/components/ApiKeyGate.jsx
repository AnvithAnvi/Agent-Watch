import { useState } from "react";
import { setApiKey, hasApiKey } from "../api/client";

export default function ApiKeyGate({ children }) {
  const [ready, setReady] = useState(hasApiKey);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const key = input.trim();
    if (!key.startsWith("aw_")) {
      setError("API key must start with aw_");
      return;
    }
    setApiKey(key);
    setReady(true);
  }

  if (ready) return children;

  return (
    <div className="gate-overlay">
      <div className="gate-card">
        <h2>AgentWatch</h2>
        <p>Enter your project API key to continue.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="aw_..."
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(""); }}
            className="gate-input"
            autoFocus
          />
          {error && <p className="gate-error">{error}</p>}
          <button type="submit" className="gate-btn">Connect</button>
        </form>
        <p className="gate-hint">
          Create a project via <code>POST /projects/</code> to get an API key.
        </p>
      </div>
    </div>
  );
}
