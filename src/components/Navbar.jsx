import React from 'react';
import { Database, Heart } from 'lucide-react';
import { PRECIO_HAMBURGUESA_GS } from '../data/initialData';

// Ícono SVG de Instagram nítido y liviano
const InstagramIcon = ({ size = 14, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export const Navbar = ({ 
  onOpenSettings, 
  isSupabaseConfigured
}) => {
  return (
    <>
      {/* Barra de Créditos Superior: Desarrollado por Michel Soto */}
      <div className="top-creator-bar">
        <span className="creator-label">Desarrollado por</span>
        <a 
          href="https://instagram.com/michelsottto" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="creator-link"
          title="Ver perfil de Instagram de Michel Soto"
        >
          <InstagramIcon size={14} className="creator-ig-icon" />
          <strong className="creator-name">Michel Soto</strong>
        </a>
      </div>

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
    </>
  );
};
