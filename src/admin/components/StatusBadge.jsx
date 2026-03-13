import React from 'react';

const STATUS_CONFIG = {
  pending_payment: { label: 'Pago pendiente', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  confirmed: { label: 'Confirmada',  bg: 'bg-amber-100',  text: 'text-amber-700'  },
  preparing: { label: 'Preparando', bg: 'bg-blue-100',   text: 'text-blue-700'   },
  shipped:   { label: 'En camino',  bg: 'bg-indigo-100', text: 'text-indigo-700' },
  delivered: { label: 'Entregado',  bg: 'bg-green-100',  text: 'text-green-700'  },
  cancelled: { label: 'Cancelado',  bg: 'bg-red-100',    text: 'text-red-700'    },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status ?? 'Desconocido',
    bg: 'bg-primary/10',
    text: 'text-primary/60',
  };

  return (
    <span
      className={`${config.bg} ${config.text} text-xs font-semibold px-2.5 py-1 rounded-full font-body`}
    >
      {config.label}
    </span>
  );
}
