import React from 'react';
import { ShoppingBag, Database, ShieldAlert, Heart, PlusCircle } from 'lucide-react';

export const Navbar = ({ 
  cartCount, 
  onOpenCart, 
  onOpenSettings, 
  isSupabaseConfigured,
  view,
  setView,
  onOpenQuickOrder
}) => {
  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Marca / Logo */}
        <div className="brand" onClick={() => setView('menu')}>
          <div className="brand-icon-wrapper">
            🍔
          </div>
          <div className="brand-text">
            <h1>Hamburguesas Solidarias</h1>
            <span className="brand-badge">
              <Heart size={11} fill="currentColor" /> Rifa Benéfica
            </span>
          </div>
        </div>

        {/* Acciones del Navbar */}
        <div className="nav-actions">
          {/* Carga Rápida de Pedido (para voluntarios) */}
          <button 
            className="nav-btn"
            onClick={onOpenQuickOrder}
            title="Carga rápida de pedido manual (Mostrador)"
          >
            <PlusCircle size={16} />
            <span className="hide-on-mobile">Cargar Pedido</span>
          </button>

          {/* Estado de Supabase / Configuración */}
          <button 
            className="nav-btn supabase-status" 
            onClick={onOpenSettings}
            title={isSupabaseConfigured ? "Supabase Conectado" : "Configurar Supabase (Base de datos)"}
          >
            <span className={`status-dot ${isSupabaseConfigured ? 'connected' : 'disconnected'}`}></span>
            <Database size={15} />
            <span className="hide-on-mobile">{isSupabaseConfigured ? 'Supabase' : 'BD Offline'}</span>
          </button>

          {/* Toggle Vista Cliente vs Admin */}
          <button 
            className="nav-btn"
            onClick={() => setView(view === 'menu' ? 'admin' : 'menu')}
          >
            <ShieldAlert size={15} />
            <span>{view === 'menu' ? 'Admin' : 'Menú'}</span>
          </button>

          {/* Botón Carrito */}
          {view === 'menu' && (
            <button className="cart-btn" onClick={onOpenCart} aria-label="Abrir Carrito">
              <ShoppingBag size={18} />
              <span>Pedido</span>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
