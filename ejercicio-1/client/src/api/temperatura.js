const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

async function request(path, options) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, options);
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(
      data?.message ?? 'El servidor rechazó la solicitud.',
    )
    error.status = response.status;
    throw error;
  }

  return data;
}

export function ajustarTemperatura(temperatura) {
  return request('/routes/adjust', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ temperatura }),
  });
}

export function reiniciarReactor() {
  return request('/routes/reboot', {
    method: 'POST',
  });
}