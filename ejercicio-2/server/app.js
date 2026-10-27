const express = require('express');
const app = express();
const cors = require('cors');
const rutasLogistica = require('./routes/routes');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Montamos las rutas bajo el prefijo obligatorio /api
app.use('/api', rutasLogistica);

// Rutas no encontradas: siempre respondemos JSON
app.use((req, res) => {
  res.status(404).json({ mensaje: "Ruta no encontrada" });
});

// Manejo centralizado de errores en JSON
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: "JSON inválido en el cuerpo de la solicitud." });
  }

  console.error(err);
  res.status(500).json({ mensaje: "Error interno del servidor." });
});

// Solo escuchamos cuando el archivo se ejecuta directamente.
// Al importarlo desde los tests, el servidor lo levanta el propio test.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor de AstroLogistics corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
