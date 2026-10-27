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
  itemsCargados: [],
  total: 0.00,
  confirmada: false
};

let timerLanzamiento = Date.now();

module.exports = { inventario, cargaNave, timerLanzamiento, CREDITOS_INICIALES };