import { Card, CardText, Col, Container, Row } from 'reactstrap'
import FeedbackBanner from './components/FeedbackBanner.jsx'
import HistoryList from './components/HistoryList.jsx'
import ReactorHeader from './components/ReactorHeader.jsx'
import TemperatureForm from './components/TemperatureForm.jsx'
import VictoryPanel from './components/VictoryPanel.jsx'
import { useReactor } from './hooks/useReactor.js'
import './App.css'

function App() {
  const {
    valor,
    historial,
    mensaje,
    estabilizado,
    enviando,
    error,
    reiniciando,
    intentosFallidos,
    intentoGanador,
    estadoNucleo,
    totalIntentos,
    cambiarValor,
    enviarIntento,
    reiniciar,
  } = useReactor()

  return (
    <Container fluid className="app-shell">
      <ReactorHeader
        estabilizado={estabilizado}
        estadoNucleo={estadoNucleo}
        intentos={totalIntentos}
        fallidos={intentosFallidos.length}
      />

      <main className="main">
        <Row className="console-grid g-0">
          <Col className="console-column">
            <FeedbackBanner mensaje={mensaje} error={error} />

            {estabilizado ? (
              <VictoryPanel
                intentoGanador={intentoGanador}
                intentos={totalIntentos}
                fallidos={intentosFallidos.length}
                reiniciando={reiniciando}
                onReiniciar={reiniciar}
              />
            ) : (
              <TemperatureForm
                valor={valor}
                onCambiar={cambiarValor}
                onSubmit={enviarIntento}
                onReiniciar={reiniciar}
                enviando={enviando}
                reiniciando={reiniciando}
                error={error}
              />
            )}
          </Col>

          <Col>
            <HistoryList historial={historial} />
          </Col>
        </Row>

        <Card className="ticks" aria-hidden="true" />
      </main>

      <Row tag="footer" className="footer g-0">
        <Col xs={12} md="auto">
          <CardText className="footer__note">
            Los datos del historial se pierden al recargar la página.
          </CardText>
        </Col>
        <Col xs={12} md="auto">
          <CardText className="footer__meta">Reactor / Sesión local</CardText>
        </Col>
      </Row>
    </Container>
  )
}

export default App
