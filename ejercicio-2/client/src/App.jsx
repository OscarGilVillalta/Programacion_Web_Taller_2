import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import HeaderMision from './components/HeaderMision';
import CatalogoBase from './components/CatalogoBase';
import BodegaCarga from './components/BodegaCarga';
import { useMision } from './hooks/useMision';

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
  } = useMision();

  return (
    <Container className="py-4">
      <HeaderMision
        creditos={carga.creditos}
        total={carga.total}
        error={error}
        onDismissError={cerrarError}
        tiempo={segundosRestantes}
      />

      {exitoMensaje && (
        <Alert color="success" className="mb-4 shadow-sm" toggle={cerrarExito}>
          {exitoMensaje}
        </Alert>
      )}

      <Row>
        <Col md="8" xs="12">
          <CatalogoBase
            inventario={inventario}
            onAgregarItem={agregarItem}
            cargandoId={cargandoId}
            bloqueado={bloqueado}
            misionConfirmada={misionConfirmada}
          />
        </Col>
        <Col md="4" xs="12">
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
        </Col>
      </Row>

      <Modal isOpen={modalSesionExpirada} backdrop="static" centered>
        <ModalHeader className="bg-danger text-white">⚠️ ¡Ventana de Lanzamiento Cerrada!</ModalHeader>
        <ModalBody className="text-center py-4">
          <p className="fs-5">El tiempo de preparación del transbordador espacial ha concluido y tu sesión ha expirado.</p>
          <p className="text-muted">Toda la carga ha sido desembarcada automáticamente para evitar sobrepeso crítico.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" block disabled={reiniciando} onClick={reiniciarSesion}>
            {reiniciando ? 'Iniciando...' : 'Iniciar Nueva Misión'}
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}

export default App;
