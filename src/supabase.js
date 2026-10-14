import { createClient } from '@supabase/supabase-js';
import { EVENTO_DEFAULT, PRODUCTOS_DEFAULT } from './data/initialData';

// Claves de almacenamiento local para configuración y fallback offline
const STORAGE_KEYS = {
  SUPABASE_URL: 'solidaria_supabase_url',
  SUPABASE_KEY: 'solidaria_supabase_anon_key',
  PEDIDOS_LOCAL: 'solidaria_pedidos_cache',
  CONFIG_LOCAL: 'solidaria_evento_config',
  ULTIMO_NUMERO_RIFA: 'solidaria_last_raffle_num'
};

// Obtener credenciales activas (prioridad: variables de entorno Vite -> localStorage)
export const getActiveCredentials = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const localUrl = localStorage.getItem(STORAGE_KEYS.SUPABASE_URL);
  const localKey = localStorage.getItem(STORAGE_KEYS.SUPABASE_KEY);

  const url = (envUrl && envUrl.startsWith('http')) ? envUrl : (localUrl || '');
  const key = (envKey && envKey.length > 20) ? envKey : (localKey || '');

  return {
    url,
    key,
    isFromEnv: Boolean(envUrl && envKey),
    isConfigured: Boolean(url && key && url.startsWith('http') && key.length > 20)
  };
};

let cachedClient = null;
let currentClientKey = '';

// Obtener instancia del cliente Supabase
export const getSupabaseClient = () => {
  const { url, key, isConfigured } = getActiveCredentials();
  if (!isConfigured) return null;

  const clientKey = `${url}:::${key}`;
  if (cachedClient && currentClientKey === clientKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false }
    });
    currentClientKey = clientKey;
    return cachedClient;
  } catch (err) {
    console.error('Error al inicializar cliente Supabase:', err);
    return null;
  }
};

// Guardar credenciales en localStorage (ideal para despliegue estático en Pages)
export const saveSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  if (key) localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
  cachedClient = null;
  currentClientKey = '';
};

// Limpiar credenciales
export const clearSupabaseCredentials = () => {
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
  cachedClient = null;
  currentClientKey = '';
};

// Testear la conexión a Supabase
export const testSupabaseConnection = async () => {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, message: 'No hay credenciales de Supabase configuradas' };
  }

  try {
    const { data, error } = await client.from('pedidos').select('id').limit(1);
    if (error) {
      // Podría ser que la tabla no esté creada aún
      if (error.code === '42P01') {
        return {
          ok: false,
          needsSchema: true,
          message: 'Conectó a Supabase pero la tabla "pedidos" no existe aún. ¡Ejecutá el script SQL en el SQL Editor!'
        };
      }
      return { ok: false, message: `Error de Supabase: ${error.message}` };
    }
    return { ok: true, message: '¡Conexión exitosa con la base de datos Supabase!' };
  } catch (err) {
    return { ok: false, message: `Fallo de conexión: ${err.message || 'Verifica la URL y la Anon Key'}` };
  }
};

