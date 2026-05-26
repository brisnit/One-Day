import { Suspense } from "react";
import ShareContent from "./ShareContent";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-ink/40">Loading…</div>}>
      <ShareContent />
    </Suspense>
  );
}
