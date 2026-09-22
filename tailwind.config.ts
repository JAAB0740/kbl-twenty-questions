import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          bg: "#0B0D12",
          card: "#15181F",
          line: "#242833",
          muted: "#8A91A3",
          ink: "#F2F4F8",
          accent: "#FF5C2B",
          accent2: "#FFC93C",
        },
      },
      fontFamily: {
        sans: [
          "Pretendard",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Malgun Gothic",
          "Apple SD Gothic Neo",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "bar-grow": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        // 위치 optional step 전용: reaction 대기 없이 즉시 전환될 때 쓰는 짧은 fade/slide.
        "quick-fade": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.35s ease-out both",
        "pop-in": "pop-in 0.3s ease-out both",
        "bar-grow": "bar-grow 0.7s cubic-bezier(0.2,0.8,0.2,1) both",
        "quick-fade": "quick-fade 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
