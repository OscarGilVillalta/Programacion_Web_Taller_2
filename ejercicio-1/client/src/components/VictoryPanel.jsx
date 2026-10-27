import {
  Badge,
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  ListGroup,
  ListGroupItem,
} from 'reactstrap'

function VictoryPanel({
  intentoGanador,
  intentos,
  fallidos,
  reiniciando,
  onReiniciar,
}) {
  return (
    <Card
      className="victory-panel"
      aria-labelledby="victory-title"
      aria-live="polite"
    >
      <CardBody>
        <Badge color="" className="victory-panel__mark" aria-hidden="true">
          ✓
        </Badge>
        <p className="eyebrow">Protocolo completado</p>
        <CardTitle tag="h2" id="victory-title">
          Reactor estabilizado
        </CardTitle>
        <CardText className="victory-panel__copy">
          {intentoGanador
            ? `La temperatura de ${intentoGanador.valor} °C estabilizó el núcleo.`
            : 'El núcleo ha alcanzado la temperatura ideal.'}
        </CardText>

        <ListGroup horizontal className="victory-panel__metrics">
          <ListGroupItem className="victory-panel__metric">
            <span className="victory-panel__metric-label">Intentos</span>
            <span className="victory-panel__metric-value">{intentos}</span>
          </ListGroupItem>
          <ListGroupItem className="victory-panel__metric">
            <span className="victory-panel__metric-label">Fallidos</span>
            <span className="victory-panel__metric-value">{fallidos}</span>
          </ListGroupItem>
          <ListGroupItem className="victory-panel__metric">
            <span className="victory-panel__metric-label">Temperatura</span>
            <span className="victory-panel__metric-value">
              {intentoGanador ? `${intentoGanador.valor} °C` : '—'}
            </span>
          </ListGroupItem>
        </ListGroup>

        <Button
          className="button-primary"
          type="button"
          onClick={onReiniciar}
          disabled={reiniciando}
        >
          {reiniciando ? 'Reiniciando…' : 'Reiniciar reactor'}
        </Button>
      </CardBody>
    </Card>
  )
}

export default VictoryPanel
