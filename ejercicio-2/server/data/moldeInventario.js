let inventario = [
  { id: 101, nombre: "Tanque de Oxigeno", precio: 50.00, stock: 5},
  { id: 102, nombre: "Racion de comida", precio: 10.00, stock: 20},
  { id: 103, nombre: "Bateria", precio: 120.00, stock: 3},
  { id: 104, nombre: "Repuesto", precio: 80.00, stock: 4},
  { id: 105, nombre: "Traje espacial", precio: 50.00, stock: 10}
];

let cargaNave = {
  creditos: 1000.00,
  itemsCargados: [],
  total: 0.00
};

module.exports = { inventario, cargaNave };