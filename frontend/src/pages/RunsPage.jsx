import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRuns, deleteRun, clearApiKey } from "../api/client";

const PAGE_SIZE = 50;

export default function RunsPage() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [deleting, setDeleting] = useState(null);

  async function loadRuns(newSkip = 0) {
    try {
      setLoading(true);
      setError("");
      const data = await getRuns(newSkip, PAGE_SIZE);
      setRuns(data);
      setSkip(newSkip);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        clearApiKey();
        window.location.reload();
      } else {
        setError("Failed to load runs. Is the backend running?");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(runId) {
    if (!confirm("Delete this run and all its spans?")) return;
    setDeleting(runId);
    try {
      await deleteRun(runId);
      setRuns((prev) => prev.filter((r) => r.id !== runId));
    } catch {
      alert("Failed to delete run.");
    } finally {
      setDeleting(null);
    }
  }

  useEffect(() => { loadRuns(); }, []);

  const runsWithLatency = runs.filter((r) => r.latency_ms != null);
  const avgLatency = runsWithLatency.length
    ? runsWithLatency.reduce((s, r) => s + r.latency_ms, 0) / runsWithLatency.length
    : null;

  const passedRuns  = runs.filter((r) => r.latest_evaluation_label === "pass"    || (!r.latest_evaluation_label && r.status === "success")).length;
  const warningRuns = runs.filter((r) => r.latest_evaluation_label === "warning").length;
  const failedRuns  = runs.filter((r) => r.latest_evaluation_label === "fail"    || (!r.latest_evaluation_label && r.status === "error")).length;

  return (
    <div className="page">
      <div className="header">
        <div>
          <h1>AgentWatch</h1>
          <p>Monitor AI agent runs, tool calls, latency, and failures.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => loadRuns(skip)} disabled={loading}>Refresh</button>
          <button onClick={() => { clearApiKey(); window.location.reload(); }} className="btn-secondary">
            Sign out
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="summary-grid">
        <div className="metric-card">
          <span>Showing</span>
          <strong>{runs.length}</strong>
        </div>
        <div className="metric-card">
          <span>Passed</span>
          <strong style={{ color: "#16a34a" }}>{passedRuns}</strong>
        </div>
        <div className="metric-card">
          <span>Warnings</span>
          <strong style={{ color: "#d97706" }}>{warningRuns}</strong>
        </div>
        <div className="metric-card">
          <span>Failed</span>
          <strong style={{ color: "#dc2626" }}>{failedRuns}</strong>
        </div>
        <div className="metric-card">
          <span>Avg Latency</span>
          <strong>{avgLatency != null ? `${Math.round(avgLatency)} ms` : "-"}</strong>
        </div>
      </div>

      <div className="card">
        <h2>Agent Runs</h2>

        {loading ? (
          <p>Loading...</p>
        ) : runs.length === 0 ? (
          <p>No runs yet. Instrument your agent with the AgentWatch SDK and run it.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Run</th>
                  <th>Status</th>
                  <th>Evaluation</th>
                  <th>Model</th>
                  <th>Latency</th>
                  <th>Cost</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td><Link to={`/runs/${run.id}`}>{run.run_name}</Link></td>
                    <td>
                      <span className={`status ${run.status}`}>{run.status}</span>
                    </td>
                    <td>
                      {run.latest_evaluation_label ? (
                        <span className={`status ${run.latest_evaluation_label}`}>
                          {run.latest_evaluation_label.toUpperCase()} {run.latest_evaluation_score}
                        </span>
                      ) : (
                        <span className="status running">pending</span>
                      )}
                    </td>
                    <td>{run.model || "-"}</td>
                    <td>{run.latency_ms != null ? `${run.latency_ms} ms` : "-"}</td>
                    <td>{run.cost_usd || "-"}</td>
                    <td>{new Date(run.created_at).toLocaleString()}</td>
                    <td>
                      <button
                        className="btn-danger-sm"
                        onClick={() => handleDelete(run.id)}
                        disabled={deleting === run.id}
                      >
                        {deleting === run.id ? "…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              <button onClick={() => loadRuns(Math.max(0, skip - PAGE_SIZE))} disabled={skip === 0 || loading}>
                ← Prev
              </button>
              <span>Page {Math.floor(skip / PAGE_SIZE) + 1}</span>
              <button onClick={() => loadRuns(skip + PAGE_SIZE)} disabled={!hasMore || loading}>
                Next →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
