export function AtlasLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
    >
      <g>
        <path d="M50 0L65.45 15.45L84.55 15.45L92.27 34.55L100 50L92.27 65.45L84.55 84.55L65.45 84.55L50 100L34.55 84.55L15.45 84.55L7.73 65.45L0 50L7.73 34.55L15.45 15.45L34.55 15.45L50 0Z" />
        <path
          d="M50 25L59.64 34.64L75 34.64L79.82 45.18L85 50L79.82 54.82L75 65.36L59.64 65.36L50 75L40.36 65.36L25 65.36L20.18 54.82L15 50L20.18 45.18L25 34.64L40.36 34.64L50 25Z"
          fill="hsl(var(--card))"
        />
        <circle cx="50" cy="50" r="10" fill="currentColor" />
      </g>
    </svg>
  );
}
