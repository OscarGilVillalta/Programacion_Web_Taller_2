import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert } from 'reactstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import HeaderMision from './components/HeaderMision';
import CatalogoBase from './components/CatalogoBase';
import BodegaCarga from './components/BodegaCarga';

const API_URL = 'http://localhost:3000/api';

function App() {
  const [inventario, setInventario] = useState([]); //  Inicializado como arreglo vacío
  const [carga, setCarga] = useState({ creditos: 500, itemsCargados: [], total: 0 }); //  Arreglado itemsCargados
  const [error, setError] = useState(null);
  const [exitoMensaje, setExitoMensaje] = useState(null); // Alerta de éxito
  const [cargandoId, setCargandoId] = useState(null);
  const [modalSesionExpirada, setModalSesionExpirada] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(300); // 5 minutos base

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

  // Consulta el reloj del backend para evitar desfases
  const sincronizarReloj = async () => {
    try {
      const resTiempo = await axios.get(`${API_URL}/sesion/tiempo`);
      setSegundosRestantes(resTiempo.data.segundosRestantes);
      if (resTiempo.data.segundosRestantes <= 0) {
        setModalSesionExpirada(true);
      }
    } catch (err) {
      console.error("Error sincronizando reloj espacial.");
    }
  };

  useEffect(() => {
    consultarDatosServidor();
    sincronizarReloj();

    // Cuenta regresiva visual local cada segundo
    const cronometro = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          setModalSesionExpirada(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Sincroniza de forma dura con el backend cada 10 segundos por seguridad
    const syncDura = setInterval(sincronizarReloj, 10000);

    return () => {
      clearInterval(cronometro);
      clearInterval(syncDura);
    };
  }, []);

  const manejarErroresGlobales = (err) => {
    if (err.response) {
      if (err.response.status === 401) {
        setModalSesionExpirada(true);
      } else {
        setError(err.response.data.mensaje || "Error desconocido.");
      }
    } else {
      setError("No se pudo conectar con la base de control.");
    }
    setCargandoId(null);
  };

  const handleAgregarItem = async (equipoId) => {
    setCargandoId(equipoId);
    setError(null);
    setExitoMensaje(null);
    try {
      await axios.post(`${API_URL}/carga/agregar`, { equipoId, cantidad: 1 });
      await consultarDatosServidor();
    } catch (err) {
      manejarErroresGlobales(err);
    } finally {
      setCargandoId(null);
    }
  };

  const handleActualizarUnidades = async (id, nuevaCantidad) => {
    if (nuevaCantidad === 0) {
      handleEliminarItem(id);
      return;
    }
    setCargandoId(id);
    setError(null);
    setExitoMensaje(null);
    try {
      await axios.put(`${API_URL}/carga/actualizar-unidades/${id}`, { cantidad: nuevaCantidad });
      await consultarDatosServidor();
    } catch (err) {
      manejarErroresGlobales(err);
    } finally {
      setCargandoId(null);
    }
  };

  const handleEliminarItem = async (id) => {
    setCargandoId(id);
    setError(null);
    setExitoMensaje(null);
    try {
      await axios.delete(`${API_URL}/carga/eliminar/${id}`);
      await consultarDatosServidor();
    } catch (err) {
      manejarErroresGlobales(err);
    } finally {
      setCargandoId(null);
    }
  };

  // Ejecuta la confirmación del manifiesto
  const handleConfirmarCarga = async () => {
    setError(null);
    setExitoMensaje(null);
    try {
      const res = await axios.post(`${API_URL}/carga/confirmar`);
      setExitoMensaje(res.data.mensaje);
      await consultarDatosServidor();
    } catch (err) {
      manejarErroresGlobales(err);
    }
  };

  const handleReiniciarSesion = async () => {
    try {
      await axios.post(`${API_URL}/sesion/reiniciar`);
      setModalSesionExpirada(false);
      setError(null);
      setExitoMensaje(null);
      await consultarDatosServidor();
      await sincronizarReloj();
    } catch (err) {
      setError("Error crítico al reiniciar la misión.");
    }
  };

  return (
    <Container className="py-4">
      <HeaderMision 
        creditos={carga.creditos} 
        total={carga.total} 
        error={error} 
        onDismissError={() => setError(null)} 
        tiempo={segundosRestantes}
      />

      {exitoMensaje && (
        <Alert color="success" className="mb-4 shadow-sm">
          {exitoMensaje}
        </Alert>
      )}

      <Row>
        <Col md="8" xs="12">
          <CatalogoBase inventario={inventario} onAgregarItem={handleAgregarItem} cargandoId={cargandoId} />
        </Col>
        <Col md="4" xs="12">
          <BodegaCarga 
            itemsCargados={carga.itemsCargados} 
            inventario={inventario}
            onActualizarUnidades={handleActualizarUnidades}
            onEliminarItem={handleEliminarItem}
            onConfirmarCarga={handleConfirmarCarga}
            cargandoId={cargandoId}
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
          <Button color="primary" block onClick={handleReiniciarSesion}>Iniciar Nueva Misión</Button>
        </ModalFooter>
      </Modal>
    </Container>
  );
}

export default App;
