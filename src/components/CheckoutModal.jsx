import React, { useState } from 'react';
import { X, Copy, Check, ArrowLeft, Send, Sparkles, MapPin, Bike, Wallet, Banknote } from 'lucide-react';

export const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  onBackToCart, 
  cartItems, 
  config, 
  onSubmitOrder, 
  isSubmitting 
}) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalRifas = cartItems.reduce((acc, item) => acc + ((item.numerosRifa || 0) * item.cantidad), 0);

  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    modalidad: 'retiro', // 'retiro' | 'envio'
    direccion: '',
    horario: '20:30 a 21:30 hs',
    metodoPago: 'transferencia', // 'transferencia' | 'efectivo'
    comprobante: '',
    observaciones: ''
  });

  const [copiedAlias, setCopiedAlias] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopyAlias = () => {
    navigator.clipboard.writeText(config.aliasPago || 'hambur.solidaria.mp');
    setCopiedAlias(true);
    setTimeout(() => setCopiedAlias(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      setErrorMsg('Por favor ingresá tu nombre completo.');
      return;
    }
    if (!formData.telefono.trim() || formData.telefono.trim().length < 6) {
      setErrorMsg('Por favor ingresá un teléfono o WhatsApp de contacto válido.');
      return;
    }
    if (formData.modalidad === 'envio' && !formData.direccion.trim()) {
      setErrorMsg('Por favor ingresá la dirección exacta para el envío.');
      return;
    }

    setErrorMsg('');
    onSubmitOrder({
      cliente_nombre: formData.nombre,
      cliente_telefono: formData.telefono,
      modalidad: formData.modalidad,
      direccion: formData.direccion,
      horario_preferido: formData.horario,
      metodo_pago: formData.metodoPago,
      comprobante_pago: formData.comprobante,
      observaciones: formData.observaciones,
      total: totalAmount,
      items: cartItems
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <button 
              className="modal-close-btn" 
              onClick={onBackToCart}
              title="Volver al carrito"
            >
              <ArrowLeft size={16} />
            </button>
            <h3 style={{ fontSize: '1.15rem' }}>Finalizar Pedido Solidario</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <div className="modal-body">
            {errorMsg && (
              <div 
                style={{
                  background: 'rgba(244, 63, 94, 0.15)',
                  border: '1px solid var(--red-cancel)',
                  color: '#fda4af',
                  padding: '0.65rem 0.95rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  fontWeight: 600
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Datos Personales */}
            <div className="form-group">
              <label className="form-label">
                Nombre y Apellido <span className="req">*</span>
              </label>
              <input 
                type="text"
                className="form-input"
                placeholder="Ej. Juan Pérez"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Teléfono / WhatsApp <span className="req">*</span>
              </label>
              <input 
                type="tel"
                className="form-input"
                placeholder="Ej. 11 2345 6789 (para enviarte el ticket)"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
            </div>

            {/* Modalidad de Entrega */}
            <div className="form-group">
              <label className="form-label">Modalidad de Entrega</label>
              <div className="radio-group-grid">
                <div 
                  className={`radio-card ${formData.modalidad === 'retiro' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, modalidad: 'retiro' })}
                >
                  <input 
                    type="radio" 
                    name="modalidad" 
                    checked={formData.modalidad === 'retiro'} 
                    onChange={() => {}} 
                  />
                  <div>
                    <div className="radio-label-title">Retiro en Evento</div>
                    <div className="radio-label-sub">{config.lugar || "Club Social"}</div>
                  </div>
                </div>

                <div 
                  className={`radio-card ${formData.modalidad === 'envio' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, modalidad: 'envio' })}
                >
                  <input 
                    type="radio" 
                    name="modalidad" 
                    checked={formData.modalidad === 'envio'} 
                    onChange={() => {}} 
                  />
                  <div>
                    <div className="radio-label-title">Envío a Domicilio</div>
                    <div className="radio-label-sub">Coordinar con cadete</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dirección si es envío */}
            {formData.modalidad === 'envio' && (
              <div className="form-group">
                <label className="form-label">
                  Dirección exacta de entrega <span className="req">*</span>
                </label>
                <input 
                  type="text"
                  className="form-input"
                  placeholder="Calle, Número, Piso/Dpto, Barrio"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  required
                />
              </div>
            )}

            {/* Horario preferido */}
            <div className="form-group">
              <label className="form-label">Franja Horaria Preferida</label>
              <select 
                className="form-select"
                value={formData.horario}
                onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              >
                <option value="20:00 a 21:00 hs">20:00 a 21:00 hs</option>
                <option value="21:00 a 22:00 hs">21:00 a 22:00 hs</option>
                <option value="22:00 a 23:00 hs">22:00 a 23:00 hs</option>
                <option value="Apenas esté listo">Apenas esté listo</option>
              </select>
            </div>

            {/* Método de Pago */}
            <div className="form-group">
              <label className="form-label">Forma de Pago</label>
              <div className="radio-group-grid">
                <div 
                  className={`radio-card ${formData.metodoPago === 'transferencia' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, metodoPago: 'transferencia' })}
                >
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    checked={formData.metodoPago === 'transferencia'} 
                    onChange={() => {}} 
                  />
                  <div>
                    <div className="radio-label-title">Transferencia / MP</div>
                    <div className="radio-label-sub">Recomendado</div>
                  </div>
                </div>

                <div 
                  className={`radio-card ${formData.metodoPago === 'efectivo' ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, metodoPago: 'efectivo' })}
                >
                  <input 
                    type="radio" 
                    name="metodoPago" 
                    checked={formData.metodoPago === 'efectivo'} 
                    onChange={() => {}} 
                  />
                  <div>
                    <div className="radio-label-title">Efectivo</div>
                    <div className="radio-label-sub">Al retirar</div>
                  </div>
                </div>
              </div>

              {/* Datos Bancarios si eligió transferencia */}
              {formData.metodoPago === 'transferencia' && (
                <div className="transfer-info-box">
                  <div style={{ fontWeight: 800, color: 'var(--amber-light)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    💳 Datos para transferir ${totalAmount.toLocaleString('es-AR')}:
                  </div>
                  <div className="transfer-row">
                    <span>Alias:</span>
                    <div>
                      <code>{config.aliasPago || 'hambur.solidaria.mp'}</code>
                      <button 
                        type="button" 
                        className="copy-mini-btn" 
                        onClick={handleCopyAlias}
                      >
                        {copiedAlias ? <Check size={12} color="#10b981" /> : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  {config.cbuPago && (
                    <div className="transfer-row">
                      <span>CBU:</span>
                      <code>{config.cbuPago}</code>
                    </div>
                  )}
                  {config.titularPago && (
                    <div className="transfer-row">
                      <span>Titular:</span>
                      <span style={{ fontWeight: 600 }}>{config.titularPago}</span>
                    </div>
                  )}

                  <div style={{ marginTop: '0.75rem' }}>
                    <input 
                      type="text"
                      className="form-input"
                      style={{ fontSize: '0.82rem', padding: '0.5rem 0.75rem' }}
                      placeholder="N° de Comprobante / Operación (opcional)"
                      value={formData.comprobante}
                      onChange={(e) => setFormData({ ...formData, comprobante: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Observaciones */}
            <div className="form-group">
              <label className="form-label">Aclaraciones o Pedidos Especiales</label>
              <textarea 
                className="form-textarea"
                placeholder="Ej. 'Una hamburguesa sin cebolla', 'Dejar en portería', etc."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              ></textarea>
            </div>
          </div>

          {/* Footer de Confirmación */}
          <div className="modal-footer" style={{ flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {totalRifas > 0 ? `🎟️ ${totalRifas} Rifas incluidas` : 'Total:'}
              </span>
              <span style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--amber-light)' }}>
                ${totalAmount.toLocaleString('es-AR')}
              </span>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Guardando Pedido...</span>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Confirmar Pedido y Generar Rifas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
