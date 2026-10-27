import { useRef, useState } from 'react'

// Centraliza el bloqueo de operaciones para evitar peticiones simultáneas.
export function useOperacion() {
  const [operacion, setOperacion] = useState(null)
  const bloqueoRef = useRef(false)

  const iniciar = (tipo, id = null) => {
    if (bloqueoRef.current) return false

    bloqueoRef.current = true
    setOperacion({ tipo, id })
    return true
  }

  const terminar = () => {
    bloqueoRef.current = false
    setOperacion(null)
  }

  return {
    operacion,
    iniciar,
    terminar,
    bloqueado: operacion !== null,
    cargandoId: operacion?.id ?? null,
    confirmando: operacion?.tipo === 'confirmar',
    reiniciando: operacion?.tipo === 'reiniciar',
  }
}
