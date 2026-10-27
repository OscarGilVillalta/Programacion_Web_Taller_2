import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import HeaderMision from './components/HeaderMision';
import CatalogoBase from './components/CatalogoBase';
import BodegaCarga from './components/BodegaCarga';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [inventario, setInventario] = useState([]);
  const [carga, setCarga] = useState({ creditos: 500, itemsCargados: [], total: 0 });
  const [error, setError] = useState(null);
  const [cargandoId, setCargandoId] = useState(null); // Para el estado "Calculando peso..."
  const [modalSesionExpirada, setModalSesionExpirada] = useState(false);

  // Carga inicial de datos desde Express
  const consultarDatosServidor = async () => {
    try {
      const resInventario = await axios.get(`${API_URL}/inventario`);
      const resCarga = await axios.get(`${API_URL}/carga`);
      setInventario(resInventario.data);
      setCarga(resCarga.data);
    } catch (err) {
      manejarErroresGlobales(err);
    }
  };

  useEffect(() => {
    consultarDatosServidor();
  }, []);

  // Captura centralizada de códigos 400 y 401 (Timer expirado)
  const manejarErroresGlobales = (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        setModalSesionExpirada(true);
      } else {
        setError(err.response.data.mensaje || "Error desconocido en el espacio.");
      }
    } else {
      setError("No se pudo conectar con la base de control de AstroLogistics.");
    }
    setCargandoId(null);
  };

  // Endpoint 3: Agregar suministro
  const handleAgregarItem = async (equipoId) => {
    setCargandoId(equipoId); // Activa interacción didáctica
    setError(null);
    try {
      await axios.post(`${API_URL}/carga/agregar`, { equipoId, cantidad: 1 });
      await consultarDatosServidor(); // Sincroniza stocks y totales en tiempo real
    } catch (err) {
      manejarErroresGlobales(err);
    } finally {
      setCargandoId(null);
    }
  };

  // Endpoint 4: Subir/Bajar unidades desde los botones +/-
  const handleActualizarUnidades = async (id, nuevaCantidad) => {
    if (nuevaCantidad === 0) {
      handleEliminarItem(id);
      return;
    }
    setCargandoId(id); // Activa interacción didáctica
    setError(null);
    try {
      await axios.put(`${API_URL}/carga/actualizar-unidades/${id}`, { cantidad: nuevaCantidad });
      await consultarDatosServidor();
    } catch (err) {
      manejarErroresGlobales(err);
    } finally {
      setCargandoId(null);
    }
  };

  // Endpoint 5: Eliminar del manifiesto (Desembarcar)
  const handleEliminarItem = async (id) => {
    setCargandoId(id);
    setError(null);
    try {
      await axios.delete(`${API_URL}/carga/eliminar/${id}`);
      await consultarDatosServidor();
    } catch (err) {
      manejarErroresGlobales(err);
    } finally {
      setCargandoId(null);
    }
  };

  // Resetea el backend cuando la ventana de lanzamiento se vence
  const handleReiniciarSesion = async () => {
    try {
      await axios.post(`${API_URL}/sesion/reiniciar`);
      setModalSesionExpirada(false);
      setError(null);
      await consultarDatosServidor();
    } catch (err) {
      setError("Error crítico al intentar reabrir la ventana.");
    }
  };

  return (
    <Container className="py-4">
      <HeaderMision 
        creditos={carga.creditos} 
        total={carga.total} 
        error={error} 
        onDismissError={() => setError(null)} 
      />

      <Row>
        {/* Sección Izquierda: Catálogo */}
        <Col md="8" xs="12">
          <CatalogoBase 
            inventario={inventario} 
            onAgregarItem={handleAgregarItem} 
            cargandoId={cargandoId} 
          />
        </Col>

        {/* Sección Derecha: Panel Lateral */}
        <Col md="4" xs="12">
          <BodegaCarga 
            itemsCargados={carga.itemsCargados} 
            inventario={inventario}
            onActualizarUnidades={handleActualizarUnidades}
            onEliminarItem={handleEliminarItem}
            cargandoId={cargandoId}
          />
        </Col>
      </Row>

      {/* Modal Interactivo para sesión cerrada por ventana de lanzamiento */}
      <Modal isOpen={modalSesionExpirada} backdrop="static" centered>
        <ModalHeader className="bg-danger text-white">⚠️ ¡Ventana de Lanzamiento Cerrada!</ModalHeader>
        <ModalBody className="text-center py-4">
          <p className="fs-5">El tiempo de preparación del transbordador espacial ha concluido y tu sesión ha expirado.</p>
          <p className="text-muted">Toda la carga ha sido desembarcada automáticamente para evitar sobrepeso crítico.</p>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" block onClick={handleReiniciarSesion}>
            Iniciar Nueva Misión (Abrir Ventana)
          </Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}

export default App;
