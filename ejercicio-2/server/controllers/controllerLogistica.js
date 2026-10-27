const data = require('../data/moldeInventario.js');
const helper = require('../utils/helper.js');

const forzarCierreSesion = () => {
    data.cargaNave.itemsCargados.forEach(item => {
        const suministro = data.inventario.find(i => i.id === item.id);
        if (suministro) suministro.stock += item.cantidad;
    });
    data.cargaNave.itemsCargados = [];
    data.cargaNave.total = 0.00;
};

const actualizarTotalCarga = () => {
    data.cargaNave.total = data.cargaNave.itemsCargados.reduce((sum, item) => {
        const suministro = data.inventario.find(i => i.id === item.id);
        return sum + (suministro ? suministro.precio * item.cantidad : 0);
    }, 0);
};

// Listar suministro
const listarInventario = (req, res) => {
    if (!helper.tiempoLanzamientoActivo()) {
        forzarCierreSesion();
        return res.status(401).json({ 
            mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
        });
    }
    res.status(200).json(data.inventario);
};

// Mostrar carga actual
const mostrarCarga = (req, res) => {
    if (!helper.tiempoLanzamientoActivo()) {
        forzarCierreSesion();
        return res.status(401).json({ 
            mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
        });
    }
    res.status(200).json(data.cargaNave);
};

// Agregar carga
const agregarCarga = (req, res) => {
    if (!helper.tiempoLanzamientoActivo()) {
        forzarCierreSesion();
        return res.status(401).json({ 
            mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
        });
    }

    const { equipoId, cantidad } = req.body;
    const suministro = data.inventario.find(i => i.id === equipoId);

    if (!suministro) {
        return res.status(404).json({ mensaje: "Suministro no encontrado en el catálogo" });
    }

    if (!helper.tieneStockSuficiente(equipoId, cantidad)) {
        return res.status(400).json({ mensaje: "Stock en base insuficiente" });
    }

    if (!helper.alcanzaCreditoParaAgregar(equipoId, cantidad)) {
        return res.status(400).json({ mensaje: "Créditos insuficientes para esta cantidad" });
    }

    const itemEnCarga = data.cargaNave.itemsCargados.find(i => i.id === equipoId);
    suministro.stock -= cantidad;
  
    if (itemEnCarga) {
        itemEnCarga.cantidad += cantidad;
    } else {
        data.cargaNave.itemsCargados.push({ id: equipoId, cantidad });
    }

    actualizarTotalCarga();
    res.json({ mensaje: "Suministro agregado temporalmente", carga: data.cargaNave });
};

// Agregar mas unidades de un item en carga
const actualizarUnidades = (req, res) => {
    if (!helper.tiempoLanzamientoActivo()) {
        forzarCierreSesion();
        return res.status(401).json({ 
            mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
        });
    }

    const id = parseInt(req.params.id);
    const { cantidad } = req.body;
  
    const suministro = data.inventario.find(i => i.id === id);
    const itemEnCarga = data.cargaNave.itemsCargados.find(i => i.id === id);

    if (!itemEnCarga || !suministro) {
        return res.status(404).json({ mensaje: "El suministro no se encuentra en la carga de la nave" });
    }

    const diferencia = cantidad - itemEnCarga.cantidad;

    if (diferencia > 0 && !helper.tieneStockSuficiente(id, diferencia)) {
        return res.status(400).json({ mensaje: "Stock en base insuficiente" });
    }

    if (!helper.alcanzaCreditoParaActualizar(id, cantidad)) {
        return res.status(400).json({ mensaje: "Créditos insuficientes para esta cantidad" });
    }

    suministro.stock -= diferencia;
    itemEnCarga.cantidad = cantidad;

    if (itemEnCarga.cantidad <= 0) {
        data.cargaNave.itemsCargados = data.cargaNave.itemsCargados.filter(i => i.id !== id);
    }

    actualizarTotalCarga();
    res.json({ mensaje: "Cantidad de unidades actualizada con éxito", carga: data.cargaNave });
};

// Eliminar un item de la carga de la nave
const eliminarCarga = (req, res) => {
    if (!helper.tiempoLanzamientoActivo()) {
        forzarCierreSesion();
        return res.status(401).json({ 
            mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
        });
    }

    const id = parseInt(req.params.id);
    const suministro = data.inventario.find(i => i.id === id);
    const itemEnCarga = data.cargaNave.itemsCargados.find(i => i.id === id);

    if (!itemEnCarga) {
        return res.status(404).json({ mensaje: "El suministro no esta en la nave" });
    }

    if (suministro) {
        suministro.stock += itemEnCarga.cantidad;
    }
    data.cargaNave.itemsCargados = data.cargaNave.itemsCargados.filter(i => i.id !== id);

    actualizarTotalCarga();
    res.json({ mensaje: "Suministro eliminado de la carga y devuelto a la base", carga: data.cargaNave });
};

const obtenerTiempo = (req, res) => {
    const segundos = helper.obtenerSegundosRestantes();
    res.json({ segundosRestantes: segundos });
};


const reiniciarSesion = (req, res) => {
    data.timerLanzamiento = Date.now();
    data.cargaNave.itemsCargados = [];
    data.cargaNave.total = 0.00;
    res.json({ mensaje: "Nueva ventana de lanzamiento abierta.", carga: data.cargaNave });
};

const confirmarCarga = (req, res) => {
    if (!helper.tiempoLanzamientoActivo()) {
        forzarCierreSesion();
        return res.status(401).json({ 
            mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
        });
    }

    if (data.cargaNave.itemsCargados.length === 0) {
        return res.status(400).json({ mensaje: "No se puede confirmar un cargamento sin suministros a bordo." });
    }

    res.json({ 
        mensaje: "¡Cargamento confirmado! Suministros asegurados y nave autorizada para despegar.",
        resumen: data.cargaNave 
    });
};

module.exports = {
    listarInventario,
    mostrarCarga,
    agregarCarga,
    actualizarUnidades,
    eliminarCarga,
    obtenerTiempo,
    reiniciarSesion, // Añadida para el botón del Modal
    confirmarCarga
};
