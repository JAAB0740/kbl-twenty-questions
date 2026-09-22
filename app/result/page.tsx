import { Suspense } from "react";
import ResultView from "@/components/ResultView";

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <main className="app-shell pt-16">
          <p className="text-center text-[15px] text-court-muted">
            궁합 계산 중...
          </p>
        </main>
      }
    >
      <ResultView />
    </Suspense>
  );
}
