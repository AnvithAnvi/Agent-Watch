import { BrowserRouter, Routes, Route } from "react-router-dom";
import RunsPage from "./pages/RunsPage";
import RunDetailPage from "./pages/RunDetailPage";
import ApiKeyGate from "./components/ApiKeyGate";
import "./App.css";

export default function App() {
  return (
    <ApiKeyGate>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunsPage />} />
          <Route path="/runs/:runId" element={<RunDetailPage />} />
        </Routes>
      </BrowserRouter>
    </ApiKeyGate>
  );
}