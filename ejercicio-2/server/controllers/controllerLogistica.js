const {inventario, cargaNave, timerLanzamiento} = require ('../data/moldeInventario.js');
const helper = require ('../utils/helper.js');

const forzarCierreSesion = () => {
  // Devolver todo el stock a la base espacial
    data.cargaNave.itemsCargados.forEach(item => {
        const suministro = data.inventario.find(i => i.id === item.id);
        if (suministro) suministro.stock += item.cantidad;
    });
  // Resetear la nave
    data.cargaNave.itemsCargados = [];
    data.cargaNave.total = 0.00;
};

const actualizarTotalCarga = () => {
    cargaNave.total = cargaNave.itemsCargados.reduce((sum, item) => {
        const suministro = inventario.find(i => i.id === item.id);
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

    res.status(200).json(inventario);
}

// Mostrar carga actual
const mostrarCarga = (req, res) => {

    if (!helper.tiempoLanzamientoActivo()) {
    forzarCierreSesion();
    return res.status(401).json({ 
        mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
    });
    }

    res.status(200).json(cargaNave)
}

// Agregar carga
const agregarCarga = (req, res) => {

    if (!helper.tiempoLanzamientoActivo()) {
    forzarCierreSesion();
    return res.status(401).json({ 
        mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
    });
    }

    const { equipoId, cantidad } = req.body;
    const suministro = inventario.find(i => i.id === equipoId);

    if (!suministro) {
        return res.status(404).json({ mensaje: "Suministro no encontrado en el catálogo" });
    }

    if (!helper.tieneStockSuficiente(equipoId, cantidad)) {
        return res.status(400).json({ mensaje: "Stock en base insuficiente" });
    }

    if (!helper.alcanzaCreditoParaAgregar(equipoId, cantidad)) {
        return res.status(400).json({ mensaje: "Créditos insuficientes para esta cantidad" });
    }


    const itemEnCarga = cargaNave.itemsCargados.find(i => i.id === equipoId);
    suministro.stock -= cantidad;
  
    if (itemEnCarga) {
        itemEnCarga.cantidad += cantidad;
    } else {
        cargaNave.itemsCargados.push({ id: equipoId, cantidad });
    }

    actualizarTotalCarga();
    res.json({ mensaje: "Suministro agregado temporalmente", carga: cargaNave });
}

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
  
    const suministro = inventario.find(i => i.id === id);
    const itemEnCarga = cargaNave.itemsCargados.find(i => i.id === id);

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
        cargaNave.itemsCargados = cargaNave.itemsCargados.filter(i => i.id !== id);
    }

    actualizarTotalCarga();
    res.json({ mensaje: "Cantidad de unidades actualizada con éxito", carga: cargaNave });
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
    const suministro = inventario.find(i => i.id === id);
    const itemEnCarga = cargaNave.itemsCargados.find(i => i.id === id);

    if (!itemEnCarga) {
        return res.status(404).json({ mensaje: "El suministro no esta en la nave" });
    }

    if (suministro) {
        suministro.stock += itemEnCarga.cantidad;
    }
    cargaNave.itemsCargados = cargaNave.itemsCargados.filter(i => i.id !== id);

    actualizarTotalCarga();
    res.json({ mensaje: "Suministro eliminado de la carga y devuelto a la base", carga: cargaNave });
};

module.exports = {
    listarInventario,
    mostrarCarga,
    agregarCarga,
    actualizarUnidades,
    eliminarCarga
}