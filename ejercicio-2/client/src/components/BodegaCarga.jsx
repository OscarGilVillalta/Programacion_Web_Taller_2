import React from 'react';
import { ListGroup, ListGroupItem, Button, ButtonGroup } from 'reactstrap';

const BodegaCarga = ({ itemsCargados, inventario, onActualizarUnidades, onEliminarItem, cargandoId }) => {
  return (
    <div className="bg-light p-3 rounded border h-100">
      <h4 className="text-secondary border-bottom pb-2 mb-3">Bodega de Carga</h4>
      
      {itemsCargados.length === 0 ? (
        <p className="text-muted text-center py-4">La nave se encuentra vacía. Añade suministros en el catálogo.</p>
      ) : (
        <ListGroup>
          {itemsCargados.map((item) => {
            const suministro = inventario.find(i => i.id === item.id);
            if (!suministro) return null;

            const estaCargando = cargandoId === item.id;

            return (
              <ListGroupItem key={item.id} className="d-flex flex-column gap-2 py-3 shadow-sm mb-2 rounded">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">{suministro.nombre}</span>
                  <span className="badge bg-dark rounded-pill">x{item.cantidad}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center mt-1">
                  {/* Control de unidades compacto */}
                  <ButtonGroup size="sm">
                    <Button 
                      color="secondary" 
                      outline 
                      disabled={estaCargando}
                      onClick={() => onActualizarUnidades(item.id, item.cantidad - 1)}
                    >
                      -
                    </Button>
                    <Button 
                      color="secondary" 
                      outline 
                      disabled={estaCargando}
                      onClick={() => onActualizarUnidades(item.id, item.cantidad + 1)}
                    >
                      +
                    </Button>
                  </ButtonGroup>

                  <Button 
                    color="danger" 
                    outline 
                    size="sm"
                    disabled={estaCargando}
                    onClick={() => onEliminarItem(item.id)}
                  >
                    Desembarcar
                  </Button>
                </div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
};

export default BodegaCarga;
