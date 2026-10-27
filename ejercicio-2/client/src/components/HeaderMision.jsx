import React from 'react';
import { Navbar, NavbarBrand, Badge, UncontrolledAlert, Alert } from 'reactstrap';

const HeaderMision = ({ creditos, total, error, onDismissError }) => {
  return (
    <div className="mb-4">
      {error && (
        <UncontrolledAlert color="warning" toggle={onDismissError} className="mb-3">
          <strong>¡Restricción de Misión Rompida!</strong> {error}
        </UncontrolledAlert>
      )}

      <Navbar color="dark" dark expand="md" className="rounded px-4">
        <NavbarBrand href="/">AstroLogistics Mission Control</NavbarBrand>
        <div className="ms-auto d-flex align-items-center gap-3 text-white">
          <span>
            Créditos disponibles: <strong>{creditos} Cr</strong>
          </span>
          <span>
            Costo total de Carga:{' '}
            <Badge color="light" text="dark" pill className="fs-6 px-3 text-dark">
              {total} Cr
            </Badge>
          </span>
        </div>
      </Navbar>
    </div>
  );
};

export default HeaderMision;
