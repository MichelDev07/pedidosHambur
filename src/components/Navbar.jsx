import React from 'react';
import { Database, Heart } from 'lucide-react';
import { PRECIO_HAMBURGUESA_GS } from '../data/initialData';

export const Navbar = ({ 
  onOpenSettings, 
  isSupabaseConfigured
}) => {
  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Marca / Logo */}
        <div className="brand">
          <div className="brand-icon-wrapper">
            🍔
          </div>
          <div className="brand-text">
            <h1>Hamburgueseada Solidaria</h1>
            <span className="brand-badge">
              <Heart size={11} fill="currentColor" /> {PRECIO_HAMBURGUESA_GS.toLocaleString('es-PY')} Gs. c/u
            </span>
          </div>
        </div>

        {/* Acciones del Navbar */}
        <div className="nav-actions">
          {/* Estado de Supabase / Configuración */}
          <button 
            className="nav-btn supabase-status" 
            onClick={onOpenSettings}
            title={isSupabaseConfigured ? "Supabase Conectado" : "Configurar Supabase (Base de datos)"}
          >
            <span className={`status-dot ${isSupabaseConfigured ? 'connected' : 'disconnected'}`}></span>
            <Database size={15} />
            <span>{isSupabaseConfigured ? 'Supabase Conectado' : 'BD Offline'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
