# Reactor — Protocolo de estabilización

Aplicación web para encontrar la temperatura exacta que estabiliza un reactor. El usuario introduce valores enteros entre 1 y 100 y el servidor responde si la temperatura ideal es más alta, más baja o si el núcleo quedó estabilizado.

El proyecto está dividido en dos aplicaciones:

- `client/`: interfaz React con Vite.
- `server/`: API REST con Express.

La interfaz muestra el estado del núcleo, una advertencia tras cada intento, el historial completo de la sesión y un panel final cuando se alcanza la temperatura correcta.

## Estado del proyecto

La aplicación se encuentra implementada y el backend responde correctamente. Se verificaron el lint, el build de producción y los endpoints principales. Queda pendiente una prueba interactiva completa en el navegador para validar visualmente todos los estados.

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19.3, Vite 8.3, CSS puro |
| Backend | Node.js, Express 5.3, CORS |
| Lint | Oxlint |
| Tipografías | Poppins y Cinzel desde Google Fonts |
| Persistencia | En memoria (backend) y estado de React (frontend) |

No se agregaron dependencias npm nuevas para la interfaz.

## Requisitos

- Node.js `^20.19.0` o `>=22.12.0`.
- npm.
- Dos terminales para ejecutar backend y frontend al mismo tiempo.

## Estructura del proyecto

```text
ejercicio-1/
├─ client/
│  ├─ public/
│  │  └─ favicon.svg
│  ├─ src/
│  │  ├─ api/
│  │  │  └─ temperatura.js
│  │  ├─ components/
│  │  │  ├─ FeedbackBanner.jsx
│  │  │  ├─ HistoryList.jsx
│  │  │  ├─ ReactorCore.jsx
│  │  │  ├─ ReactorHeader.jsx
│  │  │  ├─ TemperatureForm.jsx
│  │  │  └─ VictoryPanel.jsx
│  │  ├─ hooks/
│  │  │  └─ useReactor.js
│  │  ├─ App.css
│  │  ├─ App.jsx
│  │  ├─ index.css
│  │  └─ main.jsx
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
├─ server/
│  ├─ controllers/
│  │  └─ controllerTemperatura.js
│  ├─ routes/
│  │  └─ routes.js
│  ├─ app.js
│  └─ package.json
└─ README.md
```

## Instalación y ejecución

### 1. Backend

```powershell
cd C:\Users\kesso\Documents\Parcial_Web_2\ejercicio-1\server
npm install
npm start
```

El servidor queda disponible en `http://localhost:3000`. Para desarrollo con recarga automática:

```powershell
npm run dev
```

El puerto se puede cambiar con la variable de entorno `PORT`.

### 2. Frontend

En otra terminal:

```powershell
cd C:\Users\kesso\Documents\Parcial_Web_2\ejercicio-1\client
npm install
npm run dev
```

Abrir `http://localhost:5173`.

Vite redirige las peticiones que comienzan con `/routes` hacia `http://localhost:3000`, por lo que no hace falta configurar CORS en desarrollo.

También se puede definir `VITE_API_URL` si la API está en otra URL:

```powershell
$env:VITE_API_URL = "http://localhost:3000"
npm run dev
```

### 3. Build de producción

```powershell
cd C:\Users\kesso\Documents\Parcial_Web_2\ejercicio-1\client
npm run build
npm run preview
```

## Reglas del juego

1. La temperatura debe ser un número entero entre 1 y 100.
2. El servidor elige una temperatura objetivo aleatoria al iniciar y al reiniciar el sistema.
3. Después de cada intento, el servidor indica una de estas tres situaciones:

   - `mas_alta`: la temperatura ideal es mayor.
   - `mas_baja`: la temperatura ideal es menor.
   - `estabilizado`: se encontró el valor exacto.

4. Cada intento se agrega al historial, incluido el intento ganador.
5. El historial muestra primero los intentos más recientes e indica valor, resultado y mensaje.
6. Al estabilizar el reactor, el formulario se reemplaza por el panel de victoria.
7. El botón **Reiniciar** está disponible junto a **Enviar intento** durante la partida y como **Reiniciar reactor** en el panel final. Genera una nueva temperatura objetivo y limpia el historial.

## API

Base URL local: `http://localhost:3000`.

### `POST /routes/adjust`

Ajusta la temperatura del reactor.

**Body:**

```json
{
  "temperatura": 50
}
```

**Respuesta 200 — temperatura demasiado alta:**

```json
{
  "status": "mas_baja",
  "message": "La temperatura ideal del reactor es más baja"
}
```

**Respuesta 200 — temperatura demasiado baja:**

