import type { Metadata } from "next";
import { Suspense } from "react";
import ResultView from "@/components/ResultView";
import { decodeAnswers } from "@/lib/answers";
import { buildResult } from "@/lib/scoring";

type Props = {
  searchParams: Promise<{ a?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const raw = (await searchParams).a;
  const encoded = Array.isArray(raw) ? raw[0] : raw;
  const decoded = decodeAnswers(encoded);

  if (!decoded) {
    return { title: "KBL 스무고개 - 결과" };
  }

  const result = buildResult(decoded.answers, decoded.locationWeight, decoded.region);
  const top = result.ranking[0];
  const title = `나는 ${top.team.shortName} 팬 체질 (궁합 ${top.percent}%) - KBL 스무고개`;
  const description = top.team.oneLiner;
  const image = `/api/og?a=${encodeURIComponent(encoded ?? "")}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

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