// ==========================================
// GESTIÓN DE NÚMEROS DE RIFA
// ==========================================
export const getNextRaffleNumbers = async (cantidad = 1) => {
  if (cantidad <= 0) return [];

  const client = getSupabaseClient();
  let baseNumber = 101; // Comenzamos con números amigables de 3-4 dígitos

  if (client) {
    try {
      const { data, error } = await client
        .from('rifa_numeros')
        .select('numero')
        .order('numero', { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0 && data[0].numero) {
        baseNumber = data[0].numero + 1;
      } else {
        // Consultar max en pedidos si rifa_numeros no tiene registros
        const { data: pedidosData } = await client
          .from('pedidos')
          .select('numeros_rifa');
        if (pedidosData && pedidosData.length > 0) {
          const allNums = pedidosData.flatMap(p => p.numeros_rifa || []);
          if (allNums.length > 0) {
            baseNumber = Math.max(...allNums) + 1;
          }
        }
      }
    } catch (e) {
      console.warn('Fallback a conteo local para números de rifa:', e);
    }
  }

  // Backup en localStorage
  const localLast = parseInt(localStorage.getItem(STORAGE_KEYS.ULTIMO_NUMERO_RIFA) || '100', 10);
  if (localLast >= baseNumber) {
    baseNumber = localLast + 1;
  }

  const generated = [];
  for (let i = 0; i < cantidad; i++) {
    generated.push(baseNumber + i);
  }

  localStorage.setItem(STORAGE_KEYS.ULTIMO_NUMERO_RIFA, String(baseNumber + cantidad - 1));
  return generated;
};

// ==========================================
// PEDIDOS CRUD
// ==========================================

// Guardar pedido (en Supabase si está disponible, o en localStorage de respaldo)
export const savePedido = async (pedidoData) => {
  const client = getSupabaseClient();
  const timestamp = new Date().toISOString();
  
  // Generar código amigable: HAMB-4812
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const codigoPedido = pedidoData.codigo_pedido || `HAMB-${randomSuffix}`;

  // Calcular cantidad de números de rifa a otorgar
  const totalRifas = pedidoData.items.reduce((acc, item) => {
    return acc + ((item.numerosRifa || 0) * (item.cantidad || 1));
  }, 0);

  // Asignar los números de rifa
  const numerosRifa = pedidoData.numeros_rifa && pedidoData.numeros_rifa.length > 0 
    ? pedidoData.numeros_rifa 
    : await getNextRaffleNumbers(totalRifas);

  // Calcular hamburguesas totales para la meta solidaria
  const cantidadHamburguesas = pedidoData.items.reduce((acc, item) => {
    if (item.categoria === 'combos' || item.categoria === 'hamburguesas') {
      return acc + (item.cantidad || 1);
    }
    return acc;
  }, 0);

  const newPedido = {
    codigo_pedido: codigoPedido,
    cliente_nombre: pedidoData.cliente_nombre.trim(),
    cliente_telefono: pedidoData.cliente_telefono.trim(),
    modalidad: pedidoData.modalidad, // 'retiro' | 'envio'
    direccion: pedidoData.direccion ? pedidoData.direccion.trim() : '',
    horario_preferido: pedidoData.horario_preferido || 'Lo antes posible',
    metodo_pago: pedidoData.metodo_pago, // 'transferencia' | 'efectivo'
    comprobante_pago: pedidoData.comprobante_pago || '',
    observaciones: pedidoData.observaciones || '',
    total: Number(pedidoData.total),
    cantidad_hamburguesas: cantidadHamburguesas,
    numeros_rifa: numerosRifa,
    estado_pago: pedidoData.estado_pago || (pedidoData.metodo_pago === 'efectivo' ? 'pendiente' : 'pendiente'),
    estado_pedido: 'recibido',
    items: pedidoData.items,
    origen: pedidoData.origen || 'web',
    created_at: timestamp
  };

  let savedInSupabase = false;

  if (client) {
    try {
      const { data, error } = await client
        .from('pedidos')
        .insert([newPedido])
        .select()
        .single();

      if (error) {
        console.error('Error insertando en Supabase:', error);
      } else {
        savedInSupabase = true;
        newPedido.id = data.id;

        // Registrar números en la tabla rifa_numeros para auditoría
        if (numerosRifa.length > 0) {
          const rifaRows = numerosRifa.map(num => ({
            numero: num,
            pedido_id: data.id,
            codigo_pedido: codigoPedido,
            cliente_nombre: newPedido.cliente_nombre,
            cliente_telefono: newPedido.cliente_telefono
          }));
          await client.from('rifa_numeros').insert(rifaRows);
        }
      }
    } catch (err) {
      console.error('Excepción al guardar en Supabase:', err);
    }
  }

  // Si no tiene id generado por Supabase, crear UUID local
  if (!newPedido.id) {
    newPedido.id = 'loc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  }

  // Guardar siempre en cache local para redundancia
  const localPedidos = getLocalPedidos();
  localPedidos.unshift(newPedido);
  saveLocalPedidos(localPedidos);

  return {
    success: true,
    pedido: newPedido,
    savedInSupabase,
    codigoPedido: newPedido.codigo_pedido,
    numerosRifa: newPedido.numeros_rifa
  };
};

// Obtener todos los pedidos
export const fetchPedidos = async () => {
  const client = getSupabaseClient();
  const localPedidos = getLocalPedidos();

  if (!client) {
    return { pedidos: localPedidos, isSupabase: false };
  }

  try {
    const { data, error } = await client
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error fetching pedidos de Supabase, usando local:', error);
      return { pedidos: localPedidos, isSupabase: false, error: error.message };
    }

    // Actualizar cache local
    if (data) {
      saveLocalPedidos(data);
      return { pedidos: data, isSupabase: true };
    }
  } catch (err) {
    console.warn('Fallo de red Supabase:', err);
  }

  return { pedidos: localPedidos, isSupabase: false };
};

// Actualizar estado del pedido (recibido -> cocina -> listo -> entregado -> cancelado)
export const updatePedidoEstado = async (id, nuevoEstado) => {
  const client = getSupabaseClient();
  
  // Actualizar local
  const localPedidos = getLocalPedidos();
  const updated = localPedidos.map(p => p.id === id ? { ...p, estado_pedido: nuevoEstado } : p);
  saveLocalPedidos(updated);

  if (client) {
    try {
      await client.from('pedidos').update({ estado_pedido: nuevoEstado }).eq('id', id);
    } catch (e) {
      console.error('Error actualizando estado en Supabase:', e);
    }
  }
  return true;
};

// Actualizar estado de pago (pendiente -> pagado)
export const updatePedidoPago = async (id, nuevoEstadoPago) => {
  const client = getSupabaseClient();
  
  // Actualizar local
  const localPedidos = getLocalPedidos();
  const updated = localPedidos.map(p => p.id === id ? { ...p, estado_pago: nuevoEstadoPago } : p);
  saveLocalPedidos(updated);

  if (client) {
    try {
      await client.from('pedidos').update({ estado_pago: nuevoEstadoPago }).eq('id', id);
    } catch (e) {
      console.error('Error actualizando pago en Supabase:', e);
    }
  }
  return true;
};

// Eliminar pedido
export const deletePedido = async (id) => {
  const client = getSupabaseClient();
  
  const localPedidos = getLocalPedidos();
  const updated = localPedidos.filter(p => p.id !== id);
  saveLocalPedidos(updated);

  if (client) {
    try {
      await client.from('pedidos').delete().eq('id', id);
    } catch (e) {
      console.error('Error eliminando de Supabase:', e);
    }
  }
  return true;
};

// Métodos auxiliares para localStorage
export const getLocalPedidos = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PEDIDOS_LOCAL);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveLocalPedidos = (pedidos) => {
  try {
    localStorage.setItem(STORAGE_KEYS.PEDIDOS_LOCAL, JSON.stringify(pedidos));
  } catch (e) {
    console.error('Error guardando en localStorage:', e);
  }
};

