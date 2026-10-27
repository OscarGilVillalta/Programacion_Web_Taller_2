const { after, before, beforeEach, describe, test } = require('node:test');
const assert = require('node:assert/strict');

const app = require('../app');
const data = require('../data/moldeInventario');

const STOCK_INICIAL = new Map(
  data.inventario.map((suministro) => [suministro.id, suministro.stock]),
);

let servidor;
let baseUrl;

const pedir = async (ruta, { metodo = 'GET', cuerpo, cuerpoCrudo, headers = {} } = {}) => {
  const respuesta = await fetch(`${baseUrl}${ruta}`, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: cuerpoCrudo ?? (cuerpo === undefined ? undefined : JSON.stringify(cuerpo)),
  });

  const texto = await respuesta.text();

  return {
    estado: respuesta.status,
    datos: texto ? JSON.parse(texto) : null,
  };
};

describe('API de AstroLogistics', { concurrency: false }, () => {
  before(async () => {
    servidor = app.listen(0, '127.0.0.1');

    await new Promise((resolve, reject) => {
      servidor.once('listening', resolve);
      servidor.once('error', reject);
    });

    const { port } = servidor.address();
    baseUrl = `http://127.0.0.1:${port}/api`;
  });

  after(async () => {
    await new Promise((resolve, reject) => {
      servidor.close((error) => (error ? reject(error) : resolve()));
      servidor.closeAllConnections?.();
    });
  });

  beforeEach(() => {
    for (const suministro of data.inventario) {
      suministro.stock = STOCK_INICIAL.get(suministro.id);
    }

    data.cargaNave.creditos = data.CREDITOS_INICIALES;
    data.cargaNave.itemsCargados = [];
    data.cargaNave.total = 0;
    data.cargaNave.confirmada = false;
    data.timerLanzamiento = Date.now();
  });

  test('GET /inventario devuelve los suministros con categoría', async () => {
    const { estado, datos } = await pedir('/inventario');

    assert.equal(estado, 200);
    assert.equal(datos.length, 5);

    for (const suministro of datos) {
      assert.equal(typeof suministro.categoria, 'string');
      assert.ok(suministro.categoria.length > 0);
    }
  });

  test('GET /carga devuelve el estado inicial de la misión', async () => {
    const { estado, datos } = await pedir('/carga');

    assert.equal(estado, 200);
    assert.equal(datos.creditos, 1000);
    assert.deepEqual(datos.itemsCargados, []);
    assert.equal(datos.total, 0);
    assert.equal(datos.confirmada, false);
  });

  test('GET /sesion/tiempo devuelve segundos dentro de la ventana', async () => {
    const { estado, datos } = await pedir('/sesion/tiempo');

    assert.equal(estado, 200);
    assert.ok(datos.segundosRestantes > 0);
    assert.ok(datos.segundosRestantes <= 300);
  });

  test('agregar rechaza cantidades inválidas sin alterar el stock', async () => {
    for (const cantidad of [-5, 0, 1.5, '3']) {
      const { estado, datos } = await pedir('/carga/agregar', {
        metodo: 'POST',
        cuerpo: { equipoId: 101, cantidad },
      });

      assert.equal(estado, 400, `cantidad inválida: ${cantidad}`);
      assert.match(datos.mensaje, /Cantidad inválida/);
    }

    const { datos: inventario } = await pedir('/inventario');
    const tanque = inventario.find((suministro) => suministro.id === 101);

    assert.equal(tanque.stock, 5);
  });

  test('agregar descuenta stock y calcula el total de la carga', async () => {
    const { estado, datos } = await pedir('/carga/agregar', {
      metodo: 'POST',
      cuerpo: { equipoId: 101, cantidad: 2 },
    });

    assert.equal(estado, 200);
    assert.equal(datos.carga.total, 100);
    assert.deepEqual(datos.carga.itemsCargados, [{ id: 101, cantidad: 2 }]);

    const { datos: inventario } = await pedir('/inventario');
    const tanque = inventario.find((suministro) => suministro.id === 101);

    assert.equal(tanque.stock, 3);
  });

  test('actualizar rechaza negativos y elimina la carga al llegar a cero', async () => {
    await pedir('/carga/agregar', {
      metodo: 'POST',
      cuerpo: { equipoId: 103, cantidad: 2 },
    });

    const negativo = await pedir('/carga/actualizar-unidades/103', {
      metodo: 'PUT',
      cuerpo: { cantidad: -100 },
    });

    assert.equal(negativo.estado, 400);

    let { datos: inventario } = await pedir('/inventario');
    assert.equal(inventario.find((suministro) => suministro.id === 103).stock, 1);

    const cero = await pedir('/carga/actualizar-unidades/103', {
      metodo: 'PUT',
      cuerpo: { cantidad: 0 },
    });

    assert.equal(cero.estado, 200);
    assert.deepEqual(cero.datos.carga.itemsCargados, []);

    ({ datos: inventario } = await pedir('/inventario'));
    assert.equal(inventario.find((suministro) => suministro.id === 103).stock, 3);
  });

  test('confirmar descuenta créditos, vacía la carga y bloquea mutaciones', async () => {
    await pedir('/carga/agregar', {
      metodo: 'POST',
      cuerpo: { equipoId: 101, cantidad: 2 },
    });

    const confirmacion = await pedir('/carga/confirmar', { metodo: 'POST' });

    assert.equal(confirmacion.estado, 200);
    assert.equal(confirmacion.datos.resumen.total, 100);
    assert.equal(confirmacion.datos.resumen.creditosRestantes, 900);
    assert.equal(confirmacion.datos.carga.confirmada, true);
    assert.deepEqual(confirmacion.datos.carga.itemsCargados, []);
    assert.equal(confirmacion.datos.carga.total, 0);

    const repetida = await pedir('/carga/confirmar', { metodo: 'POST' });
    assert.equal(repetida.estado, 409);

    const mutaciones = [
      ['/carga/agregar', 'POST', { equipoId: 102, cantidad: 1 }],
      ['/carga/actualizar-unidades/101', 'PUT', { cantidad: 3 }],
      ['/carga/eliminar/101', 'DELETE', undefined],
    ];

    for (const [ruta, metodo, cuerpo] of mutaciones) {
      const respuesta = await pedir(ruta, { metodo, cuerpo });

      assert.equal(respuesta.estado, 409, `${metodo} ${ruta}`);
      assert.match(respuesta.datos.mensaje, /ya fue confirmada/);
    }

    const { datos: carga } = await pedir('/carga');
    assert.equal(carga.confirmada, true);
    assert.equal(carga.creditos, 900);
  });

  test('confirmar una carga vacía responde 400', async () => {
    const { estado, datos } = await pedir('/carga/confirmar', { metodo: 'POST' });

    assert.equal(estado, 400);
    assert.match(datos.mensaje, /sin suministros/);
  });

  test('reiniciar restablece créditos y devuelve el stock no confirmado', async () => {
    await pedir('/carga/agregar', {
      metodo: 'POST',
      cuerpo: { equipoId: 102, cantidad: 2 },
    });

    let { datos: inventario } = await pedir('/inventario');
    assert.equal(inventario.find((suministro) => suministro.id === 102).stock, 18);

    const reinicio = await pedir('/sesion/reiniciar', { metodo: 'POST' });

    assert.equal(reinicio.estado, 200);
    assert.equal(reinicio.datos.carga.creditos, 1000);
    assert.equal(reinicio.datos.carga.confirmada, false);
    assert.deepEqual(reinicio.datos.carga.itemsCargados, []);

    ({ datos: inventario } = await pedir('/inventario'));
    assert.equal(inventario.find((suministro) => suministro.id === 102).stock, 20);
  });

  test('reiniciar después de confirmar no repone el stock confirmado', async () => {
    await pedir('/carga/agregar', {
      metodo: 'POST',
      cuerpo: { equipoId: 101, cantidad: 2 },
    });
    await pedir('/carga/confirmar', { metodo: 'POST' });
    await pedir('/sesion/reiniciar', { metodo: 'POST' });

    const { datos: inventario } = await pedir('/inventario');
    assert.equal(inventario.find((suministro) => suministro.id === 101).stock, 3);
  });

  test('una ruta inexistente responde 404 JSON', async () => {
    const { estado, datos } = await pedir('/inexistente');

    assert.equal(estado, 404);
    assert.deepEqual(datos, { mensaje: 'Ruta no encontrada' });
  });

  test('un JSON malformado responde 400 JSON', async () => {
    const { estado, datos } = await pedir('/carga/agregar', {
      metodo: 'POST',
      cuerpoCrudo: '{malformado',
    });

    assert.equal(estado, 400);
    assert.deepEqual(datos, {
      mensaje: 'JSON inválido en el cuerpo de la solicitud.',
    });
  });

  test('una ventana expirada responde 401 y el reinicio la reabre', async () => {
    data.timerLanzamiento = Date.now() - 300001;

    const expirada = await pedir('/inventario');
    assert.equal(expirada.estado, 401);

    const reinicio = await pedir('/sesion/reiniciar', { metodo: 'POST' });
    assert.equal(reinicio.estado, 200);

    const activa = await pedir('/inventario');
    assert.equal(activa.estado, 200);
  });
});
