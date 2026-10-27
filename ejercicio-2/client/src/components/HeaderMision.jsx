import MissionPatch from './MissionPatch'

const ETIQUETAS_ESTADO = {
  preparacion: 'Sistema en línea',
  alerta: 'Ventana por cerrar',
  confirmada: 'Misión confirmada',
  expirada: 'Ventana cerrada',
}

const formatearTiempo = (segundosTotales = 0) => {
  const segundosSeguros = Math.max(0, Math.floor(segundosTotales))
  const minutos = Math.floor(segundosSeguros / 60)
  const segundos = segundosSeguros % 60

  return `${minutos.toString().padStart(2, '0')}:${segundos
    .toString()
    .padStart(2, '0')}`
}

function HeaderMision({
  creditos = 0,
  total = 0,
  tiempo = 0,
  misionConfirmada = false,
  sesionExpirada = false,
}) {
  const estado = sesionExpirada
    ? 'expirada'
    : misionConfirmada
      ? 'confirmada'
      : tiempo < 60
        ? 'alerta'
        : 'preparacion'

  return (
    <header className="mission-header">
      <div className="topbar">
        <div className="brand">
          <span className="brand__logo" aria-hidden="true">
            <img src="/favicon.svg" alt="" />
          </span>
          <span className="brand__name">Cherry Team</span>
          <span className="brand__divider" aria-hidden="true">
            /
          </span>
          <span className="brand__tag">AstroLogistics · Misión de carga</span>
        </div>

        <p className={`status status--${estado}`}>
          <span className="status__dot" aria-hidden="true" />
          {ETIQUETAS_ESTADO[estado]}
        </p>
      </div>

      <div className="hero">
        <div className="hero__copy">
          <p className="eyebrow">AstroLogistics / Protocolo de lanzamiento</p>
          <h1 className="hero__title">Misión de carga</h1>
          <p className="hero__lead">
            Selecciona suministros de la base, controla el presupuesto y confirma
            el manifiesto antes de que se cierre la ventana de lanzamiento.
          </p>

          <dl className="hero__metrics">
            <div className={`hero__metric${estado === 'alerta' ? ' hero__metric--alerta' : ''}`}>
              <dt>Ventana</dt>
              <dd>{formatearTiempo(tiempo)}</dd>
            </div>
            <div className="hero__metric">
              <dt>Créditos</dt>
              <dd>
                {creditos} <span>Cr</span>
              </dd>
            </div>
            <div className="hero__metric">
              <dt>Carga actual</dt>
              <dd>
                {total} <span>Cr</span>
              </dd>
            </div>
          </dl>
        </div>

        <div className="hero__visual">
          <MissionPatch estado={estado} />
        </div>
      </div>
    </header>
  )
}

export default HeaderMision
