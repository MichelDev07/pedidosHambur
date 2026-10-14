import React, { useEffect } from 'react';
import { CheckCircle2, Ticket, MessageSquare, Printer, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRECIO_HAMBURGUESA_GS } from '../data/initialData';

export const OrderTicketModal = ({ isOpen, onClose, orderResult }) => {
  if (!isOpen || !orderResult || !orderResult.pedido) return null;

  const { pedido, savedInSupabase } = orderResult;

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  const handleShareWhatsApp = () => {
    const phone = (pedido.telefono || '').replace(/\D/g, '');
    const rifasText = (pedido.numeros_rifa || []).length > 0
      ? `🎟️ *NÚMEROS DE RIFA ASIGNADOS:* #${pedido.numeros_rifa.join(', #')}`
      : '';

    const text = `*¡HOLA ${pedido.cliente_nombre.toUpperCase()}! 🍔🎟️*
Muchas gracias por apoyar nuestra rifa solidaria de hamburguesas.

*RESUMEN DE TU PEDIDO:*
• Cantidad de hamburguesas: ${pedido.cantidad}
• Precio unitario: ${PRECIO_HAMBURGUESA_GS.toLocaleString('es-PY')} Gs.
• *TOTAL:* ${Number(pedido.total).toLocaleString('es-PY')} Gs.
• *ESTADO:* ${pedido.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente de cobro'}
${pedido.direccion ? `• Dirección: ${pedido.direccion}\n` : ''}
${rifasText}

¡Muchos éxitos en el sorteo! 🙌`;

    const encodedText = encodeURIComponent(text);
    const url = phone ? `https://wa.me/${phone}?text=${encodedText}` : `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={22} color="var(--green-light)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>¡Pedido Registrado con Éxito!</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="digital-ticket">
            <div className="ticket-header">
              <div style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: 800, textTransform: 'uppercase' }}>
                Rifa Solidaria de Hamburguesas
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.25rem' }}>
                {pedido.cliente_nombre}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {pedido.cantidad} {pedido.cantidad === 1 ? 'Hamburguesa' : 'Hamburguesas'} • {Number(pedido.total).toLocaleString('es-PY')} Gs.
              </div>
            </div>

            {/* Números de Rifa */}
            {(pedido.numeros_rifa || []).length > 0 && (
              <div className="ticket-raffle-section">
                <div className="ticket-raffle-title">
                  <Ticket size={16} /> Números Oficiales para el Sorteo
                </div>
                <div className="ticket-numbers-grid">
                  {pedido.numeros_rifa.map((num) => (
                    <div key={num} className="raffle-number-chip">
                      #{num}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="ticket-meta-grid">
              <div className="ticket-meta-item">
                <span className="label">Estado de pago:</span>
                <span className="val" style={{ color: pedido.estado_pago === 'pagado' ? 'var(--green-light)' : 'var(--amber-light)' }}>
                  {pedido.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                </span>
              </div>
              <div className="ticket-meta-item">
                <span className="label">Total:</span>
                <span className="val" style={{ color: 'var(--amber-light)', fontSize: '1.1rem' }}>
                  {Number(pedido.total).toLocaleString('es-PY')} Gs.
                </span>
              </div>
              {pedido.direccion && (
                <div className="ticket-meta-item" style={{ gridColumn: 'span 2' }}>
                  <span className="label">Dirección:</span>
                  <span className="val">{pedido.direccion}</span>
                </div>
              )}
            </div>

            <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {savedInSupabase ? (
                <span style={{ color: 'var(--green-light)' }}>
                  ☁️ Sincronizado en tiempo real en Supabase
                </span>
              ) : (
                <span>
                  💾 Guardado en el navegador (Local Storage)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ flexDirection: 'column', gap: '0.6rem' }}>
          <button className="btn-whatsapp" onClick={handleShareWhatsApp}>
            <MessageSquare size={18} />
            <span>Enviar Comprobante por WhatsApp</span>
          </button>

          <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
            <button className="btn-secondary" onClick={handlePrint} style={{ flex: 1, fontSize: '0.88rem' }}>
              <Printer size={16} />
              <span>Imprimir</span>
            </button>
            <button className="btn-primary" onClick={onClose} style={{ flex: 1, fontSize: '0.88rem' }}>
              Cargar Otro Pedido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
