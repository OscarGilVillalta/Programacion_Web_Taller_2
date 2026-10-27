# AstroLogistics — Misión de carga

Aplicación web full stack para preparar la carga de un transbordador espacial dentro de una ventana de lanzamiento de 5 minutos. El usuario consulta el catálogo de la base, agrega suministros a la nave, ajusta cantidades, desembarca ítems y confirma el cargamento antes de que el temporizador llegue a cero.

El proyecto está dividido en dos aplicaciones:

- `server/`: API REST con Express, estado en memoria y reglas de negocio.
- `client/`: interfaz React con Vite, Reactstrap y Bootstrap.

> **Importante:** este documento describe el código **actual**. Los errores críticos, medios y menores detectados en las revisiones anteriores ya fueron corregidos. La lógica de negocio del cliente está centralizada en `client/src/hooks/` y la API tiene tests de integración automatizados. Las limitaciones que permanecen son de alcance del proyecto, no errores pendientes.

---

## Estado del proyecto

La aplicación arranca, compila y los flujos principales funcionan de punta a punta. Las fases 1, 2 y 3 de corrección están completadas:

- `POST /api/sesion/reiniciar` está registrado y el botón **Iniciar Nueva Misión** funciona.
- El temporizador se reinicia correctamente tras la expiración de los 5 minutos.
- Las cantidades se validan como enteros y ya no permiten stock negativo, inflado ni concatenación de strings.
- El reinicio devuelve al inventario todo el stock de la carga no confirmada.
- La bodega incluye un botón **Confirmar cargamento** conectado a la API.
- La confirmación descuenta créditos, vacía la carga, marca la misión como `confirmada` y bloquea nuevas mutaciones con `409`.
- El inventario incluye `categoria`, por lo que el badge del catálogo ya se muestra.
- Las rutas inexistentes, el JSON malformado y los errores internos responden siempre en JSON.
- El cliente usa una capa HTTP centralizada (`src/api/logistica.js`) y el proxy `/api` de Vite; `App.jsx` quedó como composición visual.
- La lógica de negocio del cliente vive en `useMision`, `useOperacion` y `useTemporizadorMision`.
- El botón `+` de la bodega se deshabilita cuando no queda stock disponible en la base.
- Se eliminaron los restos de la plantilla de Vite y se corrigieron `index.html` e `index.css`.
- `server/package.json` incluye los scripts `dev` y `test`; hay 13 tests de integración de la API con `node:test`.
- `npm run lint` termina sin advertencias.

