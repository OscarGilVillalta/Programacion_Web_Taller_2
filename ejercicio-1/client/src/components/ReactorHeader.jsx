import {
  Badge,
  Card,
  CardBody,
  Col,
  ListGroup,
  ListGroupItem,
  Navbar,
  NavbarBrand,
  Row,
} from 'reactstrap'
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
      <Navbar className="topbar" container={false}>
        <NavbarBrand tag="div" className="brand">
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
        </NavbarBrand>

        <Badge
          color=""
          pill
          className={`reactor-status reactor-status--${estadoNucleo}`}
        >
          {ETIQUETAS_ESTADO[estadoNucleo] ?? ETIQUETAS_ESTADO.reposo}
        </Badge>
      </Navbar>

      <Row className="hero g-0">
        <Col className="hero__copy">
          <p className="eyebrow">Protocolo 01 / Núcleo térmico</p>
          <h1 className="hero__title">El Núcleo</h1>
          <p className="hero__lead">
            Introduce una temperatura entre 1 y 100. El servidor te dirá si el
            reactor necesita más o menos calor.
          </p>

          <ListGroup horizontal className="hero__metrics">
            <ListGroupItem className="hero__metric">
              <span className="hero__metric-label">Intentos</span>
              <span className="hero__metric-value">
                {String(intentos).padStart(2, '0')}
              </span>
            </ListGroupItem>
            <ListGroupItem className="hero__metric">
              <span className="hero__metric-label">Fallidos</span>
              <span className="hero__metric-value">
                {String(fallidos).padStart(2, '0')}
              </span>
            </ListGroupItem>
            <ListGroupItem className="hero__metric">
              <span className="hero__metric-label">Estado</span>
              <span className="hero__metric-value">
                {estabilizado ? 'Estable' : 'Inestable'}
              </span>
            </ListGroupItem>
          </ListGroup>
        </Col>

        <Col className="hero__visual">
          <Card className="hero__visual-card">
            <CardBody>
              <ReactorCore estado={estadoNucleo} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </header>
  )
}

export default ReactorHeader
