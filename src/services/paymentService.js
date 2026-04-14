function buildAuthHeaders(accessToken) {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

async function parseApiError(res, fallbackMessage) {
  let errorMessage = fallbackMessage;

  try {
    const data = await res.json();
    errorMessage = data.error || errorMessage;

    if (Array.isArray(data.missing) && data.missing.length > 0) {
      errorMessage = `${errorMessage} (${data.missing.join(', ')})`;
    }
  } catch {
    if (res.status === 404) {
      errorMessage =
        'Servicio no disponible. Verifica que el entorno de pagos este activo.';
    }
  }

  return errorMessage;
}

export async function createPaymentLink(checkout, accessToken = null) {
  const res = await fetch('/api/wompi/create-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...buildAuthHeaders(accessToken),
    },
    body: JSON.stringify({ checkout }),
  });

  if (!res.ok) {
    throw new Error(
      await parseApiError(res, 'No se pudo crear el enlace de pago.'),
    );
  }

  return res.json();
}

export async function getCheckoutStatus(
  orderId,
  { orderKey = null, accessToken = null } = {},
) {
  const params = new URLSearchParams({ order: orderId });
  if (orderKey) {
    params.set('key', orderKey);
  }

  const res = await fetch(`/api/wompi/order-status?${params.toString()}`, {
    headers: {
      ...buildAuthHeaders(accessToken),
    },
  });

  if (!res.ok) {
    throw new Error(
      await parseApiError(res, 'No se pudo consultar el estado del pedido.'),
    );
  }

  return res.json();
}
