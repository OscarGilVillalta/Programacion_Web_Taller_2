const data = require('../data/moldeInventario.js');
const helper = require('../utils/helper.js');

// Validaciones de cantidades e identificadores
const esEnteroPositivo = (valor) => Number.isInteger(valor) && valor > 0;
const esEnteroNoNegativo = (valor) => Number.isInteger(valor) && valor >= 0;

const rechazarSiMisionConfirmada = (res) => {
    if (!data.cargaNave.confirmada) return false;

    res.status(409).json({
        mensaje: "La misión ya fue confirmada. Reinicie para abrir una nueva ventana."
    });
    return true;
};

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

    const { equipoId, cantidad } = req.body ?? {};

    if (rechazarSiMisionConfirmada(res)) return;

    if (!esEnteroPositivo(equipoId)) {
        return res.status(400).json({ mensaje: "Identificador de suministro inválido. Debe ser un entero positivo." });
    }

    if (!esEnteroPositivo(cantidad)) {
        return res.status(400).json({ mensaje: "Cantidad inválida. Debe ser un entero mayor que cero." });
    }

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

    const id = Number(req.params.id);
    const { cantidad } = req.body ?? {};

    if (rechazarSiMisionConfirmada(res)) return;

    if (!esEnteroPositivo(id)) {
        return res.status(400).json({ mensaje: "Identificador de suministro inválido. Debe ser un entero positivo." });
    }

    if (!esEnteroNoNegativo(cantidad)) {
        return res.status(400).json({ mensaje: "Cantidad inválida. Debe ser un entero mayor o igual a cero." });
    }

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

    if (rechazarSiMisionConfirmada(res)) return;

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
    // Devuelve al inventario todo lo cargado antes de abrir una nueva ventana
    forzarCierreSesion();
    data.cargaNave.creditos = data.CREDITOS_INICIALES;
    data.cargaNave.confirmada = false;
    data.timerLanzamiento = Date.now();
    res.json({ mensaje: "Nueva ventana de lanzamiento abierta.", carga: data.cargaNave });
};

const confirmarCarga = (req, res) => {
    if (!helper.tiempoLanzamientoActivo()) {
        forzarCierreSesion();
        return res.status(401).json({ 
            mensaje: "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." 
        });
    }

    if (rechazarSiMisionConfirmada(res)) return;

    if (data.cargaNave.itemsCargados.length === 0) {
        return res.status(400).json({ mensaje: "No se puede confirmar un cargamento sin suministros a bordo." });
    }

    const totalConfirmado = Number(data.cargaNave.total.toFixed(2));
    const itemsConfirmados = data.cargaNave.itemsCargados.map(item => ({ ...item }));

    data.cargaNave.creditos = Number((data.cargaNave.creditos - totalConfirmado).toFixed(2));
    data.cargaNave.itemsCargados = [];
    data.cargaNave.total = 0.00;
    data.cargaNave.confirmada = true;

    res.json({ 
        mensaje: "¡Cargamento confirmado! Suministros asegurados y nave autorizada para despegar.",
        resumen: {
            itemsCargados: itemsConfirmados,
            total: totalConfirmado,
            creditosRestantes: data.cargaNave.creditos
        },
        carga: data.cargaNave
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
