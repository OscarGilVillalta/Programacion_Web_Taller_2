function VictoryPanel({
  intentoGanador,
  intentos,
  fallidos,
  reiniciando,
  onReiniciar,
}) {
  return (
    <section
      className="victory-panel"
      aria-labelledby="victory-title"
      aria-live="polite"
    >
      <span className="victory-panel__mark" aria-hidden="true">
        ✓
      </span>
      <p className="eyebrow">Protocolo completado</p>
      <h2 id="victory-title">Reactor estabilizado</h2>
      <p className="victory-panel__copy">
        {intentoGanador
          ? `La temperatura de ${intentoGanador.valor} °C estabilizó el núcleo.`
          : 'El núcleo ha alcanzado la temperatura ideal.'}
      </p>

      <dl className="victory-panel__metrics">
        <div>
          <dt>Intentos</dt>
          <dd>{intentos}</dd>
        </div>
        <div>
          <dt>Fallidos</dt>
          <dd>{fallidos}</dd>
        </div>
        <div>
          <dt>Temperatura</dt>
          <dd>{intentoGanador ? `${intentoGanador.valor} °C` : '—'}</dd>
        </div>
      </dl>

      <button
        className="button-primary"
        type="button"
        onClick={onReiniciar}
        disabled={reiniciando}
      >
        {reiniciando ? 'Reiniciando…' : 'Reiniciar reactor'}
      </button>
    </section>
  )
}

export default VictoryPanel