// Configuración del evento
export const fetchEventoConfig = async () => {
  const client = getSupabaseClient();
  const localRaw = localStorage.getItem(STORAGE_KEYS.CONFIG_LOCAL);
  let currentConfig = localRaw ? JSON.parse(localRaw) : EVENTO_DEFAULT;

  if (client) {
    try {
      const { data, error } = await client.from('evento_config').select('*').limit(1).maybeSingle();
      if (!error && data) {
        currentConfig = {
          ...currentConfig,
          nombre: data.nombre_evento || currentConfig.nombre,
          causa: data.causa || currentConfig.causa,
          metaHamburguesas: data.meta_hamburguesas || currentConfig.metaHamburguesas,
          fecha: data.fecha_evento || currentConfig.fecha,
          lugar: data.lugar || currentConfig.lugar,
          aliasPago: data.alias_pago || currentConfig.aliasPago,
          cbuPago: data.cbu_pago || currentConfig.cbuPago,
          titularPago: data.titular_pago || currentConfig.titularPago,
          telefonoWhatsApp: data.telefono_whatsapp || currentConfig.telefonoWhatsApp
        };
        localStorage.setItem(STORAGE_KEYS.CONFIG_LOCAL, JSON.stringify(currentConfig));
      }
    } catch (e) {
      console.warn('Error leyendo evento_config de Supabase:', e);
    }
  }

  return currentConfig;
};
