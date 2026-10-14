import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  Ticket, 
  Flame, 
  Search, 
  Download, 
  PlusCircle, 
  RefreshCw, 
  MessageCircle, 
  Trophy, 
  CheckCircle, 
  Clock, 
  ChefHat, 
  Bike,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AdminDashboard = ({ 
  pedidos, 
  onRefresh, 
  onUpdateStatus, 
  onUpdatePayment, 
  onOpenQuickOrder,
  config,
  isSupabase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [isSpinningRaffle, setIsSpinningRaffle] = useState(false);
  const [winner, setWinner] = useState(null);

  // Métricas
  const totalRecaudado = pedidos
    .filter(p => p.estado_pedido !== 'cancelado')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);

  const totalHamburguesas = pedidos
    .filter(p => p.estado_pedido !== 'cancelado')
    .reduce((acc, p) => acc + (p.cantidad_hamburguesas || 0), 0);

  // Extraer todos los números de rifa vendidos
  const allRaffleEntries = pedidos
    .filter(p => p.estado_pedido !== 'cancelado')
    .flatMap(p => (p.numeros_rifa || []).map(num => ({
      numero: num,
      cliente: p.cliente_nombre,
      telefono: p.cliente_telefono,
      codigo: p.codigo_pedido
    })));

  // Filtrado de pedidos
  const filteredPedidos = pedidos.filter(p => {
    const matchesStatus = statusFilter === 'todos' || p.estado_pedido === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesName = (p.cliente_nombre || '').toLowerCase().includes(term);
    const matchesCode = (p.codigo_pedido || '').toLowerCase().includes(term);
    const matchesPhone = (p.cliente_telefono || '').includes(term);
    const matchesRaffle = (p.numeros_rifa || []).some(n => String(n).includes(term));

    return matchesStatus && (matchesName || matchesCode || matchesPhone || matchesRaffle);
  });

  // Exportar a CSV
  const handleExportCSV = () => {
    if (pedidos.length === 0) {
      alert('No hay pedidos para exportar');
      return;
    }

    const headers = [
      'Codigo', 
      'Cliente', 
      'Telefono', 
      'Modalidad', 
      'Direccion', 
      'Horario', 
      'Total', 
      'Estado Pedido', 
      'Estado Pago', 
      'Metodo Pago', 
      'Numeros Rifa', 
      'Fecha'
    ];

    const rows = pedidos.map(p => [
      `"${p.codigo_pedido || ''}"`,
      `"${(p.cliente_nombre || '').replace(/"/g, '""')}"`,
      `"${p.cliente_telefono || ''}"`,
      `"${p.modalidad || ''}"`,
      `"${(p.direccion || '').replace(/"/g, '""')}"`,
      `"${p.horario_preferido || ''}"`,
      p.total || 0,
      `"${p.estado_pedido || ''}"`,
      `"${p.estado_pago || ''}"`,
      `"${p.metodo_pago || ''}"`,
      `"${(p.numeros_rifa || []).join(', ')}"`,
      `"${p.created_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedidos_hamburguesas_solidarias_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sorteador en Vivo
  const handleRunRaffle = () => {
    if (allRaffleEntries.length === 0) {
      alert('Aún no hay números de rifa vendidos para sortear.');
      return;
    }

    setIsSpinningRaffle(true);
    setWinner(null);

    let counter = 0;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * allRaffleEntries.length);
      setWinner(allRaffleEntries[randomIndex]);
      counter++;
      if (counter > 25) {
        clearInterval(interval);
        setIsSpinningRaffle(false);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      }
    }, 100);
  };

  // Enviar mensaje de WhatsApp avisando que el pedido está listo
  const notifyCustomerReady = (p) => {
    const phone = (p.cliente_telefono || '').replace(/\D/g, '');
    if (!phone) {
      alert('Este pedido no tiene número de teléfono registrado.');
      return;
    }
    const msg = `¡Hola ${p.cliente_nombre}! 🍔 Te avisamos que tu pedido solidario *${p.codigo_pedido}* ya está LISTO para retirar en ${config.lugar || 'el Club'}. ¡Te esperamos!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="admin-container">
      {/* Barra de Encabezado Admin */}
      <div className="admin-header-bar">
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Panel de Control de la Organización</span>
            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', background: isSupabase ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: isSupabase ? 'var(--green-light)' : 'var(--amber-light)', fontWeight: 700 }}>
              {isSupabase ? '☁️ Supabase Cloud' : '💾 Local Storage'}
            </span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Gestioná los pedidos en tiempo real, cocina, cobros y sorteo oficial de la rifa solidaria.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={onRefresh} title="Actualizar pedidos">
            <RefreshCw size={16} />
            <span>Actualizar</span>
          </button>
          <button className="btn-secondary" onClick={handleExportCSV} title="Descargar planilla Excel">
            <Download size={16} />
            <span>Exportar CSV</span>
          </button>
          <button className="btn-primary" onClick={onOpenQuickOrder}>
            <PlusCircle size={16} />
            <span>Cargar Pedido Manual</span>
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas Principales */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <div className="stat-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h4>${totalRecaudado.toLocaleString('es-AR')}</h4>
            <p>Total Recaudado</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Flame size={24} />
          </div>
          <div className="stat-info">
            <h4>{totalHamburguesas}</h4>
            <p>Hamburguesas Vendidas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">
            <Ticket size={24} />
          </div>
          <div className="stat-info">
            <h4>{allRaffleEntries.length}</h4>
            <p>Números de Rifa Activos</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h4>{pedidos.length}</h4>
            <p>Pedidos Registrados</p>
          </div>
        </div>
      </div>

      {/* Ruleta / Sorteador en Vivo */}
      <div className="roulette-box">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--amber-light)', fontWeight: 800 }}>
          <Trophy size={20} />
          <span>SORTEADOR OFICIAL EN VIVO</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
          Elegí un número ganador al azar entre los {allRaffleEntries.length} números de rifa emitidos.
        </p>

        <div className="roulette-display">
          {winner ? `#${String(winner.numero).padStart(4, '0')}` : '----'}
        </div>

        {winner && (
          <div style={{ margin: '0.75rem 0', animation: 'fadeIn 0.3s ease' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--green-light)' }}>
              🎉 ¡Ganador: {winner.cliente}!
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Pedido: {winner.codigo} • Tel: {winner.telefono}
            </div>
          </div>
        )}

        <button 
          className="btn-primary" 
          onClick={handleRunRaffle} 
          disabled={isSpinningRaffle || allRaffleEntries.length === 0}
          style={{ marginTop: '0.75rem' }}
        >
          <Sparkles size={18} />
          <span>{isSpinningRaffle ? 'Girando el bolillero...' : 'Sortear Número Ganador'}</span>
        </button>
      </div>

      {/* Filtros de la Tabla */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Buscador */}
        <div style={{ position: 'relative', minWidth: '280px', flexGrow: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder="Buscar por cliente, código, teléfono o # rifa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros de estado */}
        <div className="category-filters">
          {['todos', 'recibido', 'cocina', 'listo', 'entregado'].map((st) => (
            <button
              key={st}
              className={`filter-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
              style={{ textTransform: 'capitalize' }}
            >
              {st === 'todos' ? 'Todos los Pedidos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="table-responsive">
        {filteredPedidos.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No se encontraron pedidos con los filtros aplicados.
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código / Hora</th>
                <th>Cliente</th>
                <th>Modalidad</th>
                <th>Detalle Items</th>
                <th>Rifas</th>
                <th>Total / Pago</th>
                <th>Estado Cocina</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.map((p) => (
                <tr key={p.id}>
                  {/* Código y fecha */}
                  <td>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--amber-light)' }}>
                      {p.codigo_pedido}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>

                  {/* Cliente y teléfono */}
                  <td>
                    <div style={{ fontWeight: 700 }}>{p.cliente_nombre}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      📞 {p.cliente_telefono}
                    </div>
                  </td>

                  {/* Modalidad */}
                  <td>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      {p.modalidad === 'retiro' ? '📍 Retiro en Evento' : `🛵 Envío (${p.direccion || 'Domicilio'})`}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                      {p.horario_preferido}
                    </div>
                  </td>

                  {/* Items resumidos */}
                  <td>
                    <div style={{ fontSize: '0.8rem', maxWidth: '240px' }}>
                      {(p.items || []).map((it, idx) => (
                        <div key={idx} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <strong>{it.cantidad}x</strong> {it.nombre}
                        </div>
                      ))}
                    </div>
                    {p.observaciones && (
                      <div style={{ fontSize: '0.72rem', color: 'var(--amber-light)', marginTop: '0.2rem', fontStyle: 'italic' }}>
                        Nota: {p.observaciones}
                      </div>
                    )}
                  </td>

                  {/* Números de Rifa */}
                  <td>
                    {(p.numeros_rifa || []).length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {p.numeros_rifa.map(num => (
                          <span 
                            key={num} 
                            style={{ 
                              fontFamily: 'var(--font-mono)', 
                              fontSize: '0.75rem', 
                              background: 'rgba(245, 158, 11, 0.15)', 
                              color: 'var(--amber-light)', 
                              padding: '0.1rem 0.35rem', 
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

                  {/* Total y Pago */}
                  <td>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                      ${Number(p.total).toLocaleString('es-AR')}
                    </div>
                    <button
                      onClick={() => onUpdatePayment(p.id, p.estado_pago === 'pagado' ? 'pendiente' : 'pagado')}
                      style={{
                        background: p.estado_pago === 'pagado' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        border: `1px solid ${p.estado_pago === 'pagado' ? 'var(--green-solidario)' : 'var(--amber-primary)'}`,
                        color: p.estado_pago === 'pagado' ? 'var(--green-light)' : 'var(--amber-light)',
                        borderRadius: 'var(--radius-full)',
                        padding: '0.15rem 0.5rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: '0.25rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                      title="Hacé clic para cambiar estado de pago"
                    >
                      {p.estado_pago === 'pagado' ? '✅ Cobrado' : '⏳ Pendiente'}
                    </button>
                  </td>

                  {/* Selector de Estado */}
                  <td>
                    <select
                      value={p.estado_pedido}
                      onChange={(e) => onUpdateStatus(p.id, e.target.value)}
                      style={{
                        background: 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.8rem',
                        fontFamily: 'inherit',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="recibido">📥 Recibido</option>
                      <option value="cocina">🍳 En Cocina</option>
                      <option value="listo">✅ Listo para Retirar</option>
                      <option value="entregado">🏁 Entregado</option>
                      <option value="cancelado">❌ Cancelado</option>
                    </select>
                  </td>

                  {/* Botón WhatsApp de aviso */}
                  <td>
                    <button
                      onClick={() => notifyCustomerReady(p)}
                      style={{
                        background: '#25D366',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.4rem 0.6rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}
                      title="Enviar aviso por WhatsApp de pedido listo"
                    >
                      <MessageCircle size={13} />
                      <span>Avisar</span>
                    </button>
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