```json
{
  "status": "mas_alta",
  "message": "La temperatura ideal del reactor es más alta"
}
```

**Respuesta 200 — temperatura correcta:**

```json
{
  "status": "estabilizado",
  "message": "estabilizado"
}
```

**Respuesta 400 — valor inválido:**

```json
{
  "message": "Temperatura inválida. Debe ser un entero entre 1 y 100."
}
```

La validación del backend exige que `temperatura` sea un número entero entre 1 y 100. Se rechazan strings, decimales, valores fuera de rango y cuerpos sin `temperatura`.

### `POST /routes/reboot`

Reinicia el sistema y genera una nueva temperatura objetivo aleatoria.

**Respuesta 200:**

```json
{
  "success": true,
  "message": "Sistema reiniciado con una nueva temperatura de estabilización."
}
```

### Rutas inexistentes

Cualquier ruta no definida responde `404`:

```json
{
  "message": "Ruta no encontrada"
}
```

## Bitácora de cambios y orden de implementación

### Fase 0 — Corrección y endurecimiento del backend

Se revisó el backend existente antes de construir la interfaz porque la aplicación no podía funcionar si el servidor no exponía correctamente el controlador, las rutas o la configuración HTTP.

Cambios realizados:

- Se agregó la exportación de `TemperaturaEstabilizacion` e `IniciarTemperatura` en `server/controllers/controllerTemperatura.js`.
- Se agregó la exportación del router en `server/routes/routes.js`, necesaria para que `app.js` pudiera montarlo.
- Se validó que `temperatura` sea un número entero entre 1 y 100.
- Se agregó CORS para permitir el consumo desde el cliente.
- Se agregó `express.json()` para interpretar cuerpos JSON.
- Se agregó un handler `404` para rutas inexistentes.
- Se agregó manejo de JSON inválido y de errores internos con respuestas JSON.
- Se configuró el puerto mediante `process.env.PORT`, con `3000` como valor por defecto.
- Se corrigió `server/package.json`: `main` apunta a `app.js` y se agregaron los scripts `start` y `dev`.

Resultado: la API quedó funcional en `http://localhost:3000`, con respuestas consistentes para los casos válidos e inválidos.

### Fase 1 — Preparación de la base del cliente

Se preparó la configuración de Vite, el documento HTML y el sistema visual antes de escribir la lógica del juego.

Cambios realizados:

- `client/vite.config.js`: se agregó el proxy `/routes` hacia `http://localhost:3000`.
- `client/index.html`:
  - Se estableció `lang="es"`.
  - Se actualizó el título y la descripción.
  - Se agregó `theme-color` y `color-scheme: light`.
  - Se agregó el favicon propio.
  - Se cargaron las tipografías Poppins y Cinzel.
- `client/public/favicon.svg`: se creó un sigilo propio para reemplazar el logo de Vite.
- `client/src/index.css`:
  - Se definieron variables de color, tipografía, sombras y líneas.
  - Se agregó un reset básico.
  - Se definió el fondo claro con degradados radiales muy suaves.
  - Se agregaron estilos de foco visibles y respeto por `prefers-reduced-motion`.

### Fase 2 — Capa de comunicación con la API

Se centralizaron las llamadas HTTP para evitar repetir lógica de `fetch` dentro de los componentes.

Cambios realizados en `client/src/api/temperatura.js`:

- Se creó una función interna `request()`.
- Se agregó manejo de errores de conexión con el mensaje `No se pudo conectar con el servidor.`.
- Se agregó lectura segura de respuestas JSON.
- Se propagaron los mensajes de error del servidor.
- Se crearon `ajustarTemperatura(temperatura)` y `reiniciarReactor()`.
- Se agregó compatibilidad opcional con `VITE_API_URL`.
- Se eliminó la barra final de la URL base para evitar rutas duplicadas.

### Fase 3 — Estado y lógica del juego

Toda la lógica de la partida se concentró en un hook para que `App.jsx` quedara como composición visual.

Cambios realizados en `client/src/hooks/useReactor.js`:

- Estado de `valor`, `historial`, `mensaje`, `error`, `estabilizado`, `enviando` y `reiniciando`.
- Validación local antes de llamar a la API.
- Prevención de envíos duplicados.
- Prevención de reinicios durante un envío y de envíos durante un reinicio.
- Bloqueo de nuevos intentos después de estabilizar.
- Creación de cada intento con `id`, número, valor, estado y mensaje.
- `crearId` se reescribió con pasos explícitos para que el UUID y el fallback sean más legibles.
- Los filtros usan los predicados `esIntentoFallido` y `esIntentoGanador`, y el estado `estabilizado` se centralizó en `ESTADO_ESTABILIZADO`.
- Historial en orden descendente, mostrando primero el intento más reciente.
- Acumulación de todo el historial, incluido el intento ganador.
- Cálculo derivado de:
  - `intentosFallidos`
  - `intentoGanador`
  - `totalIntentos`
  - `estadoNucleo` (`reposo`, `alerta` o `estabilizado`)
