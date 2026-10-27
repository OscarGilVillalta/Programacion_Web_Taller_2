let temperaturaEstabilizacion = Math.floor(Math.random() * 100) + 1;

const TemperaturaEstabilizacion = (req, res) => {
    const { temperatura } = req.body ?? {};

    if (
        typeof temperatura !== 'number' ||
        !Number.isInteger(temperatura) ||
        temperatura < 1 ||
        temperatura > 100
    ) {
        return res.status(400).json({
            message: "Temperatura inválida. Debe ser un entero entre 1 y 100.",
        });
    }

    if (temperatura > temperaturaEstabilizacion) {
        return res.status(200).json({ 
            status: "mas_baja", 
            message: "La temperatura ideal del reactor es más baja",
        });
    } else if (temperatura < temperaturaEstabilizacion) {
        return res.status(200).json({ 
            status: "mas_alta", 
            message: "La temperatura ideal del reactor es más alta",
        });
    } else {
        return res.status(200).json({ 
            status: "estabilizado", 
            message: "estabilizado" 
        });
    }
}

const IniciarTemperatura = (req, res) => {
    temperaturaEstabilizacion = Math.floor(Math.random() * 100) + 1;
    res.status(200).json({ 
        success: true,
        message: "Sistema reiniciado con una nueva temperatura de estabilización." 
    });
}

module.exports = {
    TemperaturaEstabilizacion,
    IniciarTemperatura
}