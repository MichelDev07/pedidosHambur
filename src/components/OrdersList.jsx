import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Ticket, 
  Search, 
  Download, 
  RefreshCw, 
  MessageCircle, 
  Trophy, 
  Trash2, 
  Sparkles,
  MapPin,
  CheckCircle,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRECIO_HAMBURGUESA_GS } from '../data/initialData';

export const OrdersList = ({ 
  pedidos, 
  onRefresh, 
  onUpdatePayment, 
  onDeletePedido,
  isSupabase 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('todos');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);

  // Totales
  const totalHamburguesas = pedidos.reduce((acc, p) => acc + Number(p.cantidad || 0), 0);
  const totalRecaudadoGs = pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalPagadoGs = pedidos
    .filter(p => p.estado_pago === 'pagado')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalPendienteGs = totalRecaudadoGs - totalPagadoGs;

  // Lista plana de todos los números de rifa vendidos
  const allRaffleNumbers = pedidos.flatMap(p => (p.numeros_rifa || []).map(num => ({
    numero: num,
    cliente: p.cliente_nombre,
    telefono: p.telefono,
    direccion: p.direccion
  })));

  // Filtro
  const filteredPedidos = pedidos.filter(p => {
    const matchesFilter = filterPayment === 'todos' || p.estado_pago === filterPayment;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesFilter;

    const matchesName = (p.cliente_nombre || '').toLowerCase().includes(term);
    const matchesAddress = (p.direccion || '').toLowerCase().includes(term);
    const matchesPhone = (p.telefono || '').includes(term);
    const matchesRaffle = (p.numeros_rifa || []).some(n => String(n).includes(term));

    return matchesFilter && (matchesName || matchesAddress || matchesPhone || matchesRaffle);
  });

  // Exportar a CSV
  const handleExportCSV = () => {
    if (pedidos.length === 0) {
      alert('No hay pedidos para exportar');
      return;
    }

    const headers = ['Cliente', 'Cantidad', 'Precio Unitario Gs', 'Total Gs', 'Direccion', 'Telefono', 'Estado Pago', 'Numeros Rifa', 'Fecha'];
    const rows = pedidos.map(p => [
      `"${(p.cliente_nombre || '').replace(/"/g, '""')}"`,
      p.cantidad || 1,
      PRECIO_HAMBURGUESA_GS,
      p.total || 0,
      `"${(p.direccion || '').replace(/"/g, '""')}"`,
      `"${p.telefono || ''}"`,
      `"${p.estado_pago || 'pendiente'}"`,
      `"${(p.numeros_rifa || []).join(', ')}"`,
      `"${p.created_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedidos_hamburguesas_14000gs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorteo en Vivo
  const handleRunRaffle = () => {
    if (allRaffleNumbers.length === 0) {
      alert('Aún no hay números de rifa registrados para sortear.');
      return;
    }

    setIsSpinning(true);
    setWinner(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allRaffleNumbers.length);
      setWinner(allRaffleNumbers[randomIndex]);
      counter++;
      if (counter > 25) {
        clearInterval(interval);
        setIsSpinning(false);
        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    }, 100);
  };

  // Enviar comprobante por WhatsApp
  const sendWhatsApp = (p) => {
    const phone = (p.telefono || '').replace(/\D/g, '');
    const rifasText = (p.numeros_rifa || []).length > 0
      ? `🎟️ *NÚMEROS DE RIFA:* #${p.numeros_rifa.join(', #')}`
      : '';

    const msg = `*¡Hola ${p.cliente_nombre}! 🍔🎟️*
Confirmamos tu pedido para la Rifa Solidaria de Hamburguesas:
• Cantidad: ${p.cantidad} hamburguesas
• Total: ${Number(p.total).toLocaleString('es-PY')} Gs.
• Estado: ${p.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
${p.direccion ? `• Dirección: ${p.direccion}\n` : ''}
${rifasText}

¡Muchas gracias por colaborar!`;

    const url = phone 
      ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="orders-section">
      {/* Tarjetas de Métricas */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon amber">
            🍔
          </div>
          <div className="stat-info">
            <h4>{totalHamburguesas}</h4>
            <p>Hamburguesas Pedidas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h4>{totalRecaudadoGs.toLocaleString('es-PY')} Gs.</h4>
            <p>Total Recaudado ({totalPagadoGs.toLocaleString('es-PY')} Gs. cobrado)</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Ticket size={24} />
          </div>
          <div className="stat-info">
            <h4>{allRaffleNumbers.length}</h4>
            <p>Números de Rifa Asignados</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h4>{pedidos.length}</h4>
            <p>Personas que pidieron</p>
          </div>
        </div>
      </div>

      {/* Sorteador Oficial en Vivo */}
      <div className="roulette-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--amber-light)', fontWeight: 800 }}>
          <Trophy size={20} />
          <span>SORTEADOR OFICIAL DE LA RIFA</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Sorteo aleatorio entre los {allRaffleNumbers.length} números de rifa emitidos.
        </p>

        <div className="roulette-display">
          {winner ? `#${winner.numero}` : '----'}
        </div>

        {winner && (
          <div style={{ margin: '0.75rem 0', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--green-light)' }}>
              🎉 ¡Ganador/a: {winner.cliente}!
            </div>
            {winner.direccion && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Dirección: {winner.direccion}
              </div>
            )}
            {winner.telefono && (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Teléfono: {winner.telefono}
              </div>
            )}
          </div>
        )}

        <button 
          className="btn-primary" 
          onClick={handleRunRaffle} 
          disabled={isSpinning || allRaffleNumbers.length === 0}
          style={{ marginTop: '0.75rem' }}
        >
          <Sparkles size={18} />
          <span>{isSpinning ? 'Girando sorteo...' : 'Sortear Número Ganador'}</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', minWidth: '280px', flexGrow: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Buscar por nombre, dirección o # rifa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <div className="category-filters">
            {[
              { id: 'todos', label: 'Todos' },
              { id: 'pagado', label: '✅ Pagados' },
              { id: 'pendiente', label: '⏳ Pendientes' }
            ].map((f) => (
              <button
                key={f.id}
                className={`filter-btn ${filterPayment === f.id ? 'active' : ''}`}
                onClick={() => setFilterPayment(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <button className="btn-secondary" onClick={onRefresh} title="Actualizar lista">
            <RefreshCw size={15} />
          </button>
          <button className="btn-secondary" onClick={handleExportCSV} title="Descargar planilla Excel">
            <Download size={15} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="table-responsive">
        {filteredPedidos.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay pedidos registrados con los filtros seleccionados.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente / Nombre</th>
                <th>Hamburguesas</th>
                <th>Total (Gs.)</th>
                <th>Dirección (Opcional)</th>
                <th>Números de Rifa</th>
                <th>Estado de Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.map((p) => (
                <tr key={p.id}>
                  {/* Nombre y teléfono */}
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.cliente_nombre}</div>
                    {p.telefono && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        📞 {p.telefono}
                      </div>
                    )}
                  </td>

                  {/* Cantidad */}
                  <td>
                    <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--amber-light)' }}>
                      {p.cantidad}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '4px' }}>
                      ({PRECIO_HAMBURGUESA_GS.toLocaleString('es-PY')} c/u)
                    </span>
                  </td>

                  {/* Total */}
                  <td>
                    <div style={{ fontWeight: 900, fontSize: '1rem' }}>
                      {Number(p.total).toLocaleString('es-PY')} Gs.
                    </div>
                  </td>

                  {/* Dirección */}
                  <td>
                    {p.direccion ? (
                      <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} color="var(--amber-primary)" style={{ flexShrink: 0 }} />
                        <span>{p.direccion}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>—</span>
                    )}
                  </td>

                  {/* Números de Rifa */}
                  <td>
                    {(p.numeros_rifa || []).length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '200px' }}>
                        {p.numeros_rifa.map((num) => (
                          <span 
                            key={num}
                            style={{ 
                              fontFamily: 'var(--font-mono)', 
                              fontSize: '0.75rem', 
                              background: 'rgba(245, 158, 11, 0.15)', 
                              color: 'var(--amber-light)', 
                              padding: '0.15rem 0.4rem', 
                              borderRadius: '4px',
                              fontWeight: 700
                            }}
                          >
                            #{num}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>-</span>
                    )}
                  </td>

                  {/* Toggle de Pago */}
                  <td>
                    <button
                      onClick={() => onUpdatePayment(p.id, p.estado_pago === 'pagado' ? 'pendiente' : 'pagado')}
                      style={{
                        background: p.estado_pago === 'pagado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        border: `1px solid ${p.estado_pago === 'pagado' ? 'var(--green-solidario)' : 'var(--amber-primary)'}`,
                        color: p.estado_pago === 'pagado' ? 'var(--green-light)' : 'var(--amber-light)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                      title="Hacé clic para cambiar estado"
                    >
                      {p.estado_pago === 'pagado' ? '✅ Pagado' : '⏳ Pendiente'}
                    </button>
                  </td>

                  {/* Acciones */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <button
                        onClick={() => sendWhatsApp(p)}
                        style={{
                          background: '#25D366',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.35rem 0.55rem',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}
                        title="Enviar comprobante por WhatsApp"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </button>

                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar pedido de ${p.cliente_nombre}?`)) {
                            onDeletePedido(p.id);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--red-cancel)',
                          cursor: 'pointer',
                          padding: '0.35rem'
                        }}
                        title="Eliminar pedido"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
