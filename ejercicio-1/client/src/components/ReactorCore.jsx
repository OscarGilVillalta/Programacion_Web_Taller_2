const TICKS = Array.from({ length: 24 }, (_, index) => index * 15)

function ReactorCore({ estado = 'reposo' }) {
  return (
    <div className={`reactor-core reactor-core--${estado}`} aria-hidden="true">
      <svg className="reactor-core__svg" viewBox="0 0 240 240">
        <circle
          className="reactor-core__ring reactor-core__ring--outer"
          cx="120"
          cy="120"
          r="106"
        />
        <circle
          className="reactor-core__ring reactor-core__ring--mid"
          cx="120"
          cy="120"
          r="78"
        />
        <circle
          className="reactor-core__ring reactor-core__ring--inner"
          cx="120"
          cy="120"
          r="46"
        />
        <g className="reactor-core__ticks">
          {TICKS.map((angle) => (
            <line
              key={angle}
              x1="120"
              y1="10"
              x2="120"
              y2={angle % 45 === 0 ? 24 : 18}
              transform={`rotate(${angle} 120 120)`}
            />
          ))}
        </g>
        <circle className="reactor-core__center" cx="120" cy="120" r="10" />
      </svg>
    </div>
  )
}

export default ReactorCore
