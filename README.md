# Transportes El Gena

Landing page premium para una empresa ficticia de logistica y carga pesada en Mexico. Hecha con **React + TypeScript + Vite + TailwindCSS**, lista para correr sin backend.

> Carga pesada, rutas inteligentes y costos claros.

## Caracteristicas

- Dark mode por defecto + toggle claro/oscuro persistente.
- Glassmorphism, gradientes, sombras suaves y microinteracciones.
- Hero animado con dashboard simulado.
- Seccion de servicios con tarjetas premium.
- **Cotizador automatico** (centro de la pagina) con todas las variables:
  - Origen / destino
  - Distancia (km o millas) editable manualmente
  - Peso de carga y camion vacio
  - Rendimiento (km/l o mpg)
  - Precio de combustible, salario chofer, dias, llantas, casetas, viaticos, mantenimiento
  - Margen de ganancia (slider)
- Calculo en tiempo real con desglose, costo por km y precio sugerido por tonelada.
- Validaciones (no negativos, campos requeridos) y formato MXN.
- Seccion de mapa con Google Maps embebido + integracion preparada para Directions API.
- Estadisticas animadas, testimonios, CTA y footer con contacto/redes.
- Responsive desktop / tablet / movil.

## Stack

- React 19 + TypeScript
- Vite 8
- TailwindCSS 3
- Lucide React (iconos)

## Empezar

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

## Build / Preview

```bash
npm run build      # genera /dist
npm run preview    # sirve /dist localmente
```

## Activar Google Maps real

La seccion de cobertura (`src/sections/MapSection.tsx`) ya muestra un iframe de Google Maps. Para activar la **Directions API** con tu propia API key:

1. Crea `.env.local` en la raiz del proyecto:

   ```env
   VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   ```

2. En Google Cloud Console habilita:
   - Maps JavaScript API
   - Maps Embed API (para el iframe con directions)
   - Directions API (para el endpoint REST)
   - Places API (opcional, para autocompletado de origen/destino)

3. Dentro de `MapSection.tsx` ya esta listo el helper `fetchDirectionsFromGoogle`
   (comentado) para conectarlo cuando lo necesites. El iframe automaticamente
   cambia al modo `embed/v1/directions` cuando detecta la API key.

## Estructura

```
src/
├── App.tsx
├── main.tsx
├── index.css            # Tailwind + estilos globales + utilidades
├── components/
│   ├── Field.tsx        # Inputs reutilizables (texto y numero)
│   ├── Logo.tsx
│   ├── Navbar.tsx
│   └── ThemeToggle.tsx
├── hooks/
│   └── useTheme.ts      # Hook con persistencia en localStorage
├── lib/
│   ├── format.ts        # Formateo MXN y helper cn()
│   └── quote.ts         # Calculo y validacion de cotizacion
├── sections/
│   ├── Hero.tsx
│   ├── Services.tsx
│   ├── Quoter.tsx       # Cotizador (corazon del producto)
│   ├── MapSection.tsx   # Mapa + integracion Google Maps
│   ├── WhyUs.tsx        # Stats animadas + chart
│   ├── Testimonials.tsx
│   ├── CtaBanner.tsx
│   └── Footer.tsx
└── types/
    └── quote.ts
```

## Formulas del cotizador

```ts
combustible   = distanciaKm / rendimientoKmL * precioCombustible
llantas       = distanciaKm * costoDesgasteLlantaKm * numeroLlantas
mantenimiento = distanciaKm * costoMantenimientoKm
chofer        = salarioChoferDia * diasViaje
subtotal      = combustible + llantas + mantenimiento + chofer + casetas + viaticos
ganancia      = subtotal * (margen / 100)
total         = subtotal + ganancia
```

Conversiones automaticas:
- Si la distancia esta en millas, se convierte a km (1 mi = 1.60934 km).
- Si el rendimiento esta en mpg, se convierte a km/l (1 mpg ≈ 0.425144 km/l).

## Licencia

Proyecto demo de portafolio. Todos los datos, logos y testimonios son ficticios.
