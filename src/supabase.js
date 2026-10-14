import { createClient } from '@supabase/supabase-js';
import { PRECIO_HAMBURGUESA_GS } from './data/initialData';

const STORAGE_KEYS = {
  SUPABASE_URL: 'solidaria_supabase_url',
  SUPABASE_KEY: 'solidaria_supabase_anon_key',
  PEDIDOS_LOCAL: 'solidaria_pedidos_cache'
};

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

export const saveSupabaseCredentials = (url, key) => {
  if (url) localStorage.setItem(STORAGE_KEYS.SUPABASE_URL, url.trim());
  if (key) localStorage.setItem(STORAGE_KEYS.SUPABASE_KEY, key.trim());
  cachedClient = null;
  currentClientKey = '';
};

export const clearSupabaseCredentials = () => {
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_URL);
  localStorage.removeItem(STORAGE_KEYS.SUPABASE_KEY);
  cachedClient = null;
  currentClientKey = '';
};

export const testSupabaseConnection = async () => {
  const client = getSupabaseClient();
  if (!client) {
    return { ok: false, message: 'No hay credenciales de Supabase configuradas' };
  }

  try {
    const { error } = await client.from('pedidos').select('id').limit(1);
    if (error) {
      if (error.code === '42P01') {
        return {
          ok: false,
          needsSchema: true,
          message: 'Conectó a Supabase pero la tabla "pedidos" no existe aún. ¡Ejecutá el script SQL provisto!'
        };
      }
      return { ok: false, message: `Error de Supabase: ${error.message}` };
    }
    return { ok: true, message: '¡Conexión exitosa con la base de datos Supabase!' };
  } catch (err) {
    return { ok: false, message: `Fallo de conexión: ${err.message || 'Verifica la URL y la Anon Key'}` };
  }
};

// Guardar pedido
export const savePedido = async ({ cliente_nombre, cantidad, direccion = '', telefono = '', estado_pago = 'pendiente' }) => {
  const client = getSupabaseClient();
  const timestamp = new Date().toISOString();
  const cant = Math.max(1, parseInt(cantidad, 10) || 1);
  const total = cant * PRECIO_HAMBURGUESA_GS;

  const newPedido = {
    cliente_nombre: cliente_nombre.trim(),
    cantidad: cant,
    precio_unitario: PRECIO_HAMBURGUESA_GS,
    total: total,
    direccion: direccion ? direccion.trim() : '',
    telefono: telefono ? telefono.trim() : '',
    estado_pago: estado_pago,
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
      }
    } catch (err) {
      console.error('Error al guardar en Supabase:', err);
    }
  }

  if (!newPedido.id) {
    newPedido.id = 'loc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  }

  const localPedidos = getLocalPedidos();
  localPedidos.unshift(newPedido);
  saveLocalPedidos(localPedidos);

  return {
    success: true,
    pedido: newPedido,
    savedInSupabase
  };
};

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

    if (data) {
      saveLocalPedidos(data);
      return { pedidos: data, isSupabase: true };
    }
  } catch (err) {
    console.warn('Fallo de red Supabase:', err);
  }

  return { pedidos: localPedidos, isSupabase: false };
};

export const updatePedidoPago = async (id, nuevoEstadoPago) => {
  const client = getSupabaseClient();
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
