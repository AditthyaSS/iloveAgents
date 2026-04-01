/**
 * I ❤ Agents logo – inspired by the iLovePDF brand style.
 * Renders as an inline SVG so it stays crisp at every size and
 * automatically adapts to dark / light mode via currentColor.
 */
export default function Logo({ className = '', height = 28 }) {
  // The viewBox is tuned so the heart sits snugly between "I" and "Agents"
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 260 48"
      height={height}
      className={className}
      aria-label="I Love Agents"
      role="img"
    >
      {/* "I" */}
      <text
        x="0"
        y="38"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="42"
        fill="currentColor"
        letterSpacing="-1"
      >
        I
      </text>

      {/* Heart */}
      <g transform="translate(24, -1) scale(1.3)">
        <path
          d="M16.5 6.5C14.5 2.5 9.5 0 5.5 2.5C1.5 5 0.5 10.5 3 14.5C5.5 18.5 16.5 28 16.5 28S27.5 18.5 30 14.5C32.5 10.5 31.5 5 27.5 2.5C23.5 0 18.5 2.5 16.5 6.5Z"
          fill="#E8384F"
        />
        {/* Folded corner highlight (like iLovePDF page fold) */}
        <path
          d="M8 20C10 17 12.5 14.5 13.5 13C14 12.3 13.5 11.8 12.8 12.2C11 13.3 8 16 6.5 18.5C6 19.3 7.2 20.8 8 20Z"
          fill="#C62D3F"
          opacity="0.5"
        />
      </g>

      {/* "Agents" */}
      <text
        x="68"
        y="38"
        fontFamily="'Inter', 'Helvetica Neue', Arial, sans-serif"
        fontWeight="800"
        fontSize="42"
        fill="currentColor"
        letterSpacing="-1"
      >
        Agents
      </text>
    </svg>
  )
}
