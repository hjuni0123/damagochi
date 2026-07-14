"use client";

import { motion } from "framer-motion";

export type EquippedItem = {
  category: "OUTFIT" | "HAT" | "FACE" | "ACCESSORY" | "BACKGROUND" | "EMOTION";
  emoji: string;
  color: string;
  name: string;
};

const LEVEL_BODY_COLOR: Record<number, string> = {
  1: "#FFF3D6",
  2: "#FFD166",
  3: "#7FD8BE",
  4: "#7CC6FE",
  5: "#B28DFF",
  6: "#FFC94D",
};

const DEFAULT_MOUTH = "M -14 8 Q 0 18 14 8";

function mouthForEmotion(emoji?: string) {
  switch (emoji) {
    case "😄": // 웃음
      return "M -16 6 Q 0 26 16 6";
    case "😴": // 졸림
      return "M -10 10 Q 0 10 10 10";
    case "😠": // 화남
      return "M -14 16 Q 0 4 14 16";
    case "🤩": // 신남
      return "M -16 8 Q 0 24 16 8";
    case "🥹": // 감동
      return "M -12 10 Q 0 16 12 10";
    default:
      return DEFAULT_MOUTH;
  }
}

export default function SsyuAvatar({
  level,
  items = [],
  size = 200,
  teamName,
  animate = true,
  className = "",
}: {
  level: number;
  items?: EquippedItem[];
  size?: number;
  teamName?: string;
  animate?: boolean;
  className?: string;
}) {
  const bodyColor = LEVEL_BODY_COLOR[level] ?? LEVEL_BODY_COLOR[1];
  const outfit = items.find((i) => i.category === "OUTFIT");
  const hat = items.find((i) => i.category === "HAT");
  const face = items.find((i) => i.category === "FACE");
  const accessory = items.find((i) => i.category === "ACCESSORY");
  const background = items.find((i) => i.category === "BACKGROUND");
  const emotion = items.find((i) => i.category === "EMOTION");
  const isEgg = level === 1;

  return (
    <div
      className={`relative flex items-center justify-center rounded-3xl overflow-hidden ${className}`}
      style={{
        width: size,
        height: size,
        background: background
          ? `linear-gradient(180deg, ${background.color}33, ${background.color}66)`
          : "linear-gradient(180deg, #FFF3D6, #FFE8B8)",
      }}
    >
      {background && (
        <span
          className="absolute top-2 left-2 text-xl opacity-70 select-none"
          aria-hidden
        >
          {background.emoji}
        </span>
      )}

      <motion.div
        className="relative"
        style={{ width: size * 0.7, height: size * 0.7 }}
        animate={animate ? { y: [0, -size * 0.03, 0] } : undefined}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg viewBox="-60 -60 120 120" width="100%" height="100%">
          {/* body */}
          <ellipse cx="0" cy="8" rx="46" ry={isEgg ? 48 : 42} fill={bodyColor} stroke="#3D2B1F" strokeWidth="3" />
          {/* outfit band */}
          {outfit && !isEgg && (
            <path
              d="M -40 28 Q 0 46 40 28 L 40 40 Q 0 56 -40 40 Z"
              fill={outfit.color}
              stroke="#3D2B1F"
              strokeWidth="2.5"
            />
          )}
          {/* cheeks */}
          <circle cx="-24" cy="14" r="7" fill="#FF8FAB" opacity="0.55" />
          <circle cx="24" cy="14" r="7" fill="#FF8FAB" opacity="0.55" />
          {/* eyes */}
          {isEgg ? (
            <>
              <path d="M -18 0 Q -14 -6 -10 0" stroke="#3D2B1F" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 10 0 Q 14 -6 18 0" stroke="#3D2B1F" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <circle cx="-14" cy="0" r="5" fill="#3D2B1F" />
              <circle cx="14" cy="0" r="5" fill="#3D2B1F" />
            </>
          )}
          {/* mouth */}
          <path d={mouthForEmotion(emotion?.emoji)} stroke="#3D2B1F" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        </svg>

        {hat && (
          <span
            className="absolute -top-3 left-1/2 -translate-x-1/2 text-3xl select-none drop-shadow"
            style={{ fontSize: size * 0.16 }}
            aria-hidden
          >
            {hat.emoji}
          </span>
        )}
        {face && (
          <span
            className="absolute left-1/2 -translate-x-1/2 select-none"
            style={{ top: "34%", fontSize: size * 0.13 }}
            aria-hidden
          >
            {face.emoji}
          </span>
        )}
        {accessory && (
          <span
            className="absolute -right-2 bottom-2 select-none"
            style={{ fontSize: size * 0.14 }}
            aria-hidden
          >
            {accessory.emoji}
          </span>
        )}
      </motion.div>

      {teamName && (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/70 text-ssyu-brown whitespace-nowrap">
          {teamName}
        </span>
      )}
    </div>
  );
}
