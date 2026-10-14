// Configuración de la Rifa Solidaria de Hamburguesas

export const PRECIO_HAMBURGUESA_GS = 14000;

export const EVENTO_DEFAULT = {
  nombre: "Rifa Solidaria - Hamburguesas",
  subtitulo: "Registro y control de pedidos de hamburguesas para la rifa solidaria.",
  precioHamburguesa: PRECIO_HAMBURGUESA_GS,
  moneda: "Gs."
};

export const SQL_SCHEMA_SCRIPT = `-- ========================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE - RIFA SOLIDARIA HAMBURGUESAS
-- ========================================================

-- 1. Tabla de Pedidos de Hamburguesas
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre TEXT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario NUMERIC NOT NULL DEFAULT 14000,
  total NUMERIC NOT NULL,
  direccion TEXT DEFAULT '',
  telefono TEXT DEFAULT '',
  numeros_rifa INT[] DEFAULT '{}',
  estado_pago TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente' o 'pagado'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Números de Rifa
CREATE TABLE IF NOT EXISTS public.rifa_numeros (
  numero INT PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  cliente_nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilitar Seguridad por Fila (Row Level Security - RLS)
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rifa_numeros ENABLE ROW LEVEL SECURITY;

-- 4. Políticas públicas para uso desde web estática (anon key)
DROP POLICY IF EXISTS "Lectura publica pedidos" ON public.pedidos;
CREATE POLICY "Lectura publica pedidos" ON public.pedidos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion publica pedidos" ON public.pedidos;
CREATE POLICY "Insercion publica pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Actualizacion publica pedidos" ON public.pedidos;
CREATE POLICY "Actualizacion publica pedidos" ON public.pedidos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Eliminacion publica pedidos" ON public.pedidos;
CREATE POLICY "Eliminacion publica pedidos" ON public.pedidos FOR DELETE USING (true);

DROP POLICY IF EXISTS "Gestion rifa numeros" ON public.rifa_numeros;
CREATE POLICY "Gestion rifa numeros" ON public.rifa_numeros FOR ALL USING (true);
`;
