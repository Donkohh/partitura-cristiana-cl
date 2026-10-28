import { cn } from "@/lib/utils";

interface ScoreLinesProps {
  className?: string;
}

export function ScoreLines({ className }: ScoreLinesProps) {
  return (
    <svg
      viewBox="0 0 420 150"
      role="presentation"
      aria-hidden="true"
      className={cn("h-auto w-full text-petrol-900", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth="0.75"
        opacity="0.48"
        fill="none"
      >
        {[44, 58, 72, 86, 100].map((y) => (
          <line key={y} x1="18" x2="402" y1={y} y2={y} />
        ))}
        <line x1="136" x2="136" y1="39" y2="105" opacity="0.7" />
        <line x1="266" x2="266" y1="39" y2="105" opacity="0.7" />
        <line x1="366" x2="366" y1="39" y2="105" opacity="0.7" />
      </g>

      <g fill="currentColor" opacity="0.78">
        <rect x="42" y="45" width="1.3" height="28" />
        <rect x="63" y="51" width="1.3" height="28" />
        <rect x="84" y="58" width="1.3" height="28" />
        <ellipse cx="42" cy="73" rx="4.5" ry="3.1" transform="rotate(-16 42 73)" />
        <ellipse cx="63" cy="79" rx="4.5" ry="3.1" transform="rotate(-16 63 79)" />
        <ellipse cx="84" cy="86" rx="4.5" ry="3.1" transform="rotate(-16 84 86)" />

        <rect x="158" y="38" width="1.3" height="30" />
        <rect x="184" y="45" width="1.3" height="30" />
        <rect x="210" y="52" width="1.3" height="30" />
        <ellipse cx="158" cy="68" rx="4.5" ry="3.1" transform="rotate(-16 158 68)" />
        <ellipse cx="184" cy="75" rx="4.5" ry="3.1" transform="rotate(-16 184 75)" />
        <ellipse cx="210" cy="82" rx="4.5" ry="3.1" transform="rotate(-16 210 82)" />
        <path
          d="M158 68 L210 78"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />

        <rect x="292" y="49" width="1.3" height="30" />
        <rect x="318" y="42" width="1.3" height="30" />
        <rect x="344" y="56" width="1.3" height="30" />
        <ellipse cx="292" cy="79" rx="4.5" ry="3.1" transform="rotate(-16 292 79)" />
        <ellipse cx="318" cy="72" rx="4.5" ry="3.1" transform="rotate(-16 318 72)" />
        <ellipse cx="344" cy="86" rx="4.5" ry="3.1" transform="rotate(-16 344 86)" />
      </g>

      <g
        fill="currentColor"
        fontFamily="var(--font-source-serif), Georgia, serif"
        fontStyle="italic"
        opacity="0.55"
      >
        <text x="20" y="31" fontSize="13">
          Andante
        </text>
        <text x="154" y="128" fontSize="14">
          p
        </text>
        <text x="288" y="128" fontSize="14">
          mf
        </text>
      </g>
    </svg>
  );
}
