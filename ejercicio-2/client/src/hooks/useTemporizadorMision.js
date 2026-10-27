import { useCallback, useEffect, useState } from 'react'
import { obtenerTiempo } from '../api/logistica'

const SEGUNDOS_INICIALES = 300

// Gestiona la cuenta regresiva y la sincronización con el reloj del backend.
export function useTemporizadorMision() {
  const [segundosRestantes, setSegundosRestantes] = useState(SEGUNDOS_INICIALES)
  const [modalSesionExpirada, setModalSesionExpirada] = useState(false)

  const sincronizarReloj = useCallback(async () => {
    try {
      const { segundosRestantes: segundosServidor } = await obtenerTiempo()
      setSegundosRestantes(segundosServidor)

      if (segundosServidor <= 0) {
        setModalSesionExpirada(true)
      }
    } catch {
      console.error('Error sincronizando el reloj de la misión.')
    }
  }, [])

  const expirarSesion = useCallback(() => {
    setSegundosRestantes(0)
    setModalSesionExpirada(true)
  }, [])

  const reiniciarReloj = useCallback(() => {
    setSegundosRestantes(SEGUNDOS_INICIALES)
    setModalSesionExpirada(false)
  }, [])

  useEffect(() => {
    // La primera sincronización se difiere un tick para no encadenar
    // renders síncronos dentro del efecto.
    const arranque = setTimeout(() => {
      void sincronizarReloj()
    }, 0)

    const cronometro = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          setModalSesionExpirada(true)
          return 0
        }

        return prev - 1
      })
    }, 1000)

    const sincronizacion = setInterval(() => {
      void sincronizarReloj()
    }, 10000)

    return () => {
      clearTimeout(arranque)
      clearInterval(cronometro)
      clearInterval(sincronizacion)
    }
  }, [sincronizarReloj])

  return {
    segundosRestantes,
    modalSesionExpirada,
    sincronizarReloj,
    reiniciarReloj,
    expirarSesion,
  }
}
