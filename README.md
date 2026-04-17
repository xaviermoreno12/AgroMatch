# AgroMatch — Industrial Machinery Exchange for Australia

**Stack:** HTML5 + CSS3 puro + JavaScript Vanilla · Supabase (CDN) · Stripe Payment Links · Hostinger FTP

---

## Estructura del Proyecto

```
agromatch/
├── index.html          → Landing page (Hero, Features, Pricing, CTA)
├── app.html            → Matchmaking con swipe cards
├── dashboard.html      → Dashboard del operador
├── css/
│   ├── variables.css   → CSS custom properties (colores, fuentes)
│   ├── base.css        → Reset + tipografía global
│   ├── components.css  → Botones, cards, badges, modal, chips
│   ├── layout.css      → Header, footer, nav, sidebar
│   └── pages/
│       ├── landing.css
│       ├── matchmaking.css
│       └── dashboard.css
├── js/
│   ├── config.js       → ← EDITAR ESTE ARCHIVO con tus credenciales
│   ├── supabase.js     → Client + queries
│   ├── auth.js         → Auth + retorno de pago Stripe
│   ├── stripe.js       → Redirect a Payment Links
│   ├── swipe.js        → Drag & drop / touch para las cards
│   ├── filter.js       → Chips de filtro por tipo de máquina
│   ├── dashboard.js    → Carga datos del dashboard
│   └── main.js         → Init + toast + helpers compartidos
└── README.md
```

---

## PASO 1 — Configurar Supabase

### 1.1 Crear el proyecto

