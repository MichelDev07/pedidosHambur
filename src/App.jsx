import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { ProductCard } from './components/ProductCard';
import { CartModal } from './components/CartModal';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTicketModal } from './components/OrderTicketModal';
import { QuickOrderModal } from './components/QuickOrderModal';
import { SupabaseSettingsModal } from './components/SupabaseSettingsModal';
import { AdminDashboard } from './components/AdminDashboard';
import { PRODUCTOS_DEFAULT, EVENTO_DEFAULT } from './data/initialData';
import { 
  fetchPedidos, 
  fetchEventoConfig, 
  savePedido, 
  updatePedidoEstado, 
  updatePedidoPago,
  getActiveCredentials 
} from './supabase';
import { Heart, Sparkles, Database } from 'lucide-react';

export function App() {
  const [view, setView] = useState('menu'); // 'menu' | 'admin'
  const [products] = useState(PRODUCTOS_DEFAULT);
  const [activeCategory, setActiveCategory] = useState('todos');
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('solidaria_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [pedidos, setPedidos] = useState([]);
  const [isSupabase, setIsSupabase] = useState(false);
  const [config, setConfig] = useState(EVENTO_DEFAULT);

  // Modales
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastOrderResult, setLastOrderResult] = useState(null);

  // Guardar carrito en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('solidaria_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Cargar pedidos y configuración
  const loadData = async () => {
    const creds = getActiveCredentials();
    const configData = await fetchEventoConfig();
    setConfig(configData);

    const { pedidos: pedidosData, isSupabase: supabaseActive } = await fetchPedidos();
    setPedidos(pedidosData);
    setIsSupabase(supabaseActive || creds.isConfigured);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Agregar al carrito
  const handleAddToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  // Actualizar cantidad en carrito
  const handleUpdateQuantity = (productId, newQuantity) => {
    setCart(prev => {
      if (newQuantity <= 0) {
        return prev.filter(item => item.id !== productId);
      }
      return prev.map(item => item.id === productId ? { ...item, cantidad: newQuantity } : item);
    });
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Enviar pedido desde Checkout
  const handleSubmitOrder = async (orderData) => {
    setIsSubmitting(true);
    try {
      const result = await savePedido(orderData);
      setLastOrderResult(result);
      setCart([]);
      setIsCheckoutOpen(false);
      setIsTicketOpen(true);
      await loadData();
    } catch (err) {
      console.error('Error al guardar pedido:', err);
      alert('Hubo un inconveniente al registrar el pedido. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Carga rápida por voluntario
  const handleQuickSubmit = async (orderData) => {
    try {
      const result = await savePedido(orderData);
      setLastOrderResult(result);
      setIsQuickOrderOpen(false);
      setIsTicketOpen(true);
      await loadData();
    } catch (err) {
      console.error('Error al guardar pedido rápido:', err);
    }
  };

  // Actualizaciones desde el panel de administración
  const handleUpdateStatus = async (id, newStatus) => {
    await updatePedidoEstado(id, newStatus);
    await loadData();
  };

  const handleUpdatePayment = async (id, newPayment) => {
    await updatePedidoPago(id, newPayment);
    await loadData();
  };

  // Filtrar productos
  const filteredProducts = activeCategory === 'todos' 
    ? products 
    : products.filter(p => p.categoria === activeCategory);

  // Total hamburguesas vendidas calculadas
  const totalHamburguesasVendidas = pedidos
    .filter(p => p.estado_pedido !== 'cancelado')
    .reduce((acc, p) => acc + (p.cantidad_hamburguesas || 0), 0);

  const cartTotalCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="app-layout">
      {/* Banner de aviso si aún no configuró Supabase */}
      {!isSupabase && (
        <div className="supabase-banner">
          <span>
            💡 <strong>Modo Local / Desconectado:</strong> Los pedidos se están guardando en este navegador. Para compartirlos entre organizadores en tiempo real, vinculá tu base de datos Supabase.
          </span>
          <button onClick={() => setIsSettingsOpen(true)}>
            Conectar Supabase
          </button>
        </div>
      )}

      {/* Barra de Navegación */}
      <Navbar 
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isSupabaseConfigured={isSupabase}
        view={view}
        setView={setView}
        onOpenQuickOrder={() => setIsQuickOrderOpen(true)}
      />

      {/* Contenido Principal */}
      {view === 'menu' ? (
        <main>
          {/* Hero Solidario con Meta y Premios */}
          <HeroBanner 
            config={config} 
            totalHamburguesasVendidas={totalHamburguesasVendidas} 
          />

          {/* Menú de Pedidos */}
          <section className="menu-section">
            <div className="section-header">
              <div>
                <h2>Elegí tus Hamburguesas & Promos</h2>
                <p>Cada compra suma números directos para la rifa solidaria.</p>
              </div>

              {/* Filtros de Categoría */}
              <div className="category-filters">
                {[
                  { id: 'todos', label: 'Todo el Menú' },
                  { id: 'combos', label: '🔥 Combos con Rifa' },
                  { id: 'hamburguesas', label: '🍔 Hamburguesas' },
                  { id: 'extras', label: '🍟 Acompañamientos' },
                  { id: 'rifas', label: '🎟️ Rifas Solas' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    className={`filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grilla de Productos */}
            <div className="products-grid">
              {filteredProducts.map(product => {
                const cartItem = cart.find(it => it.id === product.id);
                return (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    cartItem={cartItem}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateQuantity}
                  />
                );
              })}
            </div>
          </section>
        </main>
      ) : (
        <AdminDashboard 
          pedidos={pedidos}
          onRefresh={loadData}
          onUpdateStatus={handleUpdateStatus}
          onUpdatePayment={handleUpdatePayment}
          onOpenQuickOrder={() => setIsQuickOrderOpen(true)}
          config={config}
          isSupabase={isSupabase}
        />
      )}

      {/* Footer Solidario */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '2.5rem 1.5rem', textAlign: 'center', background: 'rgba(0,0,0,0.3)', marginTop: '4rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--amber-light)' }}>
            🍔 Gran Hamburgueseada & Rifa Solidaria
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {config.causa}
          </p>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            Página 100% estática lista para desplegar en GitHub Pages • Conectada a Supabase
          </div>
        </div>
      </footer>

      {/* Modal Carrito */}
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Modal Checkout */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
        cartItems={cart}
        config={config}
        onSubmitOrder={handleSubmitOrder}
        isSubmitting={isSubmitting}
      />

      {/* Modal Ticket Digital con Rifa */}
      <OrderTicketModal 
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        orderResult={lastOrderResult}
        config={config}
      />

      {/* Modal Carga Rápida de Pedidos (Mostrador) */}
      <QuickOrderModal 
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        onQuickSubmit={handleQuickSubmit}
      />

      {/* Modal Configuración Supabase */}
      <SupabaseSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigSaved={loadData}
      />
    </div>
  );
}

export default App;
