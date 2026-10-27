const express = require('express');
const routes = require('./routes/routes.js');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/routes', routes);

app.use((req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({ message: 'JSON inválido' });
    }

    console.error(err);
    res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});