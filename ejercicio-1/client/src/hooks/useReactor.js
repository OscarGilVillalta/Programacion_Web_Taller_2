import { useState } from 'react'
import { ajustarTemperatura, reiniciarReactor } from '../api/temperatura.js'

const ESTADO_ESTABILIZADO = 'estabilizado'
const ESTADOS_VALIDOS = new Set(['mas_alta', 'mas_baja', ESTADO_ESTABILIZADO])

function crearId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID()
  }

  const marcaTemporal = Date.now()
  const sufijoAleatorio = Math.random().toString(16).slice(2)

  return `${marcaTemporal}-${sufijoAleatorio}`
}

function esIntentoFallido(intento) {
  return intento.estado !== ESTADO_ESTABILIZADO
}

function esIntentoGanador(intento) {
  return intento.estado === ESTADO_ESTABILIZADO
}

export function useReactor() {
  const [valor, setValor] = useState('')
  const [historial, setHistorial] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [estabilizado, setEstabilizado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [reiniciando, setReiniciando] = useState(false)

  const intentosFallidos = historial.filter(esIntentoFallido)
  const intentoGanador = historial.find(esIntentoGanador) ?? null
  const estadoNucleo = estabilizado
    ? 'estabilizado'
    : mensaje || error
      ? 'alerta'
      : 'reposo'

  function cambiarValor(nuevoValor) {
    setValor(nuevoValor)

    if (error) {
      setError('')
    }
  }

  async function enviarIntento() {
    if (enviando || estabilizado || reiniciando) {
      return
    }

    const temperatura = Number(valor)

    if (
      valor.trim() === '' ||
      !Number.isInteger(temperatura) ||
      temperatura < 1 ||
      temperatura > 100
    ) {
      setError('Introduce un número entero entre 1 y 100.')
      return
    }

    setError('')
    setMensaje('')
    setEnviando(true)

    try {
      const data = await ajustarTemperatura(temperatura)

      if (!ESTADOS_VALIDOS.has(data?.status)) {
        setError('El servidor devolvió una respuesta inesperada.')
        return;
      }
      
      setHistorial((previos) => [
        {
          id: crearId(),
          numero: previos.length + 1,
          valor: temperatura,
          estado: data.status,
          mensaje: data.message ?? '',
        },
        ...previos,
      ])
      setValor('')

      if (data.status === ESTADO_ESTABILIZADO) {
        setEstabilizado(true)
        setMensaje('')
      } else {
        setMensaje(data.message ?? 'El núcleo necesita otro ajuste.')
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo completar el intento.',
      )
    } finally {
      setEnviando(false)
    }
  }

  async function reiniciar() {
    if (reiniciando || enviando) {
      return
    }

    setReiniciando(true)
    setError('')

    try {
      await reiniciarReactor()
      setValor('')
      setHistorial([])
      setMensaje('')
      setEstabilizado(false)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo reiniciar el reactor.',
      )
    } finally {
      setReiniciando(false)
    }
  }

  return {
    valor,
    historial,
    mensaje,
    estabilizado,
    enviando,
    error,
    reiniciando,
    intentosFallidos,
    intentoGanador,
    estadoNucleo,
    totalIntentos: historial.length,
    cambiarValor,
    enviarIntento,
    reiniciar,
  }
}