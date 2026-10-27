import { useCallback, useEffect, useState } from 'react'
import {
  actualizarUnidades as actualizarUnidadesApi,
  agregarSuministro,
  confirmarCarga as confirmarCargaApi,
  eliminarSuministro,
  obtenerCarga,
  obtenerInventario,
  reiniciarSesion as reiniciarSesionApi,
} from '../api/logistica'
import { useOperacion } from './useOperacion'
import { useTemporizadorMision } from './useTemporizadorMision'

const CARGA_INICIAL = {
  creditos: 1000,
  itemsCargados: [],
  total: 0,
  confirmada: false,
}

// Orquesta el estado y las acciones de la misión.
export function useMision() {
  const [inventario, setInventario] = useState([])
  const [carga, setCarga] = useState(CARGA_INICIAL)
  const [error, setError] = useState(null)
  const [exitoMensaje, setExitoMensaje] = useState(null)

  const {
    iniciar,
    terminar,
    bloqueado,
    cargandoId,
    confirmando,
    reiniciando,
  } = useOperacion()

  const {
    segundosRestantes,
    modalSesionExpirada,
    sincronizarReloj,
    reiniciarReloj,
    expirarSesion,
  } = useTemporizadorMision()

  const misionConfirmada = Boolean(carga.confirmada)

  const manejarErrores = useCallback((err) => {
    if (err.response) {
      if (err.response.status === 401) {
        expirarSesion()
        return
      }

      setError(err.response.data?.mensaje || 'Error desconocido.')
      return
    }

    setError('No se pudo conectar con la base de control.')
  }, [expirarSesion])

  const consultarDatosServidor = useCallback(async () => {
    try {
      const [inventarioData, cargaData] = await Promise.all([
        obtenerInventario(),
        obtenerCarga(),
      ])

      setInventario(inventarioData)
      setCarga(cargaData)
    } catch (err) {
      manejarErrores(err)
    }
  }, [manejarErrores])

  useEffect(() => {
    // La carga inicial es asíncrona: se difiere un tick para no encadenar
    // renders síncronos dentro del efecto.
    const inicio = setTimeout(() => {
      void consultarDatosServidor()
    }, 0)

    return () => clearTimeout(inicio)
  }, [consultarDatosServidor])

  const limpiarMensajes = () => {
    setError(null)
    setExitoMensaje(null)
  }

  const agregarItem = async (equipoId) => {
    if (!iniciar('agregar', equipoId)) return

    limpiarMensajes()

    try {
      await agregarSuministro(equipoId)
      await consultarDatosServidor()
    } catch (err) {
      manejarErrores(err)
    } finally {
      terminar()
    }
  }

  const eliminarItem = async (id) => {
    if (!iniciar('eliminar', id)) return

    limpiarMensajes()

    try {
      await eliminarSuministro(id)
      await consultarDatosServidor()
    } catch (err) {
      manejarErrores(err)
    } finally {
      terminar()
    }
  }

  const actualizarUnidades = async (id, nuevaCantidad) => {
    if (nuevaCantidad === 0) {
      await eliminarItem(id)
      return
    }

    if (!iniciar('actualizar', id)) return

    limpiarMensajes()

    try {
      await actualizarUnidadesApi(id, nuevaCantidad)
      await consultarDatosServidor()
    } catch (err) {
      manejarErrores(err)
    } finally {
      terminar()
    }
  }

  const confirmarCarga = async () => {
    if (!iniciar('confirmar')) return

    limpiarMensajes()

    try {
      const data = await confirmarCargaApi()

      setCarga(data.carga)
      setExitoMensaje(
        `${data.mensaje} Total asegurado: ${data.resumen.total} Cr. ` +
        `Créditos restantes: ${data.resumen.creditosRestantes} Cr.`,
      )

      await consultarDatosServidor()
    } catch (err) {
      manejarErrores(err)
    } finally {
      terminar()
    }
  }

  const reiniciarSesion = async () => {
    if (!iniciar('reiniciar')) return

    limpiarMensajes()

    try {
      await reiniciarSesionApi()
      reiniciarReloj()
      await consultarDatosServidor()
      await sincronizarReloj()
    } catch (err) {
      manejarErrores(err)
    } finally {
      terminar()
    }
  }

  return {
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
    cerrarError: () => setError(null),
    cerrarExito: () => setExitoMensaje(null),
    agregarItem,
    actualizarUnidades,
    eliminarItem,
    confirmarCarga,
    reiniciarSesion,
  }
}
