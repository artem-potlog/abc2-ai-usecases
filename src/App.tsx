import { Link, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import UseCasePage from "./pages/UseCasePage";

export default function App() {
  return (
    <div className="min-h-full bg-bg text-text">
      <header className="border-b border-border bg-panel/60 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 grid place-items-center font-bold text-white text-sm">
              A
            </div>
            <div className="leading-tight">
              <div className="font-semibold text-white tracking-tight">
                Company ABC · AI Workflow Simulations
              </div>
              <div className="text-xs text-muted">Public preview</div>
            </div>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/uc/:id" element={<UseCasePage />} />
        </Routes>
      </main>

      <footer className="border-t border-border-soft mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-xs text-muted">
          Selected use cases are open to explore. The full set is available on request.
        </div>
      </footer>
    </div>
  );
}
