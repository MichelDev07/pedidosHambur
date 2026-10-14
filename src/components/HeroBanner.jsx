import React from 'react';
import { Calendar, Clock, MapPin, Sparkles, Award, Ticket } from 'lucide-react';

export const HeroBanner = ({ config, totalHamburguesasVendidas = 0 }) => {
  const meta = config.metaHamburguesas || 500;
  const vendidas = Math.max(config.hamburguesasVendidasIniciales || 0, totalHamburguesasVendidas);
  const porcentaje = Math.min(100, Math.round((vendidas / meta) * 100));

  return (
    <section className="hero-section">
      <div className="hero-grid">
        {/* Columna Izquierda: Información de la Causa */}
        <div className="hero-content">
          <div className="cause-pill">
            <Sparkles size={14} />
            <span>Causa 100% Solidaria</span>
          </div>

          <h2 className="hero-title">
            Hamburguesas Artesanales & <span className="highlight">Gran Rifa</span>
          </h2>

          <p className="hero-subtitle">
            {config.subtitulo || "Comé rico, colaborá con la causa comunitaria y participá por increíbles premios. ¡Cada combo incluye números de rifa!"}
          </p>

          {/* Barra de Progreso Solidario */}
          <div className="solidary-progress-box">
            <div className="progress-header">
              <span>Meta Solidaria de Hamburguesas</span>
              <span><strong>{vendidas}</strong> de {meta} ({porcentaje}%)</span>
            </div>
            <div className="progress-track">
              <div 
                className="progress-fill" 
                style={{ width: `${porcentaje}%` }}
              ></div>
            </div>
          </div>

          {/* Barra de Fechas y Lugar */}
          <div className="event-details-bar">
            <div className="event-detail-item">
              <Calendar size={17} />
              <span>{config.fecha || "Sábado 24 de Octubre"}</span>
            </div>
            <div className="event-detail-item">
              <Clock size={17} />
              <span>{config.horario || "Desde las 20:00 hs"}</span>
            </div>
            <div className="event-detail-item">
              <MapPin size={17} />
              <span>{config.lugar || "Club Social y Deportivo"}</span>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Premios del Sorteo */}
        <div className="raffle-hero-card">
          <div className="raffle-card-header">
            <h3>
              <Ticket size={20} /> Premios de la Rifa
            </h3>
            <span className="raffle-live-badge">
              <Award size={12} /> Sorteo en Vivo
            </span>
          </div>

          <div className="prize-list">
            {(config.sorteoPremios || []).map((premio, idx) => (
              <div key={idx} className="prize-item">
                <div className="prize-badge">
                  {premio.icono || "🎁"}
                </div>
                <div className="prize-info">
                  <span className="prize-rank">{premio.puesto}</span>
                  <span className="prize-desc">{premio.premio}</span>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textAlign: 'center' }}>
            ℹ️ Tus números de rifa se asignan automáticamente al confirmar tu pedido.
          </p>
        </div>
      </div>
    </section>
  );
};
