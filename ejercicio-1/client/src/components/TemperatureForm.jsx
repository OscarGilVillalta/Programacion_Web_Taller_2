function TemperatureForm({
  valor,
  onCambiar,
  onSubmit,
  onReiniciar,
  enviando,
  reiniciando,
  estabilizado,
  error,
}) {
  const disabled = enviando || reiniciando || estabilizado

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit()
  }

  return (
    <section className="panel panel--form" aria-labelledby="form-title">
      <div className="panel__heading">
        <p className="eyebrow">Ajuste manual</p>
        <h2 id="form-title">Temperatura de ajuste</h2>
      </div>

      <form
        className="temperature-form"
        onSubmit={handleSubmit}
        aria-busy={enviando}
        noValidate
      >
        <div className="field">
          <label className="field__label" htmlFor="temperatura">
            Valor objetivo
          </label>
          <div className="field__control">
            <input
              id="temperatura"
              name="temperatura"
              type="number"
              min="1"
              max="100"
              step="1"
              inputMode="numeric"
              autoComplete="off"
              placeholder="50"
              value={valor}
              onChange={(event) => onCambiar(event.target.value)}
              disabled={disabled}
              aria-invalid={Boolean(error)}
              aria-describedby={
                error
                  ? 'temperatura-hint feedback-error'
                  : 'temperatura-hint'
              }
            />
            <span className="field__suffix" aria-hidden="true">
              °C
            </span>
          </div>
          <p className="field__hint" id="temperatura-hint">
            Número entero entre 1 y 100.
          </p>
        </div>

        <div className="form-actions">
          <button className="button-primary" type="submit" disabled={disabled}>
            {enviando
              ? 'Ajustando…'
              : estabilizado
                ? 'Núcleo estabilizado'
                : 'Enviar intento'}
          </button>

          <button
            className="button-secondary"
            type="button"
            onClick={onReiniciar}
            disabled={enviando || reiniciando}
            aria-label="Reiniciar reactor y borrar el historial"
          >
            {reiniciando ? 'Reiniciando…' : 'Reiniciar'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default TemperatureForm
