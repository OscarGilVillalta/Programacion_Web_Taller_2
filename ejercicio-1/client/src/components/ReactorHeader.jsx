import ReactorCore from './ReactorCore.jsx'

const ETIQUETAS_ESTADO = {
  reposo: 'Sistema en línea',
  alerta: 'Advertencia',
  estabilizado: 'Estabilizado',
}

function ReactorHeader({
  estabilizado = false,
  estadoNucleo = 'reposo',
  intentos = 0,
  fallidos = 0,
}) {
  return (
    <header className="reactor-header">
      <div className="topbar">
        <div className="brand">
          <span className="brand__sigil" aria-hidden="true">
            <svg viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="26" />
              <path d="M32 7l6.5 18.5L57 32l-18.5 6.5L32 57l-6.5-18.5L7 32l18.5-6.5z" />
              <circle cx="32" cy="32" r="4" />
            </svg>
          </span>
          <span className="brand__name">Reactor</span>
          <span className="brand__divider" aria-hidden="true">
            /
          </span>
          <span className="brand__tag">Protocolo de estabilización</span>
        </div>

        <p className={`status status--${estadoNucleo}`}>
          <span className="status__dot" aria-hidden="true" />
          {ETIQUETAS_ESTADO[estadoNucleo] ?? ETIQUETAS_ESTADO.reposo}
        </p>
      </div>

      <div className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Protocolo 01 / Núcleo térmico</p>
          <h1 className="hero__title">El Núcleo</h1>
          <p className="hero__lead">
            Introduce una temperatura entre 1 y 100. El servidor te dirá si el
            reactor necesita más o menos calor.
          </p>

          <dl className="hero__metrics">
            <div className="hero__metric">
              <dt>Intentos</dt>
              <dd>{String(intentos).padStart(2, '0')}</dd>
            </div>
            <div className="hero__metric">
              <dt>Fallidos</dt>
              <dd>{String(fallidos).padStart(2, '0')}</dd>
            </div>
            <div className="hero__metric">
              <dt>Estado</dt>
              <dd>{estabilizado ? 'Estable' : 'Inestable'}</dd>
            </div>
          </dl>
        </div>

        <div className="hero__visual">
          <ReactorCore estado={estadoNucleo} />
        </div>
      </div>
    </header>
  )
}

export default ReactorHeader