1. Ir a [https://supabase.com](https://supabase.com) → **New Project**
2. Elegir nombre (ej: `agromatch`), password seguro, región `Sydney (ap-southeast-2)`
3. Esperar ~2 minutos a que el proyecto se inicialice

### 1.2 Crear las tablas

Ir a **SQL Editor** → **New Query** y ejecutar:

```sql
-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id uuid REFERENCES auth.users PRIMARY KEY,
  full_name text,
  is_contractor boolean DEFAULT false,
  subscription_active boolean DEFAULT false,
  work_zone text
);

-- Activar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Tabla de maquinaria
CREATE TABLE machinery (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES profiles(id),
  model text NOT NULL,
  type text NOT NULL,            -- Tractor | Harvester | Sprayer | Other
  location text,                 -- Queensland | Western Australia | NSW | Victoria
  status text DEFAULT 'Available',
  image_url text,
  daily_rate numeric,
  horsepower int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE machinery ENABLE ROW LEVEL SECURITY;

-- Todos pueden ver maquinaria disponible
CREATE POLICY "Anyone can view available machinery"
  ON machinery FOR SELECT USING (status = 'Available');

-- Dueños pueden gestionar su propia maquinaria
CREATE POLICY "Owners can manage own machinery"
  ON machinery FOR ALL USING (auth.uid() = owner_id);

-- Tabla de matches
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contractor_id uuid REFERENCES profiles(id),
  machine_id uuid REFERENCES machinery(id),
  status text DEFAULT 'pending',   -- pending | accepted | rejected
  created_at timestamptz DEFAULT now()
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contractors see own matches"
  ON matches FOR SELECT USING (auth.uid() = contractor_id);

CREATE POLICY "Contractors can create matches"
  ON matches FOR INSERT WITH CHECK (auth.uid() = contractor_id);
```

### 1.3 Obtener credenciales

1. Ir a **Project Settings** → **API**
2. Copiar **Project URL** y **anon public** key
3. Pegar en `js/config.js`:

```js
const SUPABASE_URL      = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### 1.4 Insertar datos de prueba (opcional)

```sql
INSERT INTO machinery (model, type, location, status, horsepower, daily_rate, image_url)
VALUES
  ('John Deere S780', 'Harvester', 'Queensland', 'Available', 540, 1200,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuBjncdgHh954n6Wn7IRfb0E8vYneiyFAKcabcw3OqmsHiU8wZCmjYPnEhJn2BTacKFFpF7wiivxMZsCb0kJqZSkNV7uTxDGNQfZ_il7XG1ptanoiftRNmDpye6Oa5u-_LylUR3RhQUtUM7y5trBq0pUnXH9CfISUOOk3EDg9NIwFFjBIo1vkn7Z4O_JG5RQCVokk8H5RoT0s0c7wW6PeAoR8-Woq037_ip_VfzBJBFqfrEHAGcNhw5Xl6JbmWtE6erTUSTa26y5nhw'),
  ('John Deere 8R 410', 'Tractor', 'Western Australia', 'Available', 450, 800,
   'https://lh3.googleusercontent.com/aida-public/AB6AXuDj93cdtag0rXA82fjL-Xdz2Ui7oSTSmCDrBnBSmIRk4YRtn9Eup_u3Sji10h9KgfRd4jO3tIcP8mxz4ve-XI_HYYaA50q-4-e1qtQuMUwsYFHArgqigcc_cAiXFmordRoFJc74gJ7f6UpGw8wdjVdadb8YLYkUYX2FmjAY6Q56FKxHUuE4-Dwii9CXy4WXpiqo4eJr0RzKpLFBv70GNfcjEj7_yvcbC-KaxAbvRwDYNEOJqL-uCFfDF8QA6HsqF0oRJyBqEeEjTnM');
```

---

## PASO 2 — Configurar Stripe

### 2.1 Crear cuenta

1. Ir a [https://stripe.com/au](https://stripe.com/au) → **Start now**
2. Completar datos de la cuenta (Australia, AUD)

### 2.2 Crear el Payment Link de suscripción ($10 AUD/mes)

1. En el Dashboard de Stripe ir a **Payment Links** → **New**
2. Agregar producto: "AgroMatch Premium" · Precio: $10.00 AUD · **Recurring monthly**
3. En **After payment** → Redirect to URL: `https://TU-DOMINIO.com/index.html?payment=success`
4. Copiar la URL del Payment Link (ej: `https://buy.stripe.com/xxxx`)
5. Pegar en `js/config.js`:

```js
const STRIPE_SUBSCRIPTION_LINK = 'https://buy.stripe.com/xxxxxxxxxxxx';
```

### 2.3 Crear el Payment Link Pay-per-Lead (precio único)

1. Repetir el proceso con precio fijo (ej: $3.00 AUD · **One time**)
2. Success URL: `https://TU-DOMINIO.com/app.html?payment=success`
3. Pegar en `js/config.js`:

```js
const STRIPE_PAY_PER_LEAD_LINK = 'https://buy.stripe.com/yyyyyyyyyyyy';
```

---

## PASO 3 — Deploy en Hostinger

1. Acceder al panel de Hostinger → **File Manager** o usar **FTP** (FileZilla)
2. Subir toda la carpeta `agromatch/` dentro de `public_html/`
3. La app queda disponible en `https://tudominio.com/agromatch/`
4. No requiere compilación — solo subir archivos estáticos

### Estructura final en Hostinger:
```
public_html/
└── agromatch/
    ├── index.html
    ├── app.html
    ├── dashboard.html
    ├── css/
    └── js/
```

---

## Modo Demo (sin Supabase)

Si `SUPABASE_URL` está como `'YOUR_SUPABASE_URL'`, la app usa datos mock automáticamente:
- Las tarjetas de swipe muestran maquinaria de ejemplo
- Los matches se simulan en consola
- El dashboard muestra datos estáticos

Perfecto para probar el diseño y la mecánica de swipe antes de configurar el backend.

---

## Checklist de verificación

- [ ] `js/config.js` tiene SUPABASE_URL y SUPABASE_ANON_KEY reales
- [ ] Las 3 tablas SQL existen en Supabase con RLS activado
- [ ] `js/config.js` tiene STRIPE_SUBSCRIPTION_LINK real
- [ ] La URL de éxito de Stripe apunta a `?payment=success`
- [ ] Archivos subidos a Hostinger via FTP
- [ ] Swipe funciona en mobile (touch) y desktop (mouse/drag)
