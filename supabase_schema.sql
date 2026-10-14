-- ========================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE - RIFA SOLIDARIA HAMBURGUESAS
-- ========================================================
-- Instrucciones:
-- 1. Creá un proyecto gratis en https://supabase.com
-- 2. Andá a la sección "SQL Editor" en el menú lateral izquierdo
-- 3. Pegá todo el contenido de este archivo y hacé clic en "RUN"
-- 4. Copiá tu Project URL y Anon Key (desde Settings -> API) en la web
-- ========================================================

-- 1. Tabla de Configuración del Evento Solidario
CREATE TABLE IF NOT EXISTS public.evento_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_evento TEXT NOT NULL DEFAULT 'Gran Hamburgueseada & Rifa Solidaria',
  causa TEXT DEFAULT 'Todo lo recaudado es a beneficio de la causa comunitaria.',
  meta_hamburguesas INT DEFAULT 500,
  fecha_evento TEXT DEFAULT 'Sábado 24 de Octubre - 20:00 hs',
  lugar TEXT DEFAULT 'Club Social y Deportivo',
  alias_pago TEXT DEFAULT 'hambur.solidaria.mp',
  cbu_pago TEXT DEFAULT '0000003100012345678901',
  titular_pago TEXT DEFAULT 'Comisión Solidaria',
  telefono_whatsapp TEXT DEFAULT '5491123456789',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Pedidos de Hamburguesas
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_pedido TEXT NOT NULL UNIQUE,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  modalidad TEXT NOT NULL, -- 'retiro' o 'envio'
  direccion TEXT,
  horario_preferido TEXT,
  metodo_pago TEXT NOT NULL, -- 'transferencia' o 'efectivo'
  comprobante_pago TEXT,
  observaciones TEXT,
  total NUMERIC NOT NULL,
  cantidad_hamburguesas INT DEFAULT 1,
  numeros_rifa INT[] DEFAULT '{}',
  estado_pago TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'pagado'
  estado_pedido TEXT NOT NULL DEFAULT 'recibido', -- 'recibido', 'cocina', 'listo', 'entregado', 'cancelado'
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  origen TEXT DEFAULT 'web', -- 'web' o 'mostrador'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Números de Rifa Asignados (para auditoría y sorteos rápidos)
CREATE TABLE IF NOT EXISTS public.rifa_numeros (
  numero INT PRIMARY KEY,
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  codigo_pedido TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  cliente_telefono TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Habilitar Seguridad por Fila (Row Level Security - RLS)
ALTER TABLE public.evento_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rifa_numeros ENABLE ROW LEVEL SECURITY;

-- 5. Políticas públicas permisivas para SPA estática (usando anon key)
DROP POLICY IF EXISTS "Lectura publica config" ON public.evento_config;
CREATE POLICY "Lectura publica config" ON public.evento_config FOR SELECT USING (true);

DROP POLICY IF EXISTS "Insercion publica pedidos" ON public.pedidos;
CREATE POLICY "Insercion publica pedidos" ON public.pedidos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Lectura publica pedidos" ON public.pedidos;
CREATE POLICY "Lectura publica pedidos" ON public.pedidos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Actualizacion publica pedidos" ON public.pedidos;
CREATE POLICY "Actualizacion publica pedidos" ON public.pedidos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Eliminacion pedidos" ON public.pedidos;
CREATE POLICY "Eliminacion pedidos" ON public.pedidos FOR DELETE USING (true);

DROP POLICY IF EXISTS "Gestion rifa numeros" ON public.rifa_numeros;
CREATE POLICY "Gestion rifa numeros" ON public.rifa_numeros FOR ALL USING (true);

-- 6. Insertar registro inicial si no existe
INSERT INTO public.evento_config (nombre_evento, causa, meta_hamburguesas, fecha_evento, lugar, alias_pago, cbu_pago, titular_pago, telefono_whatsapp)
SELECT 'Gran Hamburgueseada & Rifa Solidaria', 'Todo lo recaudado es a beneficio de la causa comunitaria.', 500, 'Sábado 24 de Octubre - 20:00 hs', 'Club Social y Deportivo', 'hambur.solidaria.mp', '0000003100012345678901', 'Comisión Solidaria', '5491123456789'
WHERE NOT EXISTS (SELECT 1 FROM public.evento_config LIMIT 1);
