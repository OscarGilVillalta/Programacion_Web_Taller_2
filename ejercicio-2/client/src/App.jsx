import { Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import HeaderMision from './components/HeaderMision'
import CatalogoBase from './components/CatalogoBase'
import BodegaCarga from './components/BodegaCarga'
import { useMision } from './hooks/useMision'
import './App.css'

const ESTILOS_AVISO = {
  error: {
    role: 'alert',
    ariaLive: 'assertive',
    icono: '!',
    etiqueta: 'Restricción de misión',
  },
  success: {
    role: 'status',
    ariaLive: 'polite',
    icono: '✓',
    etiqueta: 'Carga confirmada',
  },
}

const ANIO_ACTUAL = new Date().getFullYear()

function FeedbackBanner({ tipo, mensaje, onDismiss }) {
  const estilo = ESTILOS_AVISO[tipo]

  return (
    <div
      className={`feedback-banner feedback-banner--${tipo}`}
      role={estilo.role}
      aria-live={estilo.ariaLive}
    >
      <span className="feedback-banner__icon" aria-hidden="true">
        {estilo.icono}
      </span>
      <div className="feedback-banner__content">
        <p className="feedback-banner__label">{estilo.etiqueta}</p>
        <p className="feedback-banner__text">{mensaje}</p>
      </div>
      <button
        type="button"
        className="feedback-banner__close"
        onClick={onDismiss}
        aria-label="Cerrar aviso"
      >
        ×
      </button>
    </div>
  )
}

function App() {
  const {
    inventario,
    carga,
    error,
    exitoMensaje,
    misionConfirmada,
    bloqueado,
    cargandoId,
    confirmando,
    reiniciando,
    segundosRestantes,
    modalSesionExpirada,
    cerrarError,
    cerrarExito,
    agregarItem,
    actualizarUnidades,
    eliminarItem,
    confirmarCarga,
    reiniciarSesion,
  } = useMision()

  return (
    <div className="app-shell">
      <HeaderMision
        creditos={carga.creditos}
        total={carga.total}
        tiempo={segundosRestantes}
        misionConfirmada={misionConfirmada}
        sesionExpirada={modalSesionExpirada}
      />

      <main className="main">
        {(error || exitoMensaje) && (
          <div className="feedback-stack">
            {error && (
              <FeedbackBanner
                tipo="error"
                mensaje={error}
                onDismiss={cerrarError}
              />
            )}
            {exitoMensaje && (
              <FeedbackBanner
                tipo="success"
                mensaje={exitoMensaje}
                onDismiss={cerrarExito}
              />
            )}
          </div>
        )}

        <div className="console-grid">
          <CatalogoBase
            inventario={inventario}
            onAgregarItem={agregarItem}
            cargandoId={cargandoId}
            bloqueado={bloqueado}
            misionConfirmada={misionConfirmada}
          />

          <BodegaCarga
            itemsCargados={carga.itemsCargados}
            inventario={inventario}
            onActualizarUnidades={actualizarUnidades}
            onEliminarItem={eliminarItem}
            onConfirmarCarga={confirmarCarga}
            onReiniciarSesion={reiniciarSesion}
            cargandoId={cargandoId}
            confirmando={confirmando}
            reiniciando={reiniciando}
            bloqueado={bloqueado}
            misionConfirmada={misionConfirmada}
          />
        </div>
      </main>

      <footer className="footer">
        <p className="footer__brand">
          <strong>Cherry Team</strong>
          <span aria-hidden="true"> · </span>
          AstroLogistics
        </p>
        <p className="footer__meta">
          Datos de misión en memoria · {ANIO_ACTUAL}
        </p>
      </footer>

      <Modal
        isOpen={modalSesionExpirada}
        backdrop="static"
        centered
        labelledBy="mission-modal-title"
        modalClassName="mission-modal"
        backdropClassName="mission-modal-backdrop"
        className="mission-modal__dialog"
        contentClassName="mission-modal__content"
      >
        <ModalHeader className="mission-modal__header" tag="div">
          <p className="eyebrow">Protocolo de emergencia</p>
          <h2 className="mission-modal__title" id="mission-modal-title">
            Ventana de lanzamiento cerrada
          </h2>
        </ModalHeader>

        <ModalBody className="mission-modal__body">
          <span className="mission-modal__mark" aria-hidden="true">
            !
          </span>
          <p>
            El tiempo de preparación del transbordador ha concluido y la sesión
            ha expirado.
          </p>
          <p className="mission-modal__note">
            Toda la carga fue desembarcada automáticamente para evitar sobrepeso
            crítico.
          </p>
        </ModalBody>

        <ModalFooter className="mission-modal__footer">
          <button
            type="button"
            className="button-primary"
            disabled={reiniciando}
            onClick={reiniciarSesion}
          >
            {reiniciando ? 'Iniciando...' : 'Iniciar nueva misión'}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

export default App
