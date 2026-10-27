const CatalogoBase = ({
  inventario = [],
  onAgregarItem,
  cargandoId,
  bloqueado,
  misionConfirmada,
}) => {
  return (
    <section className="panel panel--catalog" aria-labelledby="catalog-title">
      <div className="panel__heading panel__heading--row">
        <div>
          <p className="eyebrow">Base orbital / Suministros</p>
          <h2 id="catalog-title">Catálogo de carga</h2>
        </div>
        <p className="panel__count">
          {inventario.length} {inventario.length === 1 ? 'suministro' : 'suministros'}
        </p>
      </div>

      {inventario.length === 0 ? (
        <div className="catalog-empty">
          <span className="catalog-empty__mark" aria-hidden="true">
            ◇
          </span>
          <p>Sincronizando inventario con la base espacial…</p>
        </div>
      ) : (
        <div className="catalog-grid">
          {inventario.map((suministro) => {
            const estaCargando = cargandoId === suministro.id
            const sinStock = suministro.stock === 0

            const textoBoton = misionConfirmada
              ? 'Misión confirmada'
              : estaCargando
                ? 'Calculando...'
                : sinStock
                  ? 'Agotado en base'
                  : 'Añadir a la nave'

            return (
              <article className="catalog-card" key={suministro.id}>
                <div className="catalog-card__head">
                  <p className="catalog-card__category">{suministro.categoria}</p>
                  <p
                    className={`catalog-card__stock${
                      sinStock ? ' catalog-card__stock--agotado' : ''
                    }`}
                  >
                    Stock <strong>{suministro.stock} u</strong>
                  </p>
                </div>

                <h3 className="catalog-card__title">{suministro.nombre}</h3>

                <p className="catalog-card__price">
                  {suministro.precio.toFixed(2)} <span>Cr</span>
                </p>

                <button
                  type="button"
                  className="button-primary"
                  disabled={sinStock || bloqueado || misionConfirmada || estaCargando}
                  aria-busy={estaCargando}
                  onClick={() => onAgregarItem(suministro.id)}
                >
                  {textoBoton}
                </button>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default CatalogoBase