- Reinicio del reactor mediante `/routes/reboot`, limpiando valor, historial, mensajes y estado de victoria.

### Fase 4 — Componentes de interfaz

La interfaz se dividió en componentes con responsabilidades claras.

| Componente | Responsabilidad |
| --- | --- |
| `ReactorHeader.jsx` | Marca, estado del sistema, título, métricas e indicador del núcleo. |
| `ReactorCore.jsx` | Núcleo SVG decorativo con estados de reposo, alerta y estabilizado. |
| `TemperatureForm.jsx` | Campo numérico, validación visual, botón de envío y botón de reinicio. |
| `FeedbackBanner.jsx` | Mensajes de advertencia del servidor y errores locales. |
| `HistoryList.jsx` | Registro completo de intentos con etiquetas y mensajes. |
| `VictoryPanel.jsx` | Resumen final, intento ganador y botón para reiniciar. |

Detalles importantes:

- `ReactorHeader` muestra etiquetas distintas según `estadoNucleo`.
- `ReactorCore` usa 24 marcas radiales y tres anillos SVG; cambia de color según el estado.
- `TemperatureForm` usa `noValidate` para que la validación sea controlada por la aplicación.
- `TemperatureForm` incluye el botón **Reiniciar** junto a **Enviar intento**; ambos se deshabilitan durante una petición.
- `FeedbackBanner` usa `role="alert"` para errores y `role="status"` para advertencias.
- `HistoryList` etiqueta cada intento como **Más alta**, **Más baja** o **Estabilizado**.
- El historial no muestra la hora; prioriza número, valor, resultado y mensaje.
- El intento ganador muestra el mensaje `Temperatura ideal alcanzada.`.
- `VictoryPanel` muestra cantidad de intentos, fallidos y temperatura final.

### Fase 5 — Integración y estilos finales

Se conectaron todos los componentes y se implementó el diseño visual completo.

Cambios realizados en `client/src/App.jsx`:

- Se reemplazó la plantilla inicial por la composición real de la aplicación.
- Se conectó `useReactor` con los componentes.
- Se pasaron `reiniciando` y `reiniciar` al formulario para habilitar el reinicio durante la partida.
- Se alterna entre formulario y panel de victoria según `estabilizado`.
- Se agregaron el separador inferior y el footer.

Cambios realizados en `client/src/App.css`:

- Tema completamente claro inspirado en la estética editorial de Team Cherry.
- Paleta principal:
  - Fondo: `#ffffff`.
  - Superficie: `#f7f5f0`.
  - Tinta: `#0b0b0d`.
  - Acento carmesí: `#c24747`.
  - Líneas: `#e4e0d8`.
- Tipografía Poppins para la interfaz y Cinzel para el título principal.
- Layout de dos columnas para formulario e historial.
- Estados visuales del núcleo con animación de pulso.
- Tabla de historial con scroll interno y separadores finos.
- Acciones del formulario en dos columnas y botón secundario de reinicio; se apilan en móvil.
- Panel de victoria diferenciado.
- Footer y línea decorativa con marcas en los extremos.
- Estilos responsive en `1024px` y `640px`.
- Estilos de foco, hover y botones deshabilitados.
- Ajuste final del separador inferior con `margin-top: auto` para mantenerlo junto al footer.

### Fase 6 — Verificación

Se ejecutaron las siguientes comprobaciones:

- `POST /routes/adjust` con valor válido: `200`.
- `POST /routes/adjust` con valores inválidos: `400`.
- `POST /routes/reboot`: `200`.
- Ruta inexistente: `404`.
- Cabecera CORS presente.
- `npm run lint` en `client/`: sin errores.
- `npm run build` en `client/`: compilación correcta.
- Prueba de renderizado de los componentes con datos de ejemplo.
- Captura de escritorio generada y revisada.

Verificación manual recomendada:

1. Enviar un valor vacío, `0`, `101` o `50.5` y comprobar que aparece el error sin agregar historial.
2. Enviar valores altos y bajos y comprobar las advertencias y las filas del historial.
3. Pulsar **Reiniciar** durante la partida y comprobar que limpia el historial y genera un nuevo objetivo.
4. Acercarse al objetivo hasta estabilizar el reactor.
5. Comprobar el panel de victoria y el resumen de intentos.
6. Pulsar **Reiniciar reactor** y verificar que vuelve el formulario con el historial vacío.

