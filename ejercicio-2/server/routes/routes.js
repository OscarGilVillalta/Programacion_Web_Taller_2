const express = require('express');
const router = express.Router();

const {
    listarInventario,
    mostrarCarga,
    agregarCarga,
    actualizarUnidades,
    eliminarCarga,
    obtenerTiempo,
    confirmarCarga
} = require('../controllers/controllerLogistica.js');

router.get('/inventario', listarInventario);
router.get('/carga', mostrarCarga);
router.post('/carga/agregar', agregarCarga);
router.put('/carga/actualizar-unidades/:id', actualizarUnidades);
router.delete('/carga/eliminar/:id', eliminarCarga);
router.get('/sesion/tiempo', obtenerTiempo);
router.post('/carga/confirmar', confirmarCarga);

module.exports = router;
