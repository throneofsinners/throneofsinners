import { useMemo } from "react";

/**
 * SanctuaryScene — a layered, purely-CSS/SVG cathedral backdrop.
 *
 *  - Stone pillars rising into darkness
 *  - Shafts of heavenly light from above
 *  - Floating dust motes drifting upward through the light
 *  - A faint, distant throne glow on the horizon
 *  - Subtle gold filigree on the floor
 *
 * Designed to sit behind hero content with `absolute inset-0` and `-z-10`.
 */

type Props = {
  /** Render the distant throne glow on the horizon. Default true. */
  throne?: boolean;
  /** Number of floating dust motes. Default 28. */
  motes?: number;
  /** Visual intensity 0–1 of the heavenly light shafts. Default 1. */
  lightIntensity?: number;
  /** Optional photographic background image URL to use instead of the CSS cathedral. */
  imageUrl?: string;
};

export function SanctuaryScene({ throne = true, motes = 28, lightIntensity = 1, imageUrl }: Props) {
  const dust = useMemo(
    () =>
      Array.from({ length: motes }).map((_, i) => ({
        left: Math.random() * 100,
        delay: -Math.random() * 22,
        duration: 18 + Math.random() * 18,
        size: 1 + Math.random() * 2.4,
        opacity: 0.18 + Math.random() * 0.35,
        drift: (Math.random() - 0.5) * 60,
      })),
    [motes],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ contain: "strict" }}
    >
      {imageUrl ? (
        <>
          {/* Photographic sanctuary background */}
          <img
            src="/throne_hero.png"
            alt="sanctuary image"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: "50% 40%" }}
          />
          {/* Subtle top glow to blend into page */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 50% at 50% -10%, color-mix(in oklab, var(--gold) 10%, transparent), transparent 70%)",
            }}
          />
        </>
      ) : (
        <>
          {/* Deep vault gradient */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 70% at 50% 110%, color-mix(in oklab, var(--midnight) 80%, transparent) 0%, transparent 60%), radial-gradient(80% 50% at 50% -10%, color-mix(in oklab, var(--gold) 8%, transparent), transparent 70%)",
            }}
          />

          {/* Engraved scripture pattern — extremely subtle */}
          <div
            className="absolute inset-0 opacity-[0.05] mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='220'><text x='0' y='40' font-family='Georgia, serif' font-style='italic' font-size='18' fill='%23D4AF37'>grace · mercy · peace · refuge · hope · light · </text><text x='40' y='110' font-family='Georgia, serif' font-style='italic' font-size='18' fill='%23D4AF37'>come boldly · be still · he hears · </text><text x='-20' y='180' font-family='Georgia, serif' font-style='italic' font-size='18' fill='%23D4AF37'>kyrie eleison · sanctus · </text></svg>\")",
              backgroundSize: "520px 320px",
            }}
          />

          {/* Stone floor */}
          <div
            className="absolute inset-x-0 bottom-0 h-[28%]"
            style={{
              background:
                "linear-gradient(180deg, transparent, color-mix(in oklab, var(--bronze) 22%, var(--obsidian)) 80%)",
              maskImage: "linear-gradient(180deg, transparent, black 40%)",
            }}
          />

          {/* Gold filigree on the floor — a single horizon line */}
          <svg
            className="absolute inset-x-0 bottom-[26%] mx-auto h-6 w-full opacity-60"
            viewBox="0 0 1200 24"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="filigree" x1="0" x2="1">
                <stop offset="0" stopColor="var(--gold)" stopOpacity="0" />
                <stop offset=".5" stopColor="var(--gold)" stopOpacity=".7" />
                <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 12 H1200" stroke="url(#filigree)" strokeWidth="1" />
            <g fill="none" stroke="url(#filigree)" strokeWidth="1">
              {Array.from({ length: 13 }).map((_, i) => (
                <path key={i} d={`M${60 + i * 90} 12 c 10 -8 30 -8 40 0 c -10 8 -30 8 -40 0 z`} />
              ))}
            </g>
          </svg>

          {/* Pillars — left + right pairs, receding */}
          <Pillar side="left" offset={4} height={92} width={7} />
          <Pillar side="left" offset={14} height={80} width={5.5} dim />
          <Pillar side="left" offset={22} height={70} width={4} dim />
          <Pillar side="right" offset={4} height={92} width={7} />
          <Pillar side="right" offset={14} height={80} width={5.5} dim />
          <Pillar side="right" offset={22} height={70} width={4} dim />

          {/* Heavenly light shafts from above */}
          <div className="absolute inset-x-0 top-0 h-full" style={{ opacity: lightIntensity }}>
            <LightShaft x="38%" w="14%" tilt={-6} delay={0} />
            <LightShaft x="50%" w="18%" tilt={0} delay={1.4} strong />
            <LightShaft x="62%" w="12%" tilt={6} delay={2.6} />
          </div>

          {/* Distant throne glow */}
          {throne && (
            <div className="absolute inset-x-0 bottom-[26%] flex justify-center">
              <div
                className="h-40 w-72 sm:h-56 sm:w-[28rem]"
                style={{
                  background:
                    "radial-gradient(ellipse at 50% 100%, color-mix(in oklab, var(--gold) 55%, transparent) 0%, color-mix(in oklab, var(--gold) 18%, transparent) 35%, transparent 70%)",
                  filter: "blur(2px)",
                  animation: "candle-flicker 6.5s ease-in-out infinite",
                }}
              />
            </div>
          )}
        </>
      )}

      {/* Floating dust motes */}
      {dust.map((d, i) => (
        <span
          key={i}
          className="absolute bottom-[-10px] rounded-full bg-[var(--gold-soft)]"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
            boxShadow: "0 0 6px color-mix(in oklab, var(--gold) 60%, transparent)",
            animation: `dust-drift ${d.duration}s linear ${d.delay}s infinite`,
            ["--drift" as string]: `${d.drift}px`,
          }}
        />
      ))}

      {/* Vignette — stronger when using a photo to guarantee text contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: imageUrl
            ? "radial-gradient(120% 80% at 50% 40%, transparent 30%, color-mix(in oklab, var(--obsidian) 92%, transparent) 100%)"
            : "radial-gradient(120% 80% at 50% 40%, transparent 40%, color-mix(in oklab, var(--obsidian) 85%, transparent) 100%)",
        }}
      />
    </div>
  );
}

function Pillar({
  side,
  offset,
  height,
  width,
  dim,
}: {
  side: "left" | "right";
  offset: number;
  height: number;
  width: number;
  dim?: boolean;
}) {
  const horizontal = side === "left" ? { left: `${offset}%` } : { right: `${offset}%` };
  return (
    <div
      className="absolute bottom-0"
      style={{
        ...horizontal,
        width: `${width}%`,
        height: `${height}%`,
        opacity: dim ? 0.55 : 0.9,
      }}
    >
      {/* Capital */}
      <div
        className="absolute left-1/2 top-0 h-3 w-[120%] -translate-x-1/2 rounded-sm"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--bronze) 60%, var(--midnight)), color-mix(in oklab, var(--obsidian) 70%, var(--bronze)))",
          boxShadow: "0 1px 0 color-mix(in oklab, var(--gold) 30%, transparent) inset",
        }}
      />
      {/* Shaft */}
      <div
        className="absolute inset-x-0 top-3 bottom-4"
        style={{
          background:
            "linear-gradient(90deg, color-mix(in oklab, var(--obsidian) 80%, var(--bronze)) 0%, color-mix(in oklab, var(--bronze) 30%, var(--midnight)) 45%, color-mix(in oklab, var(--obsidian) 85%, var(--bronze)) 100%)",
          boxShadow: "inset 0 0 30px color-mix(in oklab, var(--obsidian) 80%, transparent)",
        }}
      />
      {/* Fluting lines */}
      <div
        className="absolute inset-x-0 top-3 bottom-4 opacity-40"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 6px, color-mix(in oklab, var(--obsidian) 90%, transparent) 6px 7px)",
        }}
      />
      {/* Base */}
      <div
        className="absolute inset-x-[-10%] bottom-0 h-4 rounded-sm"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in oklab, var(--bronze) 45%, var(--midnight)), color-mix(in oklab, var(--obsidian) 90%, var(--bronze)))",
        }}
      />
    </div>
  );
}

function LightShaft({
  x,
  w,
  tilt,
  delay,
  strong,
}: {
  x: string;
  w: string;
  tilt: number;
  delay: number;
  strong?: boolean;
}) {
  return (
    <div
      className="absolute top-[-10%] h-[140%]"
      style={{
        left: x,
        width: w,
        transform: `translateX(-50%) rotate(${tilt}deg)`,
        transformOrigin: "top center",
        background: `linear-gradient(180deg, color-mix(in oklab, var(--gold) ${
          strong ? 32 : 18
        }%, transparent) 0%, color-mix(in oklab, var(--gold) ${
          strong ? 10 : 6
        }%, transparent) 50%, transparent 90%)`,
        filter: "blur(8px)",
        mixBlendMode: "screen",
        animation: `shaft-breathe ${10 + delay}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}
