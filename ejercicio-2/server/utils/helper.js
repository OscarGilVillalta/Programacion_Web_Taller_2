const { inventario, cargaNave, timerLanzamiento } = require('../data/moldeInventario');

// Declarar tiempo limite en milisegundos
const tiempoLimite = 300000;

// Asegurarse de que se este dentro del limite de tiempo
const tiempoLanzamientoActivo = () => {
    const tiempoTranscurrido = Date.now() - timerLanzamiento;
    return tiempoTranscurrido < tiempoLimite;
};

// Calcular el costo del proceso donde se utilice esta funcion
const calcularTotalProyectado = (idSuministro, nuevaCantidad) => {
    return cargaNave.itemsCargados.reduce((sum, item) => {
        const suministro = inventario.find(i => i.id === item.id);
        if (!suministro) return sum;
        if (item.id === idSuministro) {
        return sum + (suministro.precio * nuevaCantidad);
        }
        return sum + (suministro.precio * item.cantidad);
    }, 0);
};

// Validar si hay suficiente stock de un articulo para cargar
const tieneStockSuficiente = (id, cantidadRequerida) => {
    const suministro = inventario.find(i => i.id === id);
    if (!suministro) return false;
    return suministro.stock >= cantidadRequerida;
};

// Validar si el usuario tiene suficientes creditos para agregar suministros a la carga
const alcanzaCreditoParaAgregar = (id, cantidadAAgregar) => {
    const suministro = inventario.find(i => i.id === id);
    if (!suministro) return false;
    const costoAdicional = suministro.precio * cantidadAAgregar;
    return (cargaNave.total + costoAdicional) <= cargaNave.creditos;
};

// Validar si el usuario tiene suficientes creditos para actualizar la cantidad de suministros
const alcanzaCreditoParaActualizar = (id, nuevaCantidad) => {
    const totalProyectado = calcularTotalProyectado(id, nuevaCantidad);
    return totalProyectado <= cargaNave.creditos;
};

module.exports = {
    tiempoLanzamientoActivo,
    tieneStockSuficiente,
    alcanzaCreditoParaAgregar,
    alcanzaCreditoParaActualizar
};
