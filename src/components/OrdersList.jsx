import React, { useState } from 'react';
import { 
  DollarSign, 
  Search, 
  Download, 
  RefreshCw, 
  MessageCircle, 
  Trash2, 
  MapPin,
  CheckCircle2,
  Clock,
  Check,
  RotateCcw,
  PackageCheck,
  Package
} from 'lucide-react';
import { PRECIO_HAMBURGUESA_GS } from '../data/initialData';

export const OrdersList = ({ 
  pedidos, 
  onRefresh, 
  onUpdatePayment, 
  onUpdateEntrega,
  onDeletePedido,
  isSupabase 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPayment, setFilterPayment] = useState('todos');
  const [activeTab, setActiveTab] = useState('pendientes'); // 'pendientes' | 'entregados'

  // Separar en dos listas: Por entregar vs Entregados
  const pedidosPendientes = pedidos.filter(p => !p.entregado);
  const pedidosEntregados = pedidos.filter(p => p.entregado);

  // Totales
  const totalHamburguesas = pedidos.reduce((acc, p) => acc + Number(p.cantidad || 0), 0);
  const hamburguesasPorEntregar = pedidosPendientes.reduce((acc, p) => acc + Number(p.cantidad || 0), 0);
  const hamburguesasEntregadas = pedidosEntregados.reduce((acc, p) => acc + Number(p.cantidad || 0), 0);

  const totalRecaudadoGs = pedidos.reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalPagadoGs = pedidos
    .filter(p => p.estado_pago === 'pagado')
    .reduce((acc, p) => acc + Number(p.total || 0), 0);
  const totalPendienteCobroGs = totalRecaudadoGs - totalPagadoGs;

  // Lista activa según la pestaña
  const currentList = activeTab === 'pendientes' ? pedidosPendientes : pedidosEntregados;

  // Filtrado por buscador y estado de pago
  const filteredList = currentList.filter(p => {
    const matchesPayment = filterPayment === 'todos' || p.estado_pago === filterPayment;
    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesPayment;

    const matchesName = (p.cliente_nombre || '').toLowerCase().includes(term);
    const matchesAddress = (p.direccion || '').toLowerCase().includes(term);
    const matchesPhone = (p.telefono || '').includes(term);

    return matchesPayment && (matchesName || matchesAddress || matchesPhone);
  });

  // Exportar a CSV
  const handleExportCSV = () => {
    if (pedidos.length === 0) {
      alert('No hay pedidos para exportar');
      return;
    }

    const headers = ['Cliente', 'Cantidad', 'Precio Unitario Gs', 'Total Gs', 'Direccion', 'Telefono', 'Estado Pago', 'Entregado', 'Fecha'];
    const rows = pedidos.map(p => [
      `"${(p.cliente_nombre || '').replace(/"/g, '""')}"`,
      p.cantidad || 1,
      PRECIO_HAMBURGUESA_GS,
      p.total || 0,
      `"${(p.direccion || '').replace(/"/g, '""')}"`,
      `"${p.telefono || ''}"`,
      `"${p.estado_pago || 'pendiente'}"`,
      p.entregado ? '"Si"' : '"No"',
      `"${p.created_at || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pedidos_hamburgueseada_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Enviar mensaje por WhatsApp
  const sendWhatsApp = (p) => {
    const phone = (p.telefono || '').replace(/\D/g, '');
    const estadoEntregaTexto = p.entregado ? '✅ Pedido Entregado' : '⏳ En preparación / Por entregar';
    const msg = `*¡Hola ${p.cliente_nombre}! 🍔*
Detalle de tu pedido para la *Hamburgueseada Solidaria*:
• Cantidad: ${p.cantidad} hamburguesa(s)
• Total: ${Number(p.total).toLocaleString('es-PY')} Gs.
• Pago: ${p.estado_pago === 'pagado' ? '✅ Ya Pagado' : '⏳ Pendiente de cobro'}
• Entrega: ${estadoEntregaTexto}
${p.direccion ? `• Dirección: ${p.direccion}\n` : ''}
¡Muchas gracias por colaborar con la causa solidaria! 🙌`;

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
            <p>Total Hamburguesas Pedidas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber" style={{ background: 'rgba(234, 88, 12, 0.15)', color: 'var(--orange-fire)' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h4>{hamburguesasPorEntregar}</h4>
            <p>Por Entregar ({pedidosPendientes.length} pedidos)</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <PackageCheck size={24} color="var(--green-light)" />
          </div>
          <div className="stat-info">
            <h4>{hamburguesasEntregadas}</h4>
            <p>Ya Entregadas ({pedidosEntregados.length} pedidos)</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h4>{totalRecaudadoGs.toLocaleString('es-PY')} Gs.</h4>
            <p>Total ({totalPagadoGs.toLocaleString('es-PY')} Gs. cobrado)</p>
          </div>
        </div>
      </div>

      {/* Pestañas Principales: Por Entregar vs Entregados */}
      <div className="orders-tabs-container">
        <button
          className={`orders-tab-btn ${activeTab === 'pendientes' ? 'active' : ''}`}
          onClick={() => setActiveTab('pendientes')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={18} />
            <span>Por Entregar</span>
            <span className="orders-tab-badge amber">
              {pedidosPendientes.length}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {hamburguesasPorEntregar} hamburguesas pendientes
          </div>
        </button>

        <button
          className={`orders-tab-btn ${activeTab === 'entregados' ? 'active' : ''}`}
          onClick={() => setActiveTab('entregados')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={18} />
            <span>Pedidos Entregados</span>
            <span className="orders-tab-badge green">
              {pedidosEntregados.length}
            </span>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {hamburguesasEntregadas} hamburguesas entregadas
          </div>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ position: 'relative', minWidth: '280px', flexGrow: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder={`Buscar en ${activeTab === 'pendientes' ? 'pedidos por entregar' : 'pedidos entregados'}...`}
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

      {/* Tabla de la Lista Activa */}
      <div className="table-responsive">
        {filteredList.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {activeTab === 'pendientes' ? '🎉' : '📦'}
            </div>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
              {activeTab === 'pendientes' 
                ? '¡No hay pedidos pendientes de entrega!' 
                : 'Aún no se ha marcado ningún pedido como entregado.'}
            </p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {activeTab === 'pendientes'
                ? 'Todos los pedidos registrados hasta el momento ya fueron entregados.'
                : 'Marcá el check de "Entregado" en la pestaña de pedidos pendientes para moverlos aquí.'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Estado Entrega</th>
                <th>Cliente / Nombre</th>
                <th>Cantidad</th>
                <th>Total (Gs.)</th>
                <th>Dirección (Opcional)</th>
                <th>Estado de Pago</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((p) => (
                <tr key={p.id} className={p.entregado ? 'row-delivered' : ''}>
                  {/* Botón / Check de Entrega */}
                  <td>
                    {p.entregado ? (
                      <button
                        onClick={() => onUpdateEntrega(p.id, false)}
                        className="delivery-check-btn delivered"
                        title="Hacé clic para volver este pedido a la lista de pendientes"
                      >
                        <Check size={14} />
                        <span>Entregado</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUpdateEntrega(p.id, true)}
                        className="delivery-check-btn pending"
                        title="Marcar como entregado y mover a la lista de entregados"
                      >
                        <Check size={14} />
                        <span>Entregar</span>
                      </button>
                    )}
                  </td>

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
                    <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--amber-light)' }}>
                      {p.cantidad}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: '4px' }}>
                      ({PRECIO_HAMBURGUESA_GS.toLocaleString('es-PY')} Gs. c/u)
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
                      title="Hacé clic para cambiar estado de pago"
                    >
                      {p.estado_pago === 'pagado' ? '✅ Ya Pagó' : '⏳ Pendiente'}
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
