import React from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Badge } from 'reactstrap';

const CatalogoBase = ({ inventario, onAgregarItem, cargandoId }) => {
  return (
    <div>
      <h3 className="mb-3 text-secondary">Catálogo de la Base</h3>
      <Row>
        {inventario.map((suministro) => {
          const estaCargando = cargandoId === suministro.id;
          const sinStock = suministro.stock === 0;

          return (
            <Col md="4" xs="12" key={suministro.id}>
              <Card className="mb-3 shadow-sm">
                <CardBody>
                  <div className="d-flex justify-content-between align-items-start">
                    <CardTitle tag="h5" className="mb-1">{suministro.nombre}</CardTitle>
                    <Badge color="info" pill>{suministro.categoria}</Badge>
                  </div>
                  
                  <CardText className="my-3 fs-4 text-primary fw-bold">
                    ${suministro.precio.toFixed(2)} <small className="text-muted fs-6">Cr</small>
                  </CardText>
                  
                  <CardText className="text-muted">
                    Stock disponible: <strong className={sinStock ? "text-danger" : ""}>{suministro.stock}</strong>
                  </CardText>

                  <Button
                    color={sinStock ? "secondary" : "primary"}
                    disabled={sinStock || estaCargando}
                    block
                    onClick={() => onAgregarItem(suministro.id)}
                  >
                    {estaCargando ? "Calculando peso..." : sinStock ? "Agotado en Base" : "Añadir a la Nave"}
                  </Button>
                </CardBody>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default CatalogoBase;
