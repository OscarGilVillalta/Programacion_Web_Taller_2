const express = require('express');
const router = express.Router();

const {
    TemperaturaEstabilizacion,
    IniciarTemperatura
} = require('../controllers/controllerTemperatura')

router.post('/adjust', TemperaturaEstabilizacion);
router.post('/reboot', IniciarTemperatura)

module.exports = router;