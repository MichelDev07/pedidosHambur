import React, { useState } from 'react';
import { PlusCircle, Minus, Plus, MapPin, User, Phone } from 'lucide-react';
import { PRECIO_HAMBURGUESA_GS } from '../data/initialData';

export const OrderForm = ({ onSubmit, isSubmitting }) => {
  const [nombre, setNombre] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [estadoPago, setEstadoPago] = useState('pendiente');

  const total = cantidad * PRECIO_HAMBURGUESA_GS;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      alert('Por favor ingresá el nombre de quien hace el pedido.');
      return;
    }

    onSubmit({
      cliente_nombre: nombre.trim(),
      cantidad: cantidad,
      direccion: direccion.trim(),
      telefono: telefono.trim(),
      estado_pago: estadoPago
    });

    setNombre('');
    setCantidad(1);
    setDireccion('');
    setTelefono('');
  };

  return (
    <div className="order-form-card">
      <div className="order-form-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div className="brand-icon-wrapper" style={{ width: '40px', height: '40px', fontSize: '1.3rem' }}>
            🍔
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Cargar Pedido de Hamburguesa</h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--amber-light)', fontWeight: 700 }}>
              Precio: {PRECIO_HAMBURGUESA_GS.toLocaleString('es-PY')} Gs. por unidad
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '1.25rem' }}>
        <div className="order-form-grid">
          {/* Nombre */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">
              <User size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Nombre de la persona <span className="req">*</span>
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="Ej. Juan Gómez / María Benítez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Cantidad de Hamburguesas */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">
              ¿Cuántos pedidos hizo? (Cantidad de hamburguesas) <span className="req">*</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div className="qty-control" style={{ padding: '0.35rem 0.6rem' }}>
                <button 
                  type="button" 
                  className="qty-btn" 
                  onClick={() => setCantidad(prev => Math.max(1, prev - 1))}
                  style={{ width: '34px', height: '34px' }}
                >
                  <Minus size={16} />
                </button>
                <span className="qty-number" style={{ minWidth: '40px', fontSize: '1.2rem' }}>
                  {cantidad}
                </span>
                <button 
                  type="button" 
                  className="qty-btn" 
                  onClick={() => setCantidad(prev => prev + 1)}
                  style={{ width: '34px', height: '34px' }}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Botones de selección rápida */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCantidad(num)}
                    style={{
                      background: cantidad === num ? 'var(--amber-primary)' : 'var(--bg-surface)',
                      color: cantidad === num ? '#000' : 'var(--text-main)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dirección donde vive (Opcional) */}
          <div className="form-group">
            <label className="form-label">
              <MapPin size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Dirección donde vive <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Opcional)</span>
            </label>
            <input 
              type="text"
              className="form-input"
              placeholder="Ej. Barrio San Pablo, Calle 3 c/ Curupayty"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
            />
          </div>

          {/* Teléfono (Opcional) */}
          <div className="form-group">
            <label className="form-label">
              <Phone size={15} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
              Teléfono / WhatsApp <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>(Opcional)</span>
            </label>
            <input 
              type="tel"
              className="form-input"
              placeholder="Ej. 0981 123456"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
            />
          </div>

          {/* Estado de pago */}
          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Estado del Pago</label>
            <div className="radio-group-grid">
              <div 
                className={`radio-card ${estadoPago === 'pagado' ? 'selected' : ''}`}
                onClick={() => setEstadoPago('pagado')}
              >
                <input 
                  type="radio" 
                  name="estadoPago" 
                  checked={estadoPago === 'pagado'} 
                  onChange={() => {}} 
                />
                <div>
                  <div className="radio-label-title" style={{ color: 'var(--green-light)' }}>
                    ✅ Ya Pagó
                  </div>
                  <div className="radio-label-sub">Dinero cobrado</div>
                </div>
              </div>

              <div 
                className={`radio-card ${estadoPago === 'pendiente' ? 'selected' : ''}`}
                onClick={() => setEstadoPago('pendiente')}
              >
                <input 
                  type="radio" 
                  name="estadoPago" 
                  checked={estadoPago === 'pendiente'} 
                  onChange={() => {}} 
                />
                <div>
                  <div className="radio-label-title" style={{ color: 'var(--amber-light)' }}>
                    ⏳ Pendiente
                  </div>
                  <div className="radio-label-sub">A cobrar</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen del cálculo y Botón de Envío */}
        <div className="order-form-footer">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {cantidad} {cantidad === 1 ? 'hamburguesa' : 'hamburguesas'} × {PRECIO_HAMBURGUESA_GS.toLocaleString('es-PY')} Gs.
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--amber-light)' }}>
              Total: {total.toLocaleString('es-PY')} Gs.
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={isSubmitting || !nombre.trim()}
            style={{ padding: '0.85rem 1.6rem' }}
          >
            <PlusCircle size={18} />
            <span>{isSubmitting ? 'Guardando...' : `Registrar Pedido (${total.toLocaleString('es-PY')} Gs.)`}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
