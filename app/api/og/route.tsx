import { ImageResponse } from "next/og";
import { decodeAnswers } from "@/lib/answers";
import { buildResult } from "@/lib/scoring";
import { TEAMS } from "@/data/teams";

export const runtime = "edge";

const WIDTH = 1200;
const HEIGHT = 630;

const FONT_BASE =
  "https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/public/static/alternative";

async function loadFont(file: string) {
  const res = await fetch(`${FONT_BASE}/${file}`, {
    next: { revalidate: 60 * 60 * 24 * 30 },
  });
  return res.arrayBuffer();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const encoded = searchParams.get("a");
  const decoded = decodeAnswers(encoded);

  const [regular, bold, extraBold] = await Promise.all([
    loadFont("Pretendard-Regular.ttf"),
    loadFont("Pretendard-Bold.ttf"),
    loadFont("Pretendard-ExtraBold.ttf"),
  ]);

  const fonts = [
    { name: "Pretendard", data: regular, weight: 500 as const, style: "normal" as const },
    { name: "Pretendard", data: bold, weight: 700 as const, style: "normal" as const },
    { name: "Pretendard", data: extraBold, weight: 800 as const, style: "normal" as const },
  ];

  if (decoded) {
    const result = buildResult(decoded.answers, decoded.locationWeight, decoded.region);
    const top = result.ranking[0];
    const team = top.team;

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px",
            backgroundColor: "#0b0d12",
            backgroundImage: `linear-gradient(155deg, ${team.color2} 0%, #0b0d12 62%), radial-gradient(55% 50% at 100% 0%, ${team.color}55, transparent 70%)`,
            fontFamily: "Pretendard",
            color: "#f2f4f8",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                display: "flex",
                width: 12,
                height: 12,
                borderRadius: 999,
                backgroundColor: team.color,
              }}
            />
            <span style={{ fontSize: 24, fontWeight: 600, color: "#a9b0c0", letterSpacing: 1 }}>
              KBL 스무고개 결과
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            <span style={{ fontSize: 30, fontWeight: 600, color: "#d8dce6" }}>
              당신과 가장 잘 맞는 팀은
            </span>
            <span style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.2 }}>{team.name}</span>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "10px 24px",
                borderRadius: 999,
                backgroundColor: team.color,
                fontSize: 28,
                fontWeight: 800,
                color: "#0b0d12",
              }}
            >
              농구 궁합 {top.percent}%
            </div>
            <span
              style={{
                fontSize: 30,
                fontWeight: 500,
                color: "#c7cbd6",
                maxWidth: 920,
                lineHeight: 1.5,
              }}
            >
              {team.oneLiner}
            </span>
          </div>

          <span style={{ fontSize: 22, fontWeight: 600, color: "#7d8496" }}>KBL 스무고개</span>
        </div>
      ),
      { width: WIDTH, height: HEIGHT, fonts, headers: { "Cache-Control": "public, max-age=31536000, immutable" } },
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          backgroundColor: "#0b0d12",
          backgroundImage:
            "radial-gradient(60% 45% at 50% -10%, rgba(255,92,43,0.35), transparent 70%), radial-gradient(50% 40% at 100% 0%, rgba(255,201,60,0.18), transparent 70%)",
          fontFamily: "Pretendard",
          color: "#f2f4f8",
        }}
      >
        <span style={{ fontSize: 24, fontWeight: 600, color: "#a9b0c0", letterSpacing: 1 }}>
          KBL 스무고개
        </span>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.25 }}>나에게 맞는</span>
          <span style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.25 }}>KBL 팀 찾기</span>
          <span
            style={{
              marginTop: 20,
              fontSize: 32,
              fontWeight: 500,
              color: "#c7cbd6",
              maxWidth: 880,
            }}
          >
            질문 15개에 답하면 가장 잘 맞는 KBL 팀을 찾아드립니다.
          </span>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          {TEAMS.map((team) => (
            <div
              key={team.id}
              style={{
                display: "flex",
                width: 22,
                height: 22,
                borderRadius: 999,
                backgroundColor: team.color,
              }}
            />
          ))}
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT, fonts, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}
