import React from 'react';
import { Navbar, NavbarBrand, Badge, UncontrolledAlert } from 'reactstrap';

const HeaderMision = ({ creditos, total, error, onDismissError, tiempo }) => {
  // Formatea los segundos totales en formato MM:SS
  const formatearTiempo = (segundosTotales) => {
    const minutos = Math.floor(segundosTotales / 60);
    const segundos = segundosTotales % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  };

  const tiempoExpirando = tiempo < 60; // Parpadeo o color de alerta si queda menos de un minuto

  return (
    <div className="mb-4">
      {error && (
        <UncontrolledAlert color="warning" toggle={onDismissError} className="mb-3">
          <strong>¡Violación de Restricción de Misión!</strong> {error}
        </UncontrolledAlert>
      )}

      <Navbar color="dark" dark expand="md" className="rounded px-4 shadow">
        <NavbarBrand href="/">Mision de carga de AstroLogistics</NavbarBrand>
        
        <div className="ms-auto d-flex align-items-center gap-4 text-white">
          {/* CRONÓMETRO VISUAL */}
          <div className="d-flex align-items-center gap-2 border border-secondary px-3 py-1 rounded bg-black">
            <span className="text-muted small text-uppercase">Tiempo:</span>
            <span className={`fw-bold fs-5 ${tiempoExpirando ? 'text-danger animate-pulse' : 'text-warning'}`} style={{ fontFamily: 'monospace' }}>
              {formatearTiempo(tiempo)}
            </span>
          </div>

          <span>
            Créditos disponibles: <strong>{creditos} Cr</strong>
          </span>
          <span>
            Costo total de Carga:{' '}
            <Badge color="light" pill className="fs-6 px-3 text-dark">
              {total} Cr
            </Badge>
          </span>
        </div>
      </Navbar>
    </div>
  );
};

export default HeaderMision;
