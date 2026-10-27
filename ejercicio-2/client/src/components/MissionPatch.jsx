const TICKS = Array.from({ length: 36 }, (_, index) => index * 10)

const ETIQUETAS_ESTADO = {
  preparacion: 'En preparación',
  alerta: 'Ventana por cerrar',
  confirmada: 'Misión confirmada',
  expirada: 'Ventana cerrada',
}

function MissionPatch({ estado = 'preparacion' }) {
  const etiqueta = ETIQUETAS_ESTADO[estado] ?? ETIQUETAS_ESTADO.preparacion

  return (
    <div className={`mission-patch mission-patch--${estado}`} aria-hidden="true">
      <svg className="mission-patch__svg" viewBox="0 0 320 320">
        <circle
          className="mission-patch__ring mission-patch__ring--outer"
          cx="160"
          cy="160"
          r="150"
        />
        <circle
          className="mission-patch__ring mission-patch__ring--mid"
          cx="160"
          cy="160"
          r="118"
        />
        <circle
          className="mission-patch__ring mission-patch__ring--inner"
          cx="160"
          cy="160"
          r="82"
        />

        <g className="mission-patch__ticks">
          {TICKS.map((angle) => (
            <line
              key={angle}
              x1="160"
              y1="6"
              x2="160"
              y2={angle % 45 === 0 ? 22 : 14}
              transform={`rotate(${angle} 160 160)`}
            />
          ))}
        </g>

        <ellipse
          className="mission-patch__orbit"
          cx="160"
          cy="160"
          rx="138"
          ry="54"
          transform="rotate(-24 160 160)"
        />
        <circle className="mission-patch__satellite" cx="259" cy="102" r="3.5" />
        <circle className="mission-patch__satellite" cx="62" cy="219" r="2.5" />
      </svg>

      <span className="mission-patch__logo">
        <img src="/favicon.svg" alt="" />
      </span>

      <p className="mission-patch__caption">
        <span>AstroLogistics</span>
        <span aria-hidden="true">·</span>
        <span>{etiqueta}</span>
      </p>
    </div>
  )
}

export default MissionPatch