No quedan errores pendientes de las revisiones anteriores. Las limitaciones conocidas están en [Limitaciones](#limitaciones).

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19.3, Vite 8.3, Reactstrap 9.2, Bootstrap 5.3, Axios 1.21 |
| Backend | Node.js, Express 5.3, CORS 2.8 |
| Tests | `node:test` (runner integrado de Node.js) |
| Lint | Oxlint 1.88 |
| Persistencia | En memoria (no hay base de datos) |
| Estilos | Bootstrap + CSS de la plantilla de Vite |

No se usa TypeScript.

---

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm.
- Dos terminales: una para el backend y otra para el frontend.

---

## Estructura del proyecto

```text
ejercicio-2/
├─ client/
│  ├─ public/
│  │  └─ favicon.svg              # ícono propio de AstroLogistics
│  ├─ src/
│  │  ├─ api/
│  │  │  └─ logistica.js          # cliente HTTP centralizado
│  │  ├─ components/
│  │  │  ├─ BodegaCarga.jsx
│  │  │  ├─ CatalogoBase.jsx
│  │  │  └─ HeaderMision.jsx
│  │  ├─ hooks/
│  │  │  ├─ useMision.js          # orquestador principal
│  │  │  ├─ useOperacion.js       # bloqueo global de operaciones
│  │  │  └─ useTemporizadorMision.js
│  │  ├─ App.jsx                  # solo composición visual
│  │  ├─ index.css
│  │  └─ main.jsx
│  ├─ .oxlintrc.json
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
├─ server/
│  ├─ controllers/
│  │  └─ controllerLogistica.js
│  ├─ data/
│  │  └─ moldeInventario.js
│  ├─ routes/
│  │  └─ routes.js
│  ├─ test/
│  │  └─ api.test.js              # tests de integración de la API
│  ├─ utils/
│  │  └─ helper.js
│  ├─ app.js
│  └─ package.json
└─ README.md
```

---

## Instalación y ejecución

### 1. Backend

```powershell
cd ejercicio-2\server
npm install
npm start
```

El servidor queda disponible en `http://localhost:3000` por defecto. El puerto se puede cambiar con la variable `PORT`:

```powershell
$env:PORT=3001
npm start
```

Para recarga automática durante el desarrollo:

```powershell
npm run dev
```

El script `dev` usa `nodemon` y está definido en `server/package.json`.

### 2. Frontend

En otra terminal:

```powershell
cd ejercicio-2\client
npm install
npm run dev
```

Abrir `http://localhost:5173`.

El cliente llama a `/api` en el mismo origen y Vite reenvía esas peticiones al backend. La configuración por defecto apunta a `http://localhost:3000`.

Variables disponibles:

| Variable | Dónde se usa | Efecto |
| --- | --- | --- |
| `PORT` | Backend | Puerto de Express. Por defecto `3000`. |
| `VITE_API_URL` | Cliente | URL base absoluta de la API. Si no se define, se usa `/api` con el proxy. |
| `VITE_PROXY_TARGET` | Configuración de Vite | Destino del proxy `/api` en `dev` y `preview`. Por defecto `http://localhost:3000`. |

Ejemplos:

```powershell
# El frontend habla directo con un backend en otro puerto (requiere CORS)
$env:VITE_API_URL="http://localhost:3001/api"
npm run dev
```

```powershell
# El navegador sigue usando /api, pero Vite lo reenvía al puerto 3001
$env:VITE_PROXY_TARGET="http://localhost:3001"
npm run dev
```

### 3. Build de producción

```powershell
cd ejercicio-2\client
npm run build
npm run preview
```

El proxy `/api` también está configurado para `preview`, por lo que el build puede probarse contra el backend sin cambiar el código.

### 4. Lint

```powershell
cd ejercicio-2\client
npm run lint
```

### 5. Tests del backend

```powershell
cd ejercicio-2\server
npm test
```

Los tests usan el runner integrado `node:test`, levantan la app en un puerto efímero y cubren inventario, carga, validaciones, confirmación, bloqueos `409`, reinicio, errores JSON y expiración de la ventana.

---

## Arquitectura general

```text
Navegador
   │
   ▼
App.jsx  (composición visual)
   │  usa
   ▼
useMision  (estado y acciones de la misión)
   ├─ useOperacion            (bloqueo global de peticiones)
   ├─ useTemporizadorMision   (cuenta regresiva y sincronización)
   └─ api/logistica.js        (Axios, base /api)
            │
            │ HTTP /api
            ▼
Vite dev server (5173)  ──proxy /api──▶  Express (3000 por defecto)
                                           app.js
                                           ├─ cors()
                                           ├─ express.json()
                                           ├─ /api → routes.js
                                           ├─ 404 JSON
                                           └─ middleware de errores JSON
                                                    │
                                                    ▼
                                     controllerLogistica.js
                                       ├─ data/moldeInventario.js
                                       └─ utils/helper.js
                                                    │
                                                    ▼
                                     Estado en memoria (se pierde al reiniciar)
```

`App.jsx` ya no conoce URLs, no importa `axios` y no contiene `useState` ni `useEffect`. Toda la lógica y el acceso a datos pasan por `useMision` y `api/logistica.js`.

El cliente usa `/api/sesion/reiniciar` para reabrir una ventana expirada. La ruta está registrada y responde sin comprobar el temporizador, precisamente para permitir la recuperación.

---

## Backend

### `server/app.js`

Punto de entrada. Configura:

- `cors()` sin restricciones de origen.
- `express.json()` para leer cuerpos JSON.
- Montaje del router bajo el prefijo `/api`.
- Puerto configurable: `const PORT = process.env.PORT || 3000`.
- `module.exports = app` y `app.listen()` solo cuando `require.main === module`, para que los tests puedan importar la app sin abrir un puerto fijo.
- Middleware `404` que responde JSON:

```json
{ "mensaje": "Ruta no encontrada" }
```

- Middleware centralizado de errores:
  - JSON malformado (`entity.parse.failed`) → `400` con `{ "mensaje": "JSON inválido en el cuerpo de la solicitud." }`.
  - Cualquier error no controlado → `500` con `{ "mensaje": "Error interno del servidor." }`.

Todas las respuestas de error de la API usan JSON con la propiedad `mensaje`, incluidos los `404` y los `500`.

### `server/data/moldeInventario.js`

Estado global en memoria:

```js
const CREDITOS_INICIALES = 1000.00;

let inventario = [
  { id: 101, nombre: "Tanque de Oxigeno", precio: 50.00, stock: 5, categoria: "Soporte vital" },
  { id: 102, nombre: "Racion de comida", precio: 10.00, stock: 20, categoria: "Alimentación" },
  { id: 103, nombre: "Bateria", precio: 120.00, stock: 3, categoria: "Energía" },
  { id: 104, nombre: "Repuesto", precio: 80.00, stock: 4, categoria: "Mantenimiento" },
  { id: 105, nombre: "Traje espacial", precio: 50.00, stock: 10, categoria: "Equipamiento" }
];

let cargaNave = {
  creditos: CREDITOS_INICIALES,
  itemsCargados: [], // [{ id, cantidad }]
  total: 0.00,
  confirmada: false
};

let timerLanzamiento = Date.now();

module.exports = { inventario, cargaNave, timerLanzamiento, CREDITOS_INICIALES };
```

Observaciones:

- Todos los suministros tienen `categoria`, por lo que el badge del catálogo ya se muestra.
- `confirmada` indica si la misión actual ya fue cerrada con éxito.
- Los créditos iniciales del servidor y del cliente son `1000`, por lo que ya no hay inconsistencia al arrancar.
- `timerLanzamiento` es un número. `helper.js` lo lee desde el objeto del módulo en cada llamada, por lo que las reasignaciones del controlador sí se reflejan.

### `server/utils/helper.js`

Funciones auxiliares:

| Función | Descripción |
| --- | --- |
| `tiempoLanzamientoActivo()` | `Date.now() - data.timerLanzamiento < 300000` (5 minutos). |
| `obtenerSegundosRestantes()` | Segundos restantes, nunca negativos. |
| `calcularTotalProyectado(id, nuevaCantidad)` | Recalcula el total de la carga reemplazando la cantidad del ítem indicado. |
| `tieneStockSuficiente(id, cantidad)` | Comprueba `stock >= cantidad`. |
| `alcanzaCreditoParaAgregar(id, cantidad)` | Comprueba `total + precio * cantidad <= creditos`. |
| `alcanzaCreditoParaActualizar(id, cantidad)` | Usa el total proyectado y lo compara con los créditos. |

El temporizador se lee dinámicamente desde el módulo de datos:

```js
const data = require('../data/moldeInventario');
const { inventario, cargaNave } = data;

const tiempoLanzamientoActivo = () =>
  Date.now() - data.timerLanzamiento < tiempoLimite;
```

Como `data.timerLanzamiento` se consulta en cada llamada, `reiniciarSesion` puede actualizarlo y el cambio se refleja de inmediato en `tiempoLanzamientoActivo()` y `obtenerSegundosRestantes()`.

### `server/controllers/controllerLogistica.js`

Contiene la lógica de negocio y el estado derivado de la carga.

#### `forzarCierreSesion()`

Recorre `itemsCargados`, devuelve cada cantidad al stock de su suministro, vacía la carga y pone `total = 0`. Se ejecuta cuando una petición llega con la ventana cerrada, antes de responder `401`.

#### `rechazarSiMisionConfirmada(res)`

Si `cargaNave.confirmada` es `true`, responde `409` con:

```json
{ "mensaje": "La misión ya fue confirmada. Reinicie para abrir una nueva ventana." }
```

Se usa en agregar, actualizar, eliminar y confirmar. El reinicio no pasa por esta comprobación, porque es la vía para abrir una nueva misión.

#### `actualizarTotalCarga()`

Recalcula `cargaNave.total` sumando `precio * cantidad` de cada ítem cargado.

#### Endpoints

| Handler | Método y ruta | Comportamiento |
| --- | --- | --- |
| `listarInventario` | `GET /api/inventario` | Devuelve el inventario. Si la ventana está cerrada, cierra la sesión y responde `401`. |
| `mostrarCarga` | `GET /api/carga` | Devuelve `cargaNave`. Si la ventana está cerrada, `401`. |
| `agregarCarga` | `POST /api/carga/agregar` | Body `{ equipoId, cantidad }`. Responde `409` si la misión ya está confirmada. Valida que ambos sean enteros y que `cantidad > 0`; luego busca el suministro, valida stock y créditos, descuenta stock, suma o crea el ítem y recalcula el total. |
| `actualizarUnidades` | `PUT /api/carga/actualizar-unidades/:id` | Body `{ cantidad }`. Responde `409` si la misión ya está confirmada. Valida `id` como entero positivo y `cantidad` como entero `>= 0`. Calcula la diferencia con la cantidad actual, valida stock solo si aumenta, valida créditos y fija la nueva cantidad. Si queda en `0`, elimina el ítem. |
| `eliminarCarga` | `DELETE /api/carga/eliminar/:id` | Responde `409` si la misión ya está confirmada. Si existe, devuelve las unidades al stock y quita el ítem de la carga. |
| `obtenerTiempo` | `GET /api/sesion/tiempo` | Devuelve `{ segundosRestantes }`. No valida si la ventana está activa. |
| `confirmarCarga` | `POST /api/carga/confirmar` | Valida la ventana y responde `409` si ya está confirmada. Rechaza la carga vacía con `400`. Si hay ítems, descuenta los créditos, copia el resumen, vacía la carga, deja `total = 0`, marca `confirmada = true` y responde con el resumen y la carga actualizada. |
| `reiniciarSesion` | `POST /api/sesion/reiniciar` | No comprueba la ventana. Devuelve el stock de la carga no confirmada con `forzarCierreSesion()`, restablece `creditos = CREDITOS_INICIALES`, pone `confirmada = false`, reasigna `data.timerLanzamiento = Date.now()` y responde con la carga vacía. |

#### Confirmación real

La confirmación actual:

1. Verifica que la ventana esté activa.
2. Rechaza con `409` si la misión ya fue confirmada.
3. Rechaza con `400` si no hay ítems.
4. Calcula `totalConfirmado` con dos decimales.
5. Descuenta ese total de `creditos`.
6. Vacía `itemsCargados` y deja `total = 0`.
7. Marca `confirmada = true`.
8. Devuelve:

```json
{
  "mensaje": "¡Cargamento confirmado! Suministros asegurados y nave autorizada para despegar.",
  "resumen": {
    "itemsCargados": [{ "id": 101, "cantidad": 2 }],
    "total": 100,
    "creditosRestantes": 900
  },
  "carga": {
    "creditos": 900,
    "itemsCargados": [],
    "total": 0,
    "confirmada": true
  }
}
```

El stock confirmado queda consumido: no se repone al iniciar una nueva misión. Solo se devuelve el stock de la carga que todavía no fue confirmada.

#### Respuestas típicas

```json
{ "mensaje": "Suministro agregado temporalmente", "carga": { "creditos": 1000, "itemsCargados": [{ "id": 101, "cantidad": 1 }], "total": 50, "confirmada": false } }
```

```json
{ "mensaje": "Stock en base insuficiente" }
```

```json
{ "mensaje": "Créditos insuficientes para esta cantidad" }
```

```json
{ "mensaje": "Identificador de suministro inválido. Debe ser un entero positivo." }
```

```json
{ "mensaje": "Cantidad inválida. Debe ser un entero mayor que cero." }
```

```json
{ "mensaje": "Cantidad inválida. Debe ser un entero mayor o igual a cero." }
```

```json
{ "mensaje": "Ventana de lanzamiento cerrada. Sesión expirada. Inicie nuevamente de inmediato para una nueva ventana." }
```

```json
{ "mensaje": "La misión ya fue confirmada. Reinicie para abrir una nueva ventana." }
```

```json
{ "mensaje": "Ruta no encontrada" }
```

```json
{ "mensaje": "JSON inválido en el cuerpo de la solicitud." }
```

### `server/routes/routes.js`

Monta las rutas del controlador:

```js
router.get('/inventario', listarInventario);
router.get('/carga', mostrarCarga);
router.post('/carga/agregar', agregarCarga);
router.put('/carga/actualizar-unidades/:id', actualizarUnidades);
router.delete('/carga/eliminar/:id', eliminarCarga);
router.get('/sesion/tiempo', obtenerTiempo);
router.post('/sesion/reiniciar', reiniciarSesion);
router.post('/carga/confirmar', confirmarCarga);
```

---

## Frontend

### `client/src/main.jsx`

Monta `<App />` dentro de `StrictMode` e importa `index.css`. Bootstrap se importa desde `App.jsx`.

### `client/src/App.jsx`

`App.jsx` es ahora una **composición visual**. No contiene estado, efectos, llamadas HTTP ni URLs del backend. Consume un único hook:

```jsx
const {
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
  cerrarError,
  cerrarExito,
  agregarItem,
  actualizarUnidades,
  eliminarItem,
  confirmarCarga,
  reiniciarSesion,
} = useMision();
```

Responsabilidades de `App.jsx`:

- Renderizar `HeaderMision`.
- Mostrar el `Alert` verde con `exitoMensaje`.
- Renderizar `CatalogoBase` y `BodegaCarga` con sus props.
- Mostrar el modal de sesión expirada y el botón **Iniciar Nueva Misión**.

### `client/src/hooks/`

La lógica de negocio del cliente está centralizada en tres hooks.

| Hook | Responsabilidad |
| --- | --- |
| `useMision` | Inventario, carga, errores, mensajes de éxito, confirmación, reinicio y acciones del usuario. |
| `useOperacion` | Bloqueo global, prevención de dobles clics y estado de la operación activa. |
| `useTemporizadorMision` | Cuenta regresiva, sincronización con el backend, expiración y reinicio del reloj. |

#### `useMision.js`

Es el orquestador principal y el único hook que consume `App.jsx`.

Estado interno:

| Estado | Uso |
| --- | --- |
| `inventario` | Lista de suministros, inicialmente `[]`. |
| `carga` | Objeto `{ creditos, itemsCargados, total, confirmada }`. Inicialmente con `creditos: 1000`. |
| `error` | Mensaje mostrado por `HeaderMision`. |
| `exitoMensaje` | Mensaje de confirmación mostrado en el `Alert` verde. |

Hooks compuestos:

- `useOperacion`.
- `useTemporizadorMision`.

Datos derivados:

```js
const misionConfirmada = Boolean(carga.confirmada);
```

Acciones expuestas:

| Acción | Comportamiento |
| --- | --- |
| `agregarItem(id)` | Bloquea, agrega una unidad, refresca y libera. |
| `actualizarUnidades(id, cantidad)` | Si `cantidad === 0`, delega en `eliminarItem`; si no, actualiza y refresca. |
| `eliminarItem(id)` | Desembarca y refresca. |
| `confirmarCarga()` | Confirma, actualiza `carga`, guarda el resumen de éxito y refresca. |
| `reiniciarSesion()` | Reinicia el reloj, limpia mensajes, refresca, resincroniza y cierra el modal. |
| `cerrarError()` | Limpia el error. |
| `cerrarExito()` | Limpia el mensaje de éxito. |

Todas las acciones que mutan el servidor siguen el patrón:

```js
if (!iniciar('tipo', id)) return

try {
  // llamada a la API
  await consultarDatosServidor()
} catch (err) {
  manejarErrores(err)
} finally {
  terminar()
}
```

Manejo de errores:

- `401` → `expirarSesion()` y se abre el modal.
- `400` o `409` → se muestra `err.response.data.mensaje`.
- Sin respuesta → `"No se pudo conectar con la base de control."`.

#### `useOperacion.js`

Centraliza el bloqueo de operaciones para evitar peticiones simultáneas:

```js
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
```

Devuelve:

```js
{
  operacion,
  iniciar,
  terminar,
  bloqueado: operacion !== null,
  cargandoId: operacion?.id ?? null,
  confirmando: operacion?.tipo === 'confirmar',
  reiniciando: operacion?.tipo === 'reiniciar'
}
```

El `useRef` bloquea dos clics consecutivos incluso antes de que React vuelva a renderizar. Por eso ya no se pueden lanzar varias peticiones concurrentes sobre la misma carga.

#### `useTemporizadorMision.js`

Gestiona:

- La cuenta regresiva de un segundo.
- La sincronización inicial y cada 10 segundos con `GET /sesion/tiempo`.
- El estado del modal de sesión expirada.
- El reinicio local del reloj tras una nueva misión.

API del hook:

```js
{
  segundosRestantes,
  modalSesionExpirada,
  sincronizarReloj,
  reiniciarReloj,
  expirarSesion
}
```

- `expirarSesion()` pone el contador en `0` y abre el modal; se usa cuando una petición recibe `401`.
- `reiniciarReloj()` pone el contador en `300` y cierra el modal antes de volver a sincronizar con el backend.

### `client/src/api/logistica.js`

Es la única capa que conoce las rutas HTTP y la URL del backend. Mantiene la carpeta `src/api/` y usa una instancia de Axios:

```js
import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})
```

Funciones exportadas:

| Función | Petición |
| --- | --- |
| `obtenerInventario()` | `GET /inventario` |
| `obtenerCarga()` | `GET /carga` |
| `agregarSuministro(equipoId, cantidad = 1)` | `POST /carga/agregar` |
| `actualizarUnidades(id, cantidad)` | `PUT /carga/actualizar-unidades/:id` |
| `eliminarSuministro(id)` | `DELETE /carga/eliminar/:id` |
| `obtenerTiempo()` | `GET /sesion/tiempo` |
| `confirmarCarga()` | `POST /carga/confirmar` |
| `reiniciarSesion()` | `POST /sesion/reiniciar` |

Por defecto la base es `/api`, que en desarrollo pasa por el proxy de Vite. `VITE_API_URL` permite apuntar a otro backend sin cambiar el código.

### `client/vite.config.js`

Configura el proxy `/api` para `dev` y `preview`:

```js
const apiProxy = {
  '/api': {
    target: process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
    changeOrigin: true,
  },
}

export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
```

### `client/src/components/HeaderMision.jsx`

- Recibe `creditos`, `total`, `error`, `onDismissError` y `tiempo`.
- Formatea los segundos como `MM:SS`.
- Cambia el color del cronómetro a rojo cuando quedan menos de 60 segundos.
- Muestra los créditos y el costo total de la carga.
- Muestra el error dentro de un `UncontrolledAlert` con el texto "¡Violación de Restricción de Misión!".

### `client/src/components/CatalogoBase.jsx`

- Recibe `inventario`, `onAgregarItem`, `cargandoId`, `bloqueado` y `misionConfirmada`.
- Renderiza una tarjeta por suministro con nombre, categoría, precio, stock y botón.
- El badge de categoría ya muestra el valor real del backend.
- El botón se deshabilita si no hay stock, si hay una operación en curso o si la misión ya fue confirmada.
- Cuando la misión está confirmada, el botón muestra **Misión confirmada**.
- El botón `+` de la bodega se deshabilita cuando el stock en base llega a `0`; el servidor sigue validando el stock como última defensa.

### `client/src/components/BodegaCarga.jsx`

- Recibe `itemsCargados`, `inventario`, `onActualizarUnidades`, `onEliminarItem`, `onConfirmarCarga`, `onReiniciarSesion`, `cargandoId`, `confirmando`, `reiniciando`, `bloqueado` y `misionConfirmada`.
- Lista los ítems cargados con su nombre y cantidad.
- Botones `-` y `+` para cambiar de a una unidad. El `+` se deshabilita si no queda stock disponible en la base.
- Botón **Desembarcar** para eliminar el ítem.
- Mientras la misión no está confirmada, muestra **Confirmar cargamento**, deshabilitado si la bodega está vacía, hay una operación en curso o la confirmación está en proceso.
- Cuando la misión está confirmada, muestra **Nueva misión**, que llama a `reiniciarSesion`.
- Con la misión confirmada, los controles de cantidad y desembarque quedan bloqueados.

### `client/src/index.css`

- Define una base mínima: tipografía del sistema, `box-sizing`, `body` sin margen y `#root` con altura mínima.
- No impone modo oscuro, ancho fijo ni `text-align: center`.
- Bootstrap aporta los estilos de los componentes y de la mayoría de la interfaz.

### `client/index.html`

- `lang="es"`.
- Título `AstroLogistics — Misión de carga`.
- Meta descripción de la aplicación.
- Favicon propio (`/favicon.svg`), sin referencias a la plantilla de Vite.

---

## Flujo de una operación

Ejemplo: agregar un tanque de oxígeno.

1. El usuario pulsa **Añadir a la Nave** en `CatalogoBase`.
2. `useMision.agregarItem(101)` llama a `useOperacion.iniciar('agregar', 101)`.
3. `api/logistica.js` envía `POST /api/carga/agregar` con `{ equipoId: 101, cantidad: 1 }`.
4. En desarrollo, Vite recibe `/api` y lo reenvía al backend.
5. El controlador valida la ventana, la misión no confirmada, el stock y los créditos; descuenta `1` del stock y actualiza `itemsCargados`.
6. Responde con la carga actualizada.
7. `useMision` vuelve a pedir inventario y carga para reflejar el estado real.
8. `useOperacion.terminar()` libera el bloqueo y limpia `cargandoId`.

Para aumentar unidades se usa `PUT /carga/actualizar-unidades/:id` con la cantidad absoluta (no la diferencia). El backend calcula `diferencia = nuevaCantidad - cantidadActual`. Si la cantidad llega a `0`, `useMision` delega en `eliminarItem` y se usa `DELETE /carga/eliminar/:id`.

Para confirmar, el usuario pulsa **Confirmar cargamento** en `BodegaCarga`. `useMision.confirmarCarga()` llama a `POST /carga/confirmar`; el backend descuenta los créditos, vacía la carga y marca `confirmada: true`. El hook muestra el resumen en el `Alert` verde y refresca los datos. La UI queda bloqueada y la bodega ofrece **Nueva misión**.

Para abrir una nueva misión se usa **Nueva misión** o **Iniciar Nueva Misión** en el modal. El backend devuelve el stock de la carga no confirmada, restablece los créditos a `1000`, pone `confirmada: false` y reinicia el temporizador. El hook reinicia el reloj local y resincroniza con el backend.

Si la ventana expira, cualquier petición protegida responde `401`; `useMision` llama a `expirarSesion()` y se muestra el modal. El backend devuelve el stock de la carga no confirmada al cerrar la sesión.

---

## Reglas de negocio (según el código)

1. La ventana de lanzamiento dura **300 000 ms (5 minutos)** desde el último arranque o reinicio del servidor.
2. Toda petición a inventario, carga, agregar, actualizar, eliminar o confirmar comprueba la ventana. Si está cerrada, devuelve `401` y vacía la carga devolviendo el stock no confirmado.
3. `POST /api/sesion/reiniciar` no comprueba la ventana: devuelve el stock no confirmado, vacía la carga, restablece créditos y `confirmada`, y abre una nueva ventana de 5 minutos.
4. El stock se descuenta al agregar o aumentar unidades y se devuelve al eliminar o reducir.
5. El total de la carga es la suma de `precio × cantidad`.
6. No se pueden superar los créditos disponibles (`1000`).
7. Los créditos se descuentan **solo al confirmar**. Mientras la misión está en preparación, el total se compara contra los créditos, pero no se resta.
8. Las cantidades deben ser enteras: `> 0` al agregar y `>= 0` al actualizar. El valor `0` en una actualización elimina el ítem.
9. La confirmación exige al menos un ítem. Al confirmar se descuentan los créditos, se vacía la carga y `confirmada` pasa a `true`.
10. Con la misión confirmada, agregar, actualizar, eliminar y volver a confirmar responden `409`. La única operación permitida es reiniciar.
11. El stock confirmado queda consumido y no se repone al iniciar una nueva misión.
12. El cliente bloquea globalmente las operaciones mientras hay una petición en curso, incluso ante clics rápidos.

---

## API

Base URL directa: `http://localhost:3000/api`.

Base URL usada por el cliente: `/api` (proxy de Vite) o `VITE_API_URL` si se define.

Todas las respuestas de error son JSON con la propiedad `mensaje`.

### `GET /inventario`

Respuesta `200`:

```json
[
  { "id": 101, "nombre": "Tanque de Oxigeno", "precio": 50, "stock": 5, "categoria": "Soporte vital" },
  { "id": 102, "nombre": "Racion de comida", "precio": 10, "stock": 20, "categoria": "Alimentación" }
]
```

`401` si la ventana está cerrada.

### `GET /carga`

Respuesta `200`:

```json
{
  "creditos": 1000,
  "itemsCargados": [{ "id": 101, "cantidad": 1 }],
  "total": 50,
  "confirmada": false
}
```

`401` si la ventana está cerrada.

### `POST /carga/agregar`

Body:

```json
{ "equipoId": 101, "cantidad": 1 }
```

| Caso | Código | Respuesta |
| --- | --- | --- |
| Correcto | `200` | `{ mensaje, carga }` |
| Misión ya confirmada | `409` | `{ mensaje: "La misión ya fue confirmada. Reinicie para abrir una nueva ventana." }` |
| `equipoId` no es entero positivo | `400` | `{ mensaje: "Identificador de suministro inválido. Debe ser un entero positivo." }` |
| `cantidad` no es entero o es `<= 0` | `400` | `{ mensaje: "Cantidad inválida. Debe ser un entero mayor que cero." }` |
| Suministro inexistente | `404` | `{ mensaje: "Suministro no encontrado en el catálogo" }` |
| Stock insuficiente | `400` | `{ mensaje: "Stock en base insuficiente" }` |
| Créditos insuficientes | `400` | `{ mensaje: "Créditos insuficientes para esta cantidad" }` |
| Ventana cerrada | `401` | `{ mensaje: "Ventana de lanzamiento cerrada..." }` |

### `PUT /carga/actualizar-unidades/:id`

Body:

```json
{ "cantidad": 3 }
```

| Caso | Código | Respuesta |
| --- | --- | --- |
| Correcto | `200` | `{ mensaje: "Cantidad de unidades actualizada con éxito", carga }` |
| Misión ya confirmada | `409` | `{ mensaje: "La misión ya fue confirmada. Reinicie para abrir una nueva ventana." }` |
| `id` no es entero positivo | `400` | `{ mensaje: "Identificador de suministro inválido. Debe ser un entero positivo." }` |
| `cantidad` no es entero o es negativa | `400` | `{ mensaje: "Cantidad inválida. Debe ser un entero mayor o igual a cero." }` |
| Ítem o suministro inexistente | `404` | `{ mensaje: "El suministro no se encuentra en la carga de la nave" }` |
| Stock insuficiente al aumentar | `400` | `{ mensaje: "Stock en base insuficiente" }` |
| Créditos insuficientes | `400` | `{ mensaje: "Créditos insuficientes para esta cantidad" }` |

Si la cantidad resultante es `0`, el ítem se elimina de la carga y sus unidades vuelven al stock. Los valores negativos se rechazan con `400`.

### `DELETE /carga/eliminar/:id`

| Caso | Código | Respuesta |
| --- | --- | --- |
| Correcto | `200` | `{ mensaje: "Suministro eliminado de la carga y devuelto a la base", carga }` |
| Misión ya confirmada | `409` | `{ mensaje: "La misión ya fue confirmada. Reinicie para abrir una nueva ventana." }` |
| No está en la carga | `404` | `{ mensaje: "El suministro no esta en la nave" }` |

### `GET /sesion/tiempo`

```json
{ "segundosRestantes": 289 }
```

### `POST /carga/confirmar`

| Caso | Código | Respuesta |
| --- | --- | --- |
| Carga con ítems | `200` | `{ mensaje, resumen: { itemsCargados, total, creditosRestantes }, carga }` |
| Carga vacía | `400` | `{ mensaje: "No se puede confirmar un cargamento sin suministros a bordo." }` |
| Misión ya confirmada | `409` | `{ mensaje: "La misión ya fue confirmada. Reinicie para abrir una nueva ventana." }` |
| Ventana cerrada | `401` | `{ mensaje: "Ventana de lanzamiento cerrada..." }` |

Ejemplo de respuesta exitosa:

```json
{
  "mensaje": "¡Cargamento confirmado! Suministros asegurados y nave autorizada para despegar.",
  "resumen": {
    "itemsCargados": [{ "id": 101, "cantidad": 2 }],
    "total": 100,
    "creditosRestantes": 900
  },
  "carga": {
    "creditos": 900,
    "itemsCargados": [],
    "total": 0,
    "confirmada": true
  }
}
```

### `POST /sesion/reiniciar`

Abre una nueva ventana de lanzamiento. Devuelve al inventario el stock de la carga no confirmada, vacía la bodega, restablece los créditos a `1000` y deja `confirmada: false`.

Respuesta `200`:

```json
{
  "mensaje": "Nueva ventana de lanzamiento abierta.",
  "carga": { "creditos": 1000, "itemsCargados": [], "total": 0, "confirmada": false }
}
```

La ruta funciona incluso si la ventana anterior ya expiró.

### Rutas inexistentes y errores

- `GET /api/inexistente` → `404` con `{ "mensaje": "Ruta no encontrada" }`.
- JSON malformado en el cuerpo → `400` con `{ "mensaje": "JSON inválido en el cuerpo de la solicitud." }`.
- Error no controlado → `500` con `{ "mensaje": "Error interno del servidor." }`.

Todas las respuestas usan `Content-Type: application/json`.

---

## Verificación realizada

### Cliente

| Comprobación | Resultado |
| --- | --- |
| `npm run lint` | Sin advertencias ni errores |
| `npm run build` | Correcto, 277 módulos transformados |
| `npm run dev` | Levantado en `5199` para probar el proxy |
| `GET http://localhost:5199/api/inventario` | `200`, proxy correcto hacia `3001` |

### Backend

Se validó la sintaxis de todos los archivos con `node --check` y se ejecutaron los tests de integración:

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 13 tests aprobados, 0 fallos |
| `node --check` | Correcto en todos los archivos |
| `npm start` en `3011` | `GET /api/inventario` respondió `200` |

También se probó la API manualmente con el servidor en el puerto `3001` (el `3000` estaba ocupado por otra aplicación):

| Prueba | Resultado |
| --- | --- |
| `GET /api/inventario` | `200`, incluye `categoria` |
| `GET /api/carga` | `200`, incluye `confirmada` |
| `GET /api/sesion/tiempo` | `200` |
| `POST /api/carga/agregar` con ítem válido | `200` |
| `POST /api/carga/agregar` con ítem inexistente | `404` |
| `POST /api/carga/agregar` con stock insuficiente | `400` |
| `POST /api/carga/agregar` con `cantidad: -5` | `400`, stock sin cambios |
| `POST /api/carga/agregar` con `cantidad: 0` | `400` |
| `POST /api/carga/agregar` con `cantidad: 1.5` | `400` |
| `POST /api/carga/agregar` con `cantidad: "3"` | `400` |
| `PUT /api/carga/actualizar-unidades/103` con `cantidad: -100` | `400`, stock intacto |
| `PUT /api/carga/actualizar-unidades/103` con `cantidad: "3"` | `400` |
| `PUT /api/carga/actualizar-unidades/103` con `cantidad: 0` | `200`, ítem eliminado y stock devuelto |
| `POST /api/carga/confirmar` con carga vacía | `400` |
| `POST /api/carga/confirmar` con 2 tanques (total `100`) | `200`, créditos `1000 → 900` |
| `GET /api/carga` después de confirmar | `200`, carga vacía, `total: 0`, `confirmada: true` |
| Repetir `POST /api/carga/confirmar` | `409` |
| Agregar, actualizar o eliminar después de confirmar | `409` |
| `POST /api/sesion/reiniciar` después de confirmar | `200`, créditos `1000`, `confirmada: false` |
| Temporizador tras reiniciar | ~`299` segundos |
| `GET /api/inexistente` | `404` JSON |
| JSON malformado en `POST /api/carga/agregar` | `400` JSON |
| Reinicio con carga no confirmada | El stock vuelve a su valor anterior |

También se comprobó la expiración de forma acelerada: con `timerLanzamiento` en el pasado, `tiempoLanzamientoActivo()` devuelve `false` y `obtenerSegundosRestantes()` devuelve `0`; al reiniciar, ambos vuelven a `true` y `300`. El controlador devuelve `401` con la ventana cerrada y `reiniciarSesion` reabre correctamente.

Comandos usados para las pruebas:

```powershell
Invoke-RestMethod -Method Get -Uri http://localhost:3001/api/inventario
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/carga/agregar `
  -ContentType "application/json" -Body '{"equipoId":101,"cantidad":2}'
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/carga/confirmar
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/sesion/reiniciar
Invoke-RestMethod -Method Get -Uri http://localhost:3001/api/sesion/tiempo
```

Prueba de validación (debe responder `400`):

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3001/api/carga/agregar `
  -ContentType "application/json" -Body '{"equipoId":101,"cantidad":-5}'
```

Prueba del proxy de Vite:

```powershell
$env:VITE_PROXY_TARGET="http://localhost:3001"
npm run dev -- --port 5199 --strictPort
Invoke-RestMethod -Method Get -Uri http://localhost:5199/api/inventario
```

No se realizó una prueba interactiva completa de la interfaz en navegador. La verificación del cliente se limita a lint, build y a la prueba del proxy contra la API.

---

## Correcciones aplicadas

### Fase 1 — Errores críticos (27 de octubre de 2026)

| # | Error corregido | Corrección aplicada |
| --- | --- | --- |
| 1 | La ruta `POST /api/sesion/reiniciar` no estaba registrada. | `reiniciarSesion` se importa y se monta en `routes.js`. |
| 2 | El temporizador no se reiniciaba porque `helper.js` copiaba el primitivo. | `helper.js` lee `data.timerLanzamiento` en cada llamada. |
| 3 | La sesión quedaba bloqueada permanentemente al expirar. | La ruta de reinicio ya funciona y reabre la ventana con 300 segundos. |
| 4 | Se aceptaban cantidades negativas, cero, decimales y strings. | Se exige `Number.isInteger` y `cantidad > 0` al agregar, y `cantidad >= 0` al actualizar. |
| 5 | Se podía inflar el stock con diferencias negativas. | Las cantidades negativas se rechazan con `400` antes de modificar el estado. |
| 6 | Los strings producían concatenaciones como `"3" + 1 = "31"`. | La validación de enteros impide guardar strings como cantidad. |
| 7 | El reinicio perdía el stock cargado. | `reiniciarSesion` llama a `forzarCierreSesion()` antes de abrir la nueva ventana. |
| 8 | No había botón para confirmar el cargamento. | `BodegaCarga` recibe `onConfirmarCarga` y renderiza **Confirmar cargamento**; el bloqueo se controla con `useOperacion`. |

### Fase 2 — Errores medios y hooks (27 de octubre de 2026)

| # | Error corregido | Corrección aplicada |
| --- | --- | --- |
| 1 | La confirmación no tenía consecuencia real. | `confirmarCarga` descuenta créditos, vacía la carga, marca `confirmada: true` y devuelve el resumen. Las mutaciones posteriores responden `409`. |
| 2 | Los `404` se devolvían en HTML. | `app.js` agrega un middleware `404` que responde JSON. |
| 3 | Faltaba `categoria` en el inventario. | Se agregó `categoria` a los cinco suministros; el badge del catálogo ya se muestra. |
| 4 | URL de API fija y código muerto. | Se reescribió `src/api/logistica.js`, se agregó el proxy `/api` en Vite y `App.jsx` dejó de importar `axios`. `VITE_API_URL` permite cambiar la base. |
| 5 | Manejo de errores HTTP incompleto. | El middleware de errores responde JSON para JSON malformado (`400`), rutas inexistentes (`404`) y errores internos (`500`). |
| 6 | Carreras en el cliente por peticiones concurrentes. | `useOperacion` bloquea globalmente con `useRef`; los componentes deshabilitan sus controles mientras hay una operación o la misión está confirmada. |

Además, la lógica de negocio se centralizó en hooks:

- `useMision`: estado, acciones y manejo de errores.
- `useOperacion`: bloqueo global y estados derivados.
- `useTemporizadorMision`: reloj y sincronización.
- `api/logistica.js`: única capa HTTP.

`App.jsx` quedó reducido a composición visual. También se corrigió de forma incidental la inconsistencia de créditos iniciales: el cliente usa `1000`, igual que el servidor.

Archivos modificados en esta fase:

- `server/app.js`
- `server/data/moldeInventario.js`
- `server/controllers/controllerLogistica.js`
- `client/src/api/logistica.js`
- `client/src/hooks/useMision.js`
- `client/src/hooks/useOperacion.js`
- `client/src/hooks/useTemporizadorMision.js`
- `client/src/App.jsx`
- `client/src/components/CatalogoBase.jsx`
- `client/src/components/BodegaCarga.jsx`
- `client/vite.config.js`
- `README.md`

### Fase 3 — Errores menores (27 de octubre de 2026)

| # | Error corregido | Corrección aplicada |
| --- | --- | --- |
| 1 | El botón `+` no tenía límite de stock. | `BodegaCarga` calcula `hayStockParaAumentar` y deshabilita el botón cuando el stock en base es `0`, con un `title` explicativo. |
| 2 | Restos de la plantilla de Vite. | Se eliminaron `App.css`, `hero.png`, `react.svg`, `vite.svg` e `icons.svg`; se reescribieron `index.css` e `index.html` y se agregó un favicon propio. |
| 3 | `server/package.json` no tenía script `dev`. | Se agregó `"dev": "nodemon app.js"`. |
| 4 | No había tests automatizados. | Se agregó `server/test/api.test.js` con 13 tests de integración usando `node:test`; `app.js` exporta la app y solo escucha cuando se ejecuta directamente. |
| 5 | Dos advertencias de Oxlint `set-state-in-effect`. | Las cargas iniciales asíncronas se difieren un tick con `setTimeout`, evitando el `setState` síncrono dentro del efecto. `npm run lint` queda limpio. |

Archivos modificados en esta fase:

- `server/app.js`
- `server/package.json`
- `server/test/api.test.js`
- `client/src/hooks/useMision.js`
- `client/src/hooks/useTemporizadorMision.js`
- `client/src/components/BodegaCarga.jsx`
- `client/src/index.css`
- `client/index.html`
- `client/public/favicon.svg`
- `client/src/App.css` (eliminado)
- `client/src/assets/` (eliminado)
- `client/public/icons.svg` (eliminado)
- `README.md`

---

## Errores pendientes

No quedan errores pendientes de las revisiones anteriores. Las limitaciones de alcance están en [Limitaciones](#limitaciones).

---

## Mejoras pendientes recomendadas

1. Agregar tests E2E de UI con Playwright o Cypress para cubrir el flujo completo de la misión en un navegador real.
2. Agregar tests de hooks y componentes con Vitest + Testing Library; los tests actuales cubren la API.
3. Mostrar en la bodega el máximo de unidades permitido según stock y créditos, además del bloqueo del botón.
4. Incorporar persistencia real de misiones y sesiones independientes por usuario.

---

## Limitaciones

- Todo el estado vive en memoria: se pierde al reiniciar el servidor.
- No hay base de datos, autenticación, usuarios ni persistencia de misiones.
- La API tiene tests de integración con `node:test`, pero no hay tests E2E de la interfaz.
- La interfaz no tiene página de inicio ni navegación; es una sola pantalla.
- El temporizador es global para todos los clientes: no hay sesiones independientes.
- No se realizó una prueba interactiva completa de la UI en navegador; la verificación se hizo con lint, build, API, tests y proxy.
