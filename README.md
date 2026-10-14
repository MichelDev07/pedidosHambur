# 🍔 Hamburgueseada Solidaria

Sistema web estático (SPA) para la carga y control en tiempo real de pedidos para una **Hamburgueseada Solidaria** (precio: **14.000 Gs.** por hamburguesa), con base de datos en **Supabase** y almacenamiento offline de respaldo.

100% compatible con **GitHub Pages**, **Cloudflare Pages**, **Vercel** o cualquier hosting estático (sin servidor backend).

---

## ✨ Funcionalidades

- **Formulario de Carga Directo:**
  - **Nombre de la persona** que hizo el pedido.
  - **Cantidad de hamburguesas** (con selectores rápidos `+`, `-` y botones de 1, 2, 3, 5, 10).
  - Cálculo automático del total en Guaraníes (`14.000 Gs.` por unidad).
  - **Dirección donde vive** (dato opcional).
  - **Teléfono** (dato opcional para contacto / WhatsApp).
  - **Estado del pago** (Ya pagó / Pendiente de cobro).
- **Métricas en Vivo:**
  - Total de hamburguesas pedidas.
  - Total general recaudado en Gs.
  - Total cobrado en efectivo/transferencia.
  - Total pendiente de cobro.
- **Tabla y Control de Pedidos:**
  - Buscador en tiempo real por nombre o dirección.
  - Filtro por estado: Todos, Pagados, Pendientes.
  - Alternar estado de pago con 1 clic.
  - Botón para enviar comprobante de pedido por **WhatsApp** al cliente.
  - **Exportar a Excel / CSV** con un solo clic.
- **Conexión Directa con Supabase:**
  - Sin servidor intermedio (usa `@supabase/supabase-js` con anon key).
  - Panel visual en la web para ingresar URL y clave anónima con prueba de conexión.
  - Funciona también en **modo local** (localStorage) si aún no configuraste Supabase.

---

## 🚀 Puesta en Marcha Local

```powershell
npm install
npm run dev
```

Abrir en: `http://localhost:5173`

---

## 🗄️ Base de Datos Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor**, pegá el contenido de [`supabase_schema.sql`](./supabase_schema.sql) y hacé clic en **Run**.
3. En la web hacé clic en el botón superior **Supabase**, pegá tu **Project URL** y **Anon Key** y guardá.

---

## 🌐 Publicar en GitHub Pages

1. Subí este proyecto a GitHub:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/pedidosHambur.git
   git branch -M main
   git push -u origin main
   ```
2. En GitHub andá a **Settings** > **Pages** y en **Source** elegí **GitHub Actions**.
