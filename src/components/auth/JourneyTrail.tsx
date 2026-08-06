type Milestone = {
  label: string;
  x: number;
  y: number;
  completed: boolean;
};

const milestones: Milestone[] = [
  {
    label: "Basecamp",
    x: 50,
    y: 330,
    completed: true,
  },
  {
    label: "Research Trail",
    x: 210,
    y: 307,
    completed: false,
  },
  {
    label: "Document Valley",
    x: 340,
    y: 260,
    completed: false,
  },
  {
    label: "Essay Pass",
    x: 460,
    y: 215,
    completed: false,
  },
  {
    label: "Interview Summit",
    x: 590,
    y: 177,
    completed: false,
  },
];

export default function JourneyTrail() {
  return (
    <svg
      viewBox="0 0 760 380"
      className="h-full w-full"
      role="img"
      aria-label="Scholarship expedition route from Basecamp to Submission Gate"
    >
      <path
        className="route-line"
        d="
          M50 330
          C120 315 140 295 210 307
          S285 278 340 260
          S402 180 460 215
          S520 285 590 177
          S680 245 710 52
        "
        fill="none"
        stroke="#E6D5BC"
        strokeLinecap="round"
        strokeWidth="4"
      />

      {milestones.map((milestone) => (
        <g
          key={milestone.label}
          transform={`translate(${milestone.x}, ${milestone.y})`}
        >
          <circle
            r="11"
            fill={
              milestone.completed
                ? "#16629B"
                : "#6BA8E6"
            }
          />

          <circle
            r="15"
            fill="transparent"
            stroke={
              milestone.completed
                ? "#16629B"
                : "#6BA8E6"
            }
            strokeOpacity="0.16"
            strokeWidth="5"
          />

          <text
            y="31"
            textAnchor="middle"
            fontSize="12"
            fill="#414750"
          >
            {milestone.label}
          </text>
        </g>
      ))}

      <g transform="translate(710,52)">
        <line
          x1="0"
          y1="-18"
          x2="0"
          y2="24"
          stroke="#7A582F"
          strokeWidth="4"
        />

        <path
          d="M2 -16 L31 -5 L2 8 Z"
          fill="#BA1A1A"
        />

        <text
          x="-9"
          y="-26"
          textAnchor="end"
          fontSize="13"
          fontWeight="700"
          fill="#16629B"
        >
          Submission Gate
        </text>
      </g>
    </svg>
  );
}