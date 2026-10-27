const express = require('express');
const app = express();
const rutasLogistica = require('./routes/routes');
const PORT = 3000;

app.use(express.json());

// Montamos las rutas bajo el prefijo obligatorio /api
app.use('/api', rutasLogistica);

app.listen(PORT, () => {
  console.log(`Servidor de AstroLogistics corriendo en http://localhost:${PORT}`);
});
