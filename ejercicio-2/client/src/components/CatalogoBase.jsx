import React from 'react';
import { Row, Col, Card, CardBody, CardTitle, CardText, Button, Badge } from 'reactstrap';

const CatalogoBase = ({ inventario = [], onAgregarItem, cargandoId }) => {
  return (
    <div>
      <h3 className="mb-3 text-secondary">🌌 Catálogo de la Base Espacial</h3>
      <Row>
        {inventario && inventario.map((suministro) => {
          const estaCargando = cargandoId === suministro.id;
          const sinStock = suministro.stock === 0;

          return (
            <Col md="6" lg="4" xs="12" key={suministro.id} className="mb-3">
              <Card className="h-100 shadow-sm border">
                <CardBody className="d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <CardTitle tag="h5" className="mb-0 fs-6 text-truncate" style={{ maxWidth: '70%' }}>
                        {suministro.nombre}
                      </CardTitle>
                      <Badge color="info" pill style={{ fontSize: '0.75rem' }}>
                        {suministro.categoria}
                      </Badge>
                    </div>
                    
                    <CardText className="my-3 fs-3 text-primary fw-bold">
                      {suministro.precio.toFixed(2)} <small className="text-muted fs-6">Cr</small>
                    </CardText>
                  </div>

                  <div>
                    <CardText className="text-muted small mb-3">
                      Stock en base: <strong className={sinStock ? "text-danger" : "text-dark"}>{suministro.stock} u</strong>
                    </CardText>

                    <Button
                      color={sinStock ? "secondary" : "primary"}
                      disabled={sinStock || estaCargando}
                      block
                      size="sm"
                      onClick={() => onAgregarItem(suministro.id)}
                    >
                      {estaCargando ? "Calculando..." : sinStock ? "Agotado en Base" : "Añadir a la Nave"}
                    </Button>
                  </div>
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
