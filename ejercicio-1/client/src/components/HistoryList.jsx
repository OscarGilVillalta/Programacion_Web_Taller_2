import {
  Alert,
  Badge,
  Card,
  CardBody,
  CardTitle,
  ListGroup,
  ListGroupItem,
} from 'reactstrap'

const ETIQUETAS = {
  mas_alta: { clase: 'alta', simbolo: '↑', texto: 'Más alta' },
  mas_baja: { clase: 'baja', simbolo: '↓', texto: 'Más baja' },
  estabilizado: { clase: 'estabilizado', simbolo: '✓', texto: 'Estabilizado' },
}

function HistoryList({ historial }) {
  return (
    <Card className="panel panel--history" aria-labelledby="history-title">
      <CardBody>
        <div className="panel__heading panel__heading--row">
          <div>
            <p className="eyebrow">Sesión actual</p>
            <CardTitle tag="h2" id="history-title">
              Registro de intentos
            </CardTitle>
          </div>
          <Badge color="" className="history-count">
            {historial.length} {historial.length === 1 ? 'intento' : 'intentos'}
            <span aria-hidden="true"> · </span>
            Historial
          </Badge>
        </div>

        {historial.length === 0 ? (
          <Alert color="light" className="history-empty">
            <span className="history-empty__mark" aria-hidden="true">
              ◇
            </span>
            <p>Todavía no hay intentos en esta sesión.</p>
          </Alert>
        ) : (
          <ListGroup
            tag="ol"
            flush
            className="history-list"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {historial.map((intento) => {
              const etiqueta = ETIQUETAS[intento.estado] ?? {
                clase: 'desconocido',
                simbolo: '·',
                texto: intento.estado,
              }

              return (
                <ListGroupItem
                  tag="li"
                  key={intento.id}
                  className={`history-row history-row--${etiqueta.clase}`}
                >
                  <span className="history-row__number">
                    #{String(intento.numero).padStart(2, '0')}
                  </span>
                  <span className="history-row__value">
                    {intento.valor}
                    <span className="history-row__unit">°C</span>
                  </span>
                  <Badge color="" pill className="history-row__verdict">
                    <span className="history-row__symbol" aria-hidden="true">
                      {etiqueta.simbolo}
                    </span>
                    {etiqueta.texto}
                  </Badge>
                  <span className="history-row__message">
                    {intento.estado === 'estabilizado'
                      ? 'Temperatura ideal alcanzada.'
                      : intento.mensaje}
                  </span>
                </ListGroupItem>
              )
            })}
          </ListGroup>
        )}
      </CardBody>
    </Card>
  )
}

export default HistoryList
