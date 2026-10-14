import React, { useEffect } from 'react';
import { CheckCircle2, Ticket, MessageSquare, Printer, X, Sparkles, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderTicketModal = ({ isOpen, onClose, orderResult, config }) => {
  if (!isOpen || !orderResult || !orderResult.pedido) return null;

  const { pedido, savedInSupabase } = orderResult;

  // Disparar confetti festivo al abrir
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  // Construir mensaje de WhatsApp
  const handleShareWhatsApp = () => {
    const orgPhone = (config.telefonoWhatsApp || '5491123456789').replace(/\D/g, '');
    const itemsListText = (pedido.items || [])
      .map(item => `  • ${item.cantidad}x ${item.nombre} ($${(item.precio * item.cantidad).toLocaleString('es-AR')})`)
      .join('\n');

    const rifasText = (pedido.numeros_rifa || []).length > 0 
      ? `🎟️ *NÚMEROS DE RIFA ASIGNADOS:* #${pedido.numeros_rifa.join(', #')}` 
      : '';

    const text = `*¡HOLA! REALICÉ MI PEDIDO SOLIDARIO 🍔🎟️*
----------------------------------------
*Código:* ${pedido.codigo_pedido}
*Cliente:* ${pedido.cliente_nombre}
*Teléfono:* ${pedido.cliente_telefono}
*Modalidad:* ${pedido.modalidad === 'retiro' ? 'Retiro en Sede' : `Envío a domicilio (${pedido.direccion})`}
*Horario preferido:* ${pedido.horario_preferido}
*Forma de pago:* ${pedido.metodo_pago === 'transferencia' ? 'Transferencia Bancaria' : 'Efectivo'}

*DETALLE DEL PEDIDO:*
${itemsListText}

*TOTAL:* $${pedido.total.toLocaleString('es-AR')}
${rifasText}

${pedido.observaciones ? `*Observaciones:* ${pedido.observaciones}\n` : ''}
¡Muchas gracias por apoyar la causa! 🙌`;

    const encodedText = encodeURIComponent(text);
    const url = `https://wa.me/${orgPhone}?text=${encodedText}`;
    window.open(url, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={22} color="var(--green-light)" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>¡Pedido Confirmado!</span>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Ticket Perforado */}
        <div className="modal-body">
          <div className="digital-ticket">
            <div className="ticket-header">
              <div style={{ fontSize: '0.8rem', color: 'var(--amber-light)', fontWeight: 800, textTransform: 'uppercase' }}>
                {config.nombre || "Gran Hamburgueseada & Rifa Solidaria"}
              </div>
              <div className="ticket-order-code">
                {pedido.codigo_pedido}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Cliente: <strong style={{ color: 'var(--text-main)' }}>{pedido.cliente_nombre}</strong>
              </div>
            </div>

            {/* Números de Rifa Asignados */}
            {(pedido.numeros_rifa || []).length > 0 && (
              <div className="ticket-raffle-section">
                <div className="ticket-raffle-title">
                  <Ticket size={16} /> Tus Números para el Sorteo
                </div>
                <div className="ticket-numbers-grid">
                  {pedido.numeros_rifa.map((num) => (
                    <div key={num} className="raffle-number-chip">
                      #{String(num).padStart(4, '0')}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Guardá este número para el sorteo de los 3 premios.
                </div>
              </div>
            )}

            {/* Metadatos */}
            <div className="ticket-meta-grid">
              <div className="ticket-meta-item">
                <span className="label">Modalidad:</span>
                <span className="val">
                  {pedido.modalidad === 'retiro' ? 'Retiro en Evento' : 'Envío a Domicilio'}
                </span>
              </div>
              <div className="ticket-meta-item">
                <span className="label">Horario:</span>
                <span className="val">{pedido.horario_preferido}</span>
              </div>
              <div className="ticket-meta-item">
                <span className="label">Pago:</span>
                <span className="val" style={{ textTransform: 'capitalize' }}>
                  {pedido.metodo_pago}
                </span>
              </div>
              <div className="ticket-meta-item">
                <span className="label">Total abonado:</span>
                <span className="val" style={{ color: 'var(--amber-light)', fontSize: '1rem' }}>
                  ${pedido.total.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Lista resumida de ítems */}
            <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-muted)' }}>
                Detalle:
              </div>
              {(pedido.items || []).map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span>{it.cantidad}x {it.nombre}</span>
                  <span style={{ fontWeight: 600 }}>${(it.precio * it.cantidad).toLocaleString('es-AR')}</span>
                </div>
              ))}
            </div>

            {/* Aviso de sincronización con Supabase */}
            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              {savedInSupabase ? (
                <span style={{ color: 'var(--green-light)' }}>
                  ☁️ Registrado en tiempo real en la base de datos Supabase
                </span>
              ) : (
                <span>
                  💾 Guardado localmente en este dispositivo (Modo Offline)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="modal-footer" style={{ flexDirection: 'column', gap: '0.6rem' }}>
          <button className="btn-whatsapp" onClick={handleShareWhatsApp}>
            <MessageSquare size={18} />
            <span>Enviar Pedido a los Organizadores por WhatsApp</span>
          </button>

          <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
            <button className="btn-secondary" onClick={handlePrint} style={{ flex: 1, fontSize: '0.88rem' }}>
              <Printer size={16} />
              <span>Imprimir Ticket</span>
            </button>
            <button className="btn-primary" onClick={onClose} style={{ flex: 1, fontSize: '0.88rem' }}>
              Listo / Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
