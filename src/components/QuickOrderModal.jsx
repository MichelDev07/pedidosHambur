import React, { useState } from 'react';
import { X, Plus, Minus, UserCheck, Ticket, Check } from 'lucide-react';
import { PRODUCTOS_DEFAULT } from '../data/initialData';

export const QuickOrderModal = ({ isOpen, onClose, onQuickSubmit }) => {
  if (!isOpen) return null;

  const [clienteNombre, setClienteNombre] = useState('');
  const [clienteTelefono, setClienteTelefono] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [estadoPago, setEstadoPago] = useState('pagado'); // Mostrador suele cobrarse en el acto
  const [itemsMap, setItemsMap] = useState({});

  const handleUpdateQty = (prodId, delta) => {
    setItemsMap(prev => {
      const current = prev[prodId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [prodId]: next };
    });
  };

  const selectedItems = PRODUCTOS_DEFAULT
    .filter(p => itemsMap[p.id] > 0)
    .map(p => ({
      ...p,
      cantidad: itemsMap[p.id]
    }));

  const totalAmount = selectedItems.reduce((acc, it) => acc + (it.precio * it.cantidad), 0);
  const totalRifas = selectedItems.reduce((acc, it) => acc + ((it.numerosRifa || 0) * it.cantidad), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!clienteNombre.trim()) {
      alert('Por favor ingresá el nombre del cliente');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Seleccioná al menos una hamburguesa o rifa');
      return;
    }

    onQuickSubmit({
      cliente_nombre: clienteNombre.trim(),
      cliente_telefono: clienteTelefono.trim() || 'Mostrador',
      modalidad: 'retiro',
      direccion: 'Retiro mostrador',
      horario_preferido: 'Inmediato',
      metodo_pago: metodoPago,
      estado_pago: estadoPago,
      observaciones: 'Carga rápida por organizador/mostrador',
      total: totalAmount,
      items: selectedItems,
      origen: 'mostrador'
    });

    // Resetear
    setClienteNombre('');
    setClienteTelefono('');
    setItemsMap({});
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCheck size={20} color="var(--amber-light)" />
            <h3 style={{ fontSize: '1.15rem' }}>Carga Rápida de Pedido (Mostrador)</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div className="modal-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Cliente / Apellido *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Ej. Lucas Gómez" 
                  value={clienteNombre} 
                  onChange={(e) => setClienteNombre(e.target.value)} 
                  required 
                />
              </div>
              <div>
                <label className="form-label">Teléfono (WhatsApp)</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder="Opcional para mostrador" 
                  value={clienteTelefono} 
                  onChange={(e) => setClienteTelefono(e.target.value)} 
                />
              </div>
            </div>

            {/* Selector de Items Rápido */}
            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ marginBottom: '0.5rem' }}>
                Seleccionar Productos:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {PRODUCTOS_DEFAULT.map((prod) => {
                  const qty = itemsMap[prod.id] || 0;
                  return (
                    <div 
                      key={prod.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.75rem',
                        background: qty > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${qty > 0 ? 'var(--border-amber)' : 'var(--border-subtle)'}`,
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>
                          {prod.emoji} {prod.nombre}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ${prod.precio.toLocaleString('es-AR')}
                          {prod.numerosRifa > 0 && ` • 🎟️ +${prod.numerosRifa} rifas`}
                        </div>
                      </div>

                      <div className="qty-control" style={{ transform: 'scale(0.9)' }}>
                        <button type="button" className="qty-btn" onClick={() => handleUpdateQty(prod.id, -1)}>
                          <Minus size={12} />
                        </button>
                        <span className="qty-number">{qty}</span>
                        <button type="button" className="qty-btn" onClick={() => handleUpdateQty(prod.id, 1)}>
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cobro y Estado */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="form-label">Forma de Pago</label>
                <select 
                  className="form-select"
                  value={metodoPago}
                  onChange={(e) => setMetodoPago(e.target.value)}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="transferencia">Transferencia</option>
                </select>
              </div>
              <div>
                <label className="form-label">Estado de Pago</label>
                <select 
                  className="form-select"
                  value={estadoPago}
                  onChange={(e) => setEstadoPago(e.target.value)}
                >
                  <option value="pagado">✅ Cobrado en el acto</option>
                  <option value="pendiente">⏳ Pendiente de cobro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {totalRifas > 0 ? `🎟️ ${totalRifas} Rifas ganadas` : 'Total mostrador:'}
              </span>
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--amber-light)' }}>
                ${totalAmount.toLocaleString('es-AR')}
              </span>
            </div>

            <button type="submit" className="btn-primary" disabled={selectedItems.length === 0}>
              <Check size={18} />
              <span>Registrar e Imprimir</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
