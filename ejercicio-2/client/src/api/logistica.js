import axios from 'axios'

// Por defecto usamos /api para pasar por el proxy de Vite.
// VITE_API_URL permite apuntar a un backend distinto.
const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

export const obtenerInventario = async () =>
  (await api.get('/inventario')).data

export const obtenerCarga = async () =>
  (await api.get('/carga')).data

export const agregarSuministro = async (equipoId, cantidad = 1) =>
  (await api.post('/carga/agregar', { equipoId, cantidad })).data

export const actualizarUnidades = async (id, cantidad) =>
  (await api.put(`/carga/actualizar-unidades/${id}`, { cantidad })).data

export const eliminarSuministro = async (id) =>
  (await api.delete(`/carga/eliminar/${id}`)).data

export const obtenerTiempo = async () =>
  (await api.get('/sesion/tiempo')).data

export const confirmarCarga = async () =>
  (await api.post('/carga/confirmar')).data

export const reiniciarSesion = async () =>
  (await api.post('/sesion/reiniciar')).data
