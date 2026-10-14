// Datos iniciales de productos y configuración del evento solidario

export const EVENTO_DEFAULT = {
  nombre: "Gran Hamburgueseada & Rifa Solidaria",
  subtitulo: "Comé rico, colaborá con la causa y ganá increíbles premios en nuestro sorteo.",
  causa: "Todo lo recaudado será destinado íntegramente a mejoras comunitarias y equipamiento solidario.",
  fecha: "Sábado 24 de Octubre",
  horario: "Desde las 20:00 hs",
  lugar: "Club Social & Comunitario (Av. Principal 1420)",
  metaHamburguesas: 500,
  hamburguesasVendidasIniciales: 184, // contador base para motivar
  aliasPago: "hambur.solidaria.mp",
  cbuPago: "0000003100012345678901",
  titularPago: "Asociación Civil Pro-Comunidad",
  telefonoWhatsApp: "5491123456789", // Cambiar por el teléfono del organizador
  sorteoPremios: [
    { puesto: "1° Premio", premio: "Smart TV 43' Full HD + Set Asador", icono: "🏆" },
    { puesto: "2° Premio", premio: "Costillar Completo + Canasta Familiar Premium", icono: "🥩" },
    { puesto: "3° Premio", premio: "Pava Eléctrica + Set de Mate Térmico y Bombilla", icono: "🎁" }
  ]
};

export const PRODUCTOS_DEFAULT = [
  {
    id: "combo-solidario-doble",
    nombre: "Combo Solidario Doble Smash",
    descripcion: "Doble carne vacuna 120g, cuádruple cheddar fundido, panceta crocante y salsa especial en pan brioche. Incluye papas y gaseosa.",
    categoria: "combos",
    precio: 7500,
    numerosRifa: 2,
    popular: true,
    badge: "🔥 Más Pedido (+2 Números)",
    emoji: "🍔🍟"
  },
  {
    id: "combo-clasico-completo",
    nombre: "Combo Hamburguesa Completa",
    descripcion: "Medallón casero 150g, jamón, queso, huevo frito, lechuga fresca y tomate maduro. Acompañado de papas rústicas.",
    categoria: "combos",
    precio: 6500,
    numerosRifa: 1,
    popular: false,
    badge: "Incluye 1 Número",
    emoji: "🍔"
  },
  {
    id: "hamburguesa-crispy-bbq",
    nombre: "Hamburguesa Crispy Onion BBQ",
    descripcion: "Carne vacuna seleccionada, cebolla crispy caramelizada, queso provolone y barbacoa ahumada artesanal.",
    categoria: "hamburguesas",
    precio: 5500,
    numerosRifa: 1,
    popular: false,
    badge: "Incluye 1 Número",
    emoji: "🧅"
  },
  {
    id: "hamburguesa-veggie-special",
    nombre: "Hamburguesa Veggie Del Sol",
    descripcion: "Medallón artesanal de lentejas y champignones, queso gouda fundido, rúcula fresca y emulsión de palta.",
    categoria: "hamburguesas",
    precio: 5500,
    numerosRifa: 1,
    popular: false,
    badge: "Opción Vegetariana",
    emoji: "🥑"
  },
  {
    id: "papas-bacon-cheddar",
    nombre: "Porción Papas Rústicas con Cheddar y Bacon",
    descripcion: "Papas rústicas doradas bañadas en salsa cheddar caliente y lluvia de panceta crocante.",
    categoria: "extras",
    precio: 3000,
    numerosRifa: 0,
    popular: false,
    badge: "Acompañamiento",
    emoji: "🍟"
  },
  {
    id: "gaseosa-linea-500",
    nombre: "Bebida Línea Coca / Sprite / Agua 500ml",
    descripcion: "A elección al momento de retirar o recibir (fría).",
    categoria: "extras",
    precio: 1500,
    numerosRifa: 0,
    popular: false,
    badge: "Bebida",
    emoji: "🥤"
  },
  {
    id: "rifa-solidaria-extra",
    nombre: "Bono Rifa Solidaria Adicional",
    descripcion: "¡Multiplicá tus chances de ganar los 3 premios del sorteo! Número oficial asignado al instante.",
    categoria: "rifas",
    precio: 1000,
    numerosRifa: 1,
    popular: true,
    badge: "🎟️ Solo Rifa (Sorteo)",
    emoji: "🎟️"
  }
];

export const SQL_SCHEMA_SCRIPT = `-- ========================================================
-- ESQUEMA DE BASE DE DATOS SUPABASE - RIFA SOLIDARIA HAMBURGUESAS
-- Pegar este script completo en el SQL Editor de tu proyecto Supabase
-- ========================================================

-- 1. Tabla de Configuración del Evento
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

-- 2. Tabla de Pedidos
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

-- 3. Tabla de Números de Rifa Asignados
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

-- 6. Insertar registro inicial de configuración si no existe
INSERT INTO public.evento_config (nombre_evento, causa, meta_hamburguesas, fecha_evento, lugar, alias_pago, cbu_pago, titular_pago, telefono_whatsapp)
SELECT 'Gran Hamburgueseada & Rifa Solidaria', 'Todo lo recaudado es a beneficio de la causa comunitaria.', 500, 'Sábado 24 de Octubre - 20:00 hs', 'Club Social y Deportivo', 'hambur.solidaria.mp', '0000003100012345678901', 'Comisión Solidaria', '5491123456789'
WHERE NOT EXISTS (SELECT 1 FROM public.evento_config LIMIT 1);
`;
