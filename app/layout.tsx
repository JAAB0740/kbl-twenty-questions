import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KBL 스무고개 - 나에게 맞는 KBL 팀 찾기",
  description:
    "질문 15개에 답하면 당신과 가장 잘 맞는 KBL 팀을 찾아드립니다. 농구를 몰라도 괜찮습니다.",
};

export const viewport: Viewport = {
  themeColor: "#0B0D12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="font-sans antialiased">
        <div className="min-h-dvh py-8">{children}</div>
      </body>
    </html>
  );
}
