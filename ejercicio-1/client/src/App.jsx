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
    <div className="app-shell">
      <ReactorHeader
        estabilizado={estabilizado}
        estadoNucleo={estadoNucleo}
        intentos={totalIntentos}
        fallidos={intentosFallidos.length}
      />

      <main className="main">
        <div className="console-grid">
          <div className="console-column">
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
          </div>

          <HistoryList historial={historial} />
        </div>

        <div className="ticks" aria-hidden="true" />
      </main>

      <footer className="footer">
        <p>Los datos del historial se pierden al recargar la página.</p>
        <p className="footer__meta">Reactor / Sesión local</p>
      </footer>
    </div>
  )
}

export default App
