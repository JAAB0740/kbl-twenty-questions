import { TRAIT_BARS } from "@/lib/scoring";
import type { Team, Traits } from "@/lib/types";

const WIDTH = 1080;
const HEIGHT = 1920;
const FONT = "Pretendard, 'Malgun Gothic', 'Apple SD Gothic Neo', sans-serif";

type ShareInput = {
  team: Team;
  percent: number;
  traits: Traits;
  hiddenTitle?: string | null;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let current = "";

  for (const char of text) {
    const candidate = current + char;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current.trim());
      current = char === " " ? "" : char;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) lines.push(current.trim());
  return lines;
}

function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  startSize: number,
  weight = "800",
): number {
  let size = startSize;
  while (size > 32) {
    ctx.font = `${weight} ${size}px ${FONT}`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 4;
  }
  return size;
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

/** SPEC 11장: 세로형 1080x1920 공유 이미지 생성. */
export async function renderShareImage({
  team,
  percent,
  traits,
  hiddenTitle,
}: ShareInput): Promise<Blob | null> {
  if (typeof document === "undefined") return null;

  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // 폰트 로딩 실패는 무시하고 기본 폰트로 그린다.
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 배경
  ctx.fillStyle = "#0B0D12";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const glow = ctx.createRadialGradient(540, 220, 40, 540, 420, 900);
  glow.addColorStop(0, `${team.color}55`);
  glow.addColorStop(1, "rgba(11,13,18,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.textAlign = "center";
  const cx = WIDTH / 2;
  let y = 190;

  // 헤더
  ctx.fillStyle = "#8A91A3";
  ctx.font = `700 34px ${FONT}`;
  ctx.fillText("KBL 스무고개", cx, y);

  y += 90;
  ctx.fillStyle = "#F2F4F8";
  ctx.font = `600 44px ${FONT}`;
  ctx.fillText("당신의 운명의 KBL 팀은", cx, y);

  // 팀명
  y += 120;
  const nameSize = fitFont(ctx, team.name, 900, 92);
  ctx.fillStyle = team.color;
  ctx.font = `800 ${nameSize}px ${FONT}`;
  ctx.fillText(team.name, cx, y);

  // 궁합
  y += 110;
  ctx.fillStyle = "#FFC93C";
  ctx.font = `800 62px ${FONT}`;
  ctx.fillText(`농구 궁합 ${percent}%`, cx, y);

  // 팬 성향
  y += 90;
  ctx.fillStyle = "#E8ECF5";
  ctx.font = `600 40px ${FONT}`;
  for (const line of wrapText(ctx, team.fanType, 860)) {
    ctx.fillText(line, cx, y);
    y += 56;
  }

  // 히든 결과
  if (hiddenTitle) {
    y += 20;
    ctx.font = `700 34px ${FONT}`;
    const chipWidth = ctx.measureText(`히든 · ${hiddenTitle}`).width + 60;
    ctx.fillStyle = "rgba(255,92,43,0.18)";
    roundedRect(ctx, cx - chipWidth / 2, y - 42, chipWidth, 62, 31);
    ctx.fillStyle = "#FF8A5C";
    ctx.fillText(`히든 · ${hiddenTitle}`, cx, y);
    y += 40;
  }

  // 성향 그래프
  y += 90;
  const barLeft = 170;
  const barWidth = 620;
  const labelX = 150;
  ctx.textAlign = "left";

  for (const bar of TRAIT_BARS) {
    const value = Math.round(bar.get(traits));

    ctx.textAlign = "right";
    ctx.fillStyle = "#8A91A3";
    ctx.font = `600 30px ${FONT}`;
    ctx.fillText(bar.label, labelX, y + 8);

    ctx.textAlign = "left";
    ctx.fillStyle = "#242833";
    roundedRect(ctx, barLeft, y - 16, barWidth, 24, 12);

    const fill = ctx.createLinearGradient(barLeft, 0, barLeft + barWidth, 0);
    fill.addColorStop(0, team.color);
    fill.addColorStop(1, "#FFC93C");
    ctx.fillStyle = fill;
    roundedRect(ctx, barLeft, y - 16, Math.max(24, (barWidth * value) / 100), 24, 12);

    ctx.fillStyle = "#C9CFDD";
    ctx.font = `700 26px ${FONT}`;
    ctx.fillText(String(value), barLeft + barWidth + 22, y + 6);

    y += 64;
  }

  // 한줄평
  y += 60;
  ctx.textAlign = "center";
  ctx.fillStyle = "#F2F4F8";
  ctx.font = `600 38px ${FONT}`;
  for (const line of wrapText(ctx, team.oneLiner, 860)) {
    ctx.fillText(line, cx, y);
    y += 54;
  }

  // 푸터
  ctx.fillStyle = "#6B7286";
  ctx.font = `600 30px ${FONT}`;
  ctx.fillText("KBL 스무고개 · 나에게 맞는 KBL 팀 찾기", cx, HEIGHT - 90);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png");
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
