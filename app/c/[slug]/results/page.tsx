import { Suspense } from "react";
import ResultsContent from "./ResultsContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-ink/40">Loading…</div>}>
      <ResultsContent />
    </Suspense>
  );
}
