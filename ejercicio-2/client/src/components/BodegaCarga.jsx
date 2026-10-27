const BodegaCarga = ({
  itemsCargados = [],
  inventario = [],
  onActualizarUnidades,
  onEliminarItem,
  onConfirmarCarga,
  onReiniciarSesion,
  cargandoId,
  confirmando,
  reiniciando,
  bloqueado,
  misionConfirmada,
}) => {
  const controlesBloqueados = bloqueado || misionConfirmada

  const totalCarga = itemsCargados.reduce((total, item) => {
    const suministro = inventario.find((elemento) => elemento.id === item.id)

    return suministro ? total + suministro.precio * item.cantidad : total
  }, 0)

  return (
    <section className="panel panel--cargo" aria-labelledby="cargo-title">
      <div className="panel__heading panel__heading--row">
        <div>
          <p className="eyebrow">Transbordador / Manifiesto</p>
          <h2 id="cargo-title">Bodega de carga</h2>
        </div>
        <p className="panel__count">
          {itemsCargados.length} {itemsCargados.length === 1 ? 'ítem' : 'ítems'}
        </p>
      </div>

      {itemsCargados.length === 0 ? (
        <div className="cargo-empty">
          <span className="cargo-empty__mark" aria-hidden="true">
            ◇
          </span>
          <p>
            {misionConfirmada
              ? 'Carga confirmada. La nave está autorizada a despegar.'
              : 'La nave está vacía. Añade suministros desde el catálogo.'}
          </p>
        </div>
      ) : (
        <ul className="cargo-list">
          {itemsCargados.map((item) => {
            const suministro = inventario.find((elemento) => elemento.id === item.id)

            if (!suministro) return null

            const estaCargando = cargandoId === item.id
            const hayStockParaAumentar = suministro.stock > 0

            return (
              <li className="cargo-row" key={item.id}>
                <div className="cargo-row__head">
                  <span className="cargo-row__name">{suministro.nombre}</span>
                  <span className="cargo-row__qty">×{item.cantidad}</span>
                </div>

                <div className="cargo-row__meta">
                  <span>{suministro.precio.toFixed(2)} Cr / unidad</span>
                  <span>{(suministro.precio * item.cantidad).toFixed(2)} Cr</span>
                </div>

                <div className="cargo-row__actions">
                  <div className="quantity-control">
                    <button
                      type="button"
                      className="quantity-control__button"
                      disabled={estaCargando || controlesBloqueados}
                      aria-label={`Quitar una unidad de ${suministro.nombre}`}
                      onClick={() => onActualizarUnidades(item.id, item.cantidad - 1)}
                    >
                      −
                    </button>
                    <span
                      className="quantity-control__value"
                      aria-live="polite"
                      aria-label={`${item.cantidad} unidades cargadas`}
                    >
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      className="quantity-control__button"
                      disabled={
                        estaCargando || controlesBloqueados || !hayStockParaAumentar
                      }
                      title={
                        hayStockParaAumentar
                          ? 'Añadir una unidad'
                          : 'No hay más stock disponible en la base'
                      }
                      aria-label={`Añadir una unidad de ${suministro.nombre}`}
                      onClick={() => onActualizarUnidades(item.id, item.cantidad + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    className="button-danger"
                    disabled={estaCargando || controlesBloqueados}
                    title="Quitar todo el suministro de la bodega"
                    onClick={() => onEliminarItem(item.id)}
                  >
                    Desembarcar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {itemsCargados.length > 0 && (
        <div className="cargo-total">
          <span>Total de carga</span>
          <strong>{totalCarga.toFixed(2)} Cr</strong>
        </div>
      )}

      <div className="cargo-actions">
        {misionConfirmada ? (
          <button
            type="button"
            className="button-primary"
            disabled={bloqueado}
            onClick={onReiniciarSesion}
          >
            {reiniciando ? 'Iniciando...' : 'Nueva misión'}
          </button>
        ) : (
          <button
            type="button"
            className="button-primary"
            disabled={
              itemsCargados.length === 0 || controlesBloqueados || confirmando
            }
            onClick={onConfirmarCarga}
          >
            {confirmando ? 'Confirmando...' : 'Confirmar cargamento'}
          </button>
        )}
      </div>

      {!misionConfirmada && (
        <p className="cargo-note">
          La confirmación descuenta los créditos y cierra la misión.
        </p>
      )}
    </section>
  )
}

export default BodegaCarga
