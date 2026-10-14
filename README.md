# 🍔 Gran Hamburgueseada & Rifa Solidaria

Web estática moderna (SPA) para la carga y gestión de pedidos de hamburguesas benéficas con **asignación automática de números de rifa** y base de datos en la nube con **Supabase**.

Desplegable de forma gratuita en **GitHub Pages**, **Cloudflare Pages**, **Vercel** o cualquier hosting estático sin necesidad de configurar ni mantener servidores backend.

---

## ✨ Características Principales

- **Menú y Combos Solidarios:** Cada combo u hamburguesa otorga números de rifa automáticamente (ej. `Combo Doble Smash` suma 2 números para el sorteo).
- **Carga de Pedidos Online:** Formulario para clientes con selección de entrega (Retiro en sede o Envío a domicilio), franja horaria preferida, observaciones y métodos de pago (Efectivo o Transferencia con Alias y CBU copiable con un clic).
- **Ticket Digital Perforado con Números de Rifa:** Tras confirmar el pedido, el cliente recibe un ticket con diseño oficial, código único de pedido (`HAMB-XXXX`) y sus números de sorteo asignados.
- **Integración con WhatsApp con 1 Clic:** Botón directo para enviar el comprobante y detalle del pedido formateado al WhatsApp del organizador.
- **Panel de Control para Organizadores (Admin):**
  - Métricas en tiempo real: Total recaudado ($), Hamburguesas vendidas, Números de rifa activos y Pedidos totales.
  - Tabla interactiva para cambiar el estado de cocina (`Recibido`, `En Cocina`, `Listo`, `Entregado`, `Cancelado`) y estado de cobro.
  - Botón de WhatsApp para avisarle al cliente con 1 clic cuando su hamburguesa esté lista para retirar.
  - **Sorteador Oficial en Vivo:** Bolillero/Ruleta interactiva animada con confetti que selecciona un número ganador al azar entre todos los números vendidos.
  - **Exportar a Excel / CSV:** Descarga la planilla de pedidos completa con un clic.
  - **Carga Rápida de Mostrador:** Modal rápido para voluntarios que toman pedidos en la puerta o por llamada telefónica en 10 segundos.
- **Conexión Directa a Supabase:**
  - Sin servidores intermedios: Utiliza el SDK oficial `@supabase/supabase-js`.
  - **Modo Offline / Local:** Si todavía no configuraste Supabase, la web funciona igual usando almacenamiento local (`localStorage`) para que nunca pierdas datos.
  - Panel visual en la web para ingresar la URL y Clave Anónima y probar la conexión con 1 clic.

---

## 🚀 Puesta en Marcha Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Abrir en el navegador: `http://localhost:5173`

---

## 🗄️ Configuración de la Base de Datos (Supabase)

1. Creá una cuenta gratuita en [supabase.com](https://supabase.com) y creá un nuevo proyecto.
2. En el panel lateral izquierdo, abrí el **SQL Editor**.
3. Copiá y pegá el contenido del archivo [`supabase_schema.sql`](./supabase_schema.sql) y hacé clic en **Run**.
4. Andá a **Project Settings** > **API**:
   - Copiá la **Project URL**.
   - Copiá la **Project API key** anónima (`anon` / `public`).
5. En la aplicación web:
   - Hacé clic en el botón superior **Supabase** / **BD Offline**.
   - Pegá tu URL y Clave Anónima y presioná **Probar Conexión** y luego **Guardar**.
   *(Opcionalmente, podés crear un archivo `.env` en la raíz copiando de `.env.example`)*.

---

## 🌐 Despliegue en GitHub Pages (100% Automático)

El repositorio ya incluye el workflow de GitHub Actions en [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml).

1. Subí este proyecto a un repositorio en GitHub:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/pedidosHambur.git
   git branch -M main
   git push -u origin main
   ```
2. En tu repositorio en GitHub, andá a **Settings** > **Pages**.
3. En **Build and deployment** > **Source**, seleccioná **GitHub Actions**.
4. ¡Listo! Cada vez que hagas `git push`, tu web se construirá y publicará automáticamente en:
   `https://TU-USUARIO.github.io/pedidosHambur/`

---

## 🛠️ Tecnologías

- **React 19 + Vite 8**
- **Vanilla CSS3** (Tokens CSS `:root`, paleta cálida artesanal con glassmorphism, 100% responsive)
- **@supabase/supabase-js** (Persistencia en la nube y tiempo real)
- **Lucide Icons**
- **Canvas Confetti** (Animación festiva para tickets y sorteos)
