import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OrderForm } from './components/OrderForm';
import { OrdersList } from './components/OrdersList';
import { OrderTicketModal } from './components/OrderTicketModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { 
  fetchPedidos, 
  savePedido, 
  updatePedidoPago,
  updatePedidoEntrega,
  deletePedido,
  getActiveCredentials 
} from './supabase';
import { PRECIO_HAMBURGUESA_GS } from './data/initialData';

export function App() {
  const [pedidos, setPedidos] = useState([]);
  const [isSupabase, setIsSupabase] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderResult, setLastOrderResult] = useState(null);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const loadData = async () => {
    const creds = getActiveCredentials();
    const { pedidos: pedidosData, isSupabase: supabaseActive } = await fetchPedidos();
    setPedidos(pedidosData);
    setIsSupabase(supabaseActive || creds.isConfigured);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cargar pedido
  const handleCreateOrder = async (orderData) => {
    setIsSubmitting(true);
    try {
      const result = await savePedido(orderData);
      setLastOrderResult(result);
      setIsTicketOpen(true);
      await loadData();
    } catch (err) {
      console.error('Error guardando pedido:', err);
      alert('Hubo un inconveniente al registrar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cambiar pago
  const handleUpdatePayment = async (id, newPayment) => {
    await updatePedidoPago(id, newPayment);
    await loadData();
  };

  // Cambiar entrega (Check de entregado)
  const handleUpdateEntrega = async (id, nuevoEstadoEntregado) => {
    await updatePedidoEntrega(id, nuevoEstadoEntregado);
    await loadData();
  };

  // Eliminar pedido
  const handleDeletePedido = async (id) => {
    await deletePedido(id);
    await loadData();
  };

  return (
    <div className="app-layout">
      {/* Banner si Supabase no está conectado */}
      {!isSupabase && (
        <div className="supabase-banner">
          <span>
            💡 <strong>Modo Local / Desconectado:</strong> Los pedidos se guardan en este navegador. Para sincronizarlos entre varios dispositivos o colaboradores en tiempo real, vinculá tu base de datos Supabase.
          </span>
          <button onClick={() => setIsSettingsOpen(true)}>
            Conectar Supabase
          </button>
        </div>
      )}

      {/* Barra de Navegación */}
      <Navbar 
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSupabaseConfigured={isSupabase}
      />

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Formulario Principal de Carga de Pedido */}
        <OrderForm 
          onSubmit={handleCreateOrder} 
          isSubmitting={isSubmitting} 
        />

        {/* Listado de Pedidos con Pestañas de Por Entregar y Entregados */}
        <OrdersList 
          pedidos={pedidos}
          onRefresh={loadData}
          onUpdatePayment={handleUpdatePayment}
          onUpdateEntrega={handleUpdateEntrega}
          onDeletePedido={handleDeletePedido}
          isSupabase={isSupabase}
        />
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2rem 1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)', marginTop: '3rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          🍔 Hamburgueseada Solidaria • {PRECIO_HAMBURGUESA_GS.toLocaleString('es-PY')} Gs. por pedido
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.35rem' }}>
          Página web 100% estática desplegable en Pages y conectada con Supabase
        </p>
      </footer>

      {/* Modal de Comprobante tras registrar */}
      <OrderTicketModal 
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        orderResult={lastOrderResult}
      />

      {/* Modal de Configuración Supabase */}
      <SupabaseSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={loadData}
      />
    </div>
  );
}

export default App;