### Fase 7 — Limpieza de elementos sin uso

- Se eliminaron `client/src/assets/hero.png`, `client/src/assets/react.svg`, `client/src/assets/vite.svg` y `client/public/icons.svg` porque no tenían referencias.
- Se eliminó la carpeta `client/src/assets` al quedar vacía.
- Se quitó `creadoEn` del historial porque la hora ya no se muestra en la interfaz.
- Se eliminaron las variables CSS heredadas de la plantilla que no se utilizaban.
- Se quitó la prop `estabilizado` de `TemperatureForm`, ya que el formulario solo se renderiza cuando el reactor no está estabilizado.
- La build se regeneró sin los assets eliminados.

## Cambios archivo por archivo

### Backend

| Archivo | Cambio |
| --- | --- |
| `server/app.js` | CORS, JSON, montaje de rutas, 404, manejo de errores y puerto configurable. |
| `server/routes/routes.js` | Rutas `/adjust` y `/reboot` y exportación del router. |
| `server/controllers/controllerTemperatura.js` | Validación, respuestas de estado, reinicio y exportaciones. |
| `server/package.json` | `main`, scripts `start`/`dev` y dependencias del servidor. |

### Frontend

| Archivo | Cambio |
| --- | --- |
| `client/vite.config.js` | Proxy del frontend hacia la API. |
| `client/index.html` | Idioma, metadatos, favicon y fuentes. |
| `client/public/favicon.svg` | Nuevo favicon del reactor. |
| `client/src/assets/*`, `client/public/icons.svg` | Eliminados por no tener referencias. |
| `client/src/index.css` | Tokens de diseño, reset, fondo y accesibilidad. |
| `client/src/api/temperatura.js` | Cliente HTTP para ajustar y reiniciar. |
| `client/src/hooks/useReactor.js` | Estado, validación, historial, victoria, reinicio y bloqueo de acciones simultáneas. |
| `client/src/components/ReactorHeader.jsx` | Cabecera y métricas. |
| `client/src/components/ReactorCore.jsx` | Núcleo SVG con estados. |
| `client/src/components/TemperatureForm.jsx` | Formulario controlado con envío y reinicio. |
| `client/src/components/FeedbackBanner.jsx` | Advertencias y errores. |
| `client/src/components/HistoryList.jsx` | Historial completo. |
| `client/src/components/VictoryPanel.jsx` | Pantalla de victoria y reinicio. |
| `client/src/App.jsx` | Composición principal y conexión del reinicio durante la partida. |
| `client/src/App.css` | Diseño claro, responsive y estados visuales. |

## Decisiones de diseño

- **Tema claro:** se descartó una interfaz oscura para seguir una estética editorial clara, con mucho blanco, líneas finas y un único acento carmesí.
- **Team Cherry como referencia:** se tomaron recursos como la tipografía serif de título, los separadores finos, el uso de espacio negativo y los detalles ornamentales, sin copiar contenido.
- **Historial completo:** se decidió conservar todos los intentos para que el usuario pueda analizar su estrategia y no solo ver el último resultado.
- **Estado centralizado:** la lógica vive en `useReactor`; los componentes se mantienen presentacionales.
- **Sin dependencias extra:** se usó CSS puro y SVG para evitar sumar peso innecesario.
- **Accesibilidad:** etiquetas asociadas, foco visible, `aria-live`, mensajes de error semánticos y respeto por movimiento reducido.
- **Mensajes en español:** toda la interfaz y las respuestas visibles al usuario están en español.

## Verificación

```powershell
cd C:\Users\kesso\Documents\Parcial_Web_2\ejercicio-1\client
npm run lint
npm run build
```

Prueba rápida de la API:

```powershell
Invoke-RestMethod -Method Post `
  -Uri http://localhost:3000/routes/adjust `
  -ContentType "application/json" `
  -Body '{"temperatura":50}'
```

Reinicio:

```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/routes/reboot
```

## Limitaciones conocidas

- La temperatura objetivo se guarda en memoria: se pierde al reiniciar el servidor.
- El historial vive en el estado de React: se pierde al recargar la página.
- No hay base de datos, autenticación ni persistencia de partidas.
- No hay suite de tests automatizados; la verificación actual es manual, de lint, build y endpoints.
- El servidor elige la temperatura objetivo de forma aleatoria y no existe un endpoint para consultarla directamente.
- La verificación visual interactiva completa queda pendiente.

## Contexto

Proyecto de práctica de desarrollo web full stack con React y Express. El objetivo principal es ejercitar formularios controlados, estado derivado, consumo de APIs, validación en cliente y servidor, historial de interacciones y diseño responsive.
