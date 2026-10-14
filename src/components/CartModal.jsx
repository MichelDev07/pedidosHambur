import React from 'react';
import { X, Trash2, Plus, Minus, Ticket, ArrowRight, ShoppingBag } from 'lucide-react';

export const CartModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onClearCart, 
  onProceedToCheckout 
}) => {
  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const totalRifas = cartItems.reduce((acc, item) => acc + ((item.numerosRifa || 0) * item.cantidad), 0);
  const totalHamburguesas = cartItems.reduce((acc, item) => {
    if (item.categoria === 'combos' || item.categoria === 'hamburguesas') {
      return acc + item.cantidad;
    }
    return acc;
  }, 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado */}
        <div className="modal-header">
          <h3>
            <ShoppingBag size={20} color="var(--amber-light)" />
            Tu Pedido Solidario
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar modal">
            <X size={18} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="modal-body">
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <p style={{ fontWeight: 600 }}>Todavía no agregaste hamburguesas ni rifas.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
                ¡Elegí tus combos favoritos del menú para empezar a colaborar!
              </p>
            </div>
          ) : (
            <>
              {/* Lista de productos seleccionados */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {cartItems.map((item) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.03)',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div style={{ flexGrow: 1, paddingRight: '0.75rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.nombre}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        ${item.precio.toLocaleString('es-AR')} c/u
                        {item.numerosRifa > 0 && (
                          <span style={{ color: 'var(--green-light)', marginLeft: '0.5rem' }}>
                            🎟️ +{item.numerosRifa * item.cantidad} rifas
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <div className="qty-control">
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, item.cantidad - 1)}
                        >
                          <Minus size={13} />
                        </button>
                        <span className="qty-number">{item.cantidad}</span>
                        <button 
                          className="qty-btn"
                          onClick={() => onUpdateQuantity(item.id, item.cantidad + 1)}
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div style={{ fontWeight: 800, minWidth: '70px', textAlign: 'right', fontSize: '0.95rem' }}>
                        ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                      </div>

                      <button
                        onClick={() => onUpdateQuantity(item.id, 0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--red-cancel)',
                          cursor: 'pointer',
                          padding: '0.25rem'
                        }}
                        title="Eliminar ítem"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Destacado de Números de Rifa Ganados */}
              {totalRifas > 0 && (
                <div 
                  style={{
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(245, 158, 11, 0.15))',
                    border: '1px solid var(--border-green)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem 1rem',
                    marginTop: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <Ticket size={28} color="var(--green-light)" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontWeight: 800, color: 'var(--green-light)', fontSize: '0.95rem' }}>
                      ¡Te llevás {totalRifas} {totalRifas === 1 ? 'número' : 'números'} de rifa gratis!
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Participan automáticamente por la TV 43', el asado completo y más premios.
                    </div>
                  </div>
                </div>
              )}

              {/* Resumen de totales */}
              <div 
                style={{ 
                  marginTop: '1.25rem', 
                  paddingTop: '1rem', 
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                {totalHamburguesas > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <span>Hamburguesas a preparar:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{totalHamburguesas}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800 }}>Total a Pagar:</span>
                  <span style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--amber-light)' }}>
                    ${totalAmount.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer con Acciones */}
        {cartItems.length > 0 && (
          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button 
              className="btn-secondary" 
              onClick={onClearCart}
              style={{ fontSize: '0.85rem', padding: '0.6rem 1rem' }}
            >
              Vaciar
            </button>
            <button 
              className="btn-primary" 
              onClick={onProceedToCheckout}
              style={{ flexGrow: 1 }}
            >
              <span>Continuar al Pago</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
