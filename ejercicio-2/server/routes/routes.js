const express = require('express');
const router = express.Router();

const {
    listarInventario,
    mostrarCarga,
    agregarCarga,
    actualizarUnidades,
    eliminarCarga
} = require('../controllers/controllerLogistica.js');

router.get('/inventario', listarInventario);
router.get('/carga', mostrarCarga);
router.post('/carga/agregar', agregarCarga);
router.put('/carga/actualizar-unidades/:id', actualizarUnidades);
router.delete('/carga/eliminar/:id', eliminarCarga);

module.exports = router;
