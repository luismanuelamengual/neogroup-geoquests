# NeoGroup GeoQuests

Versión gratuita de un juego tipo *GeoGuessr*: aparecés en una calle de algún lugar del mundo y tenés que adivinar dónde estás marcando un punto en el mapa. Cuanto más cerca, más puntos.

Por ahora hay un solo modo de juego, **Ciudades del mundo**: 5 rondas en 20 grandes ciudades (hasta 5.000 puntos por ronda, 25.000 por partida).

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **MUI** con un tema propio "arcade" + **SASS** (un `index.scss` por componente, mobile-first)
- **Auth.js v5** (Google + email/contraseña con verificación por email y recupero de contraseña vía Resend)
- **@neogroup/neorm** para el acceso a datos (PostgreSQL; SQLite en memoria en los tests)
- **zustand** para los stores del cliente
- **Serwist** para PWA / offline
- **Mapillary** (imágenes a nivel de calle, gratis) + **MapLibre GL** con tiles de **OpenFreeMap** (mapa, gratis y sin API key)
- Tipografías self-hosted (`@fontsource`) para que funcionen también offline dentro de la PWA
- UI sólo en español

### Costos (APIs gratuitas)

| Necesidad | Servicio | Costo |
| --- | --- | --- |
| Imágenes a nivel de calle | Mapillary Graph API v4 + MapillaryJS | Gratis (token de cliente; licencia CC BY-SA, la atribución la muestra el visor) |
| Mapa para adivinar / resultados | OpenFreeMap + MapLibre GL | Gratis, sin API key ni límites |
| Emails | Resend | Plan gratuito (~3.000 mails/mes) |
| Hosting + DB | Vercel Hobby + Neon/Supabase free | Gratis para arrancar |

El proveedor de imágenes está detrás de la interfaz `StreetImageryProvider`, así que migrar a Google Street View (de pago) es agregar una implementación nueva.

## Getting started

1. Instalar dependencias:

   ```bash
   yarn install
   ```

2. Crear el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

   Completar `AUTH_SECRET` (`openssl rand -base64 32`), las credenciales OAuth de Google, `RESEND_API_KEY`, los `DB_*` y el token de Mapillary:

   - **Mapillary**: entrar a <https://www.mapillary.com/dashboard/developers>, crear una aplicación y copiar su **Client Token** (`MLY|...`) en `MAPILLARY_ACCESS_TOKEN` y `NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN`.
   - **Google OAuth**: en Google Cloud Console crear un OAuth Client (Web) con redirect URI `http://localhost:3000/api/auth/callback/google` (y la del dominio productivo).
   - Sin `RESEND_API_KEY` los mails no se envían: el link de verificación / reseteo se imprime en la consola del servidor.

3. Levantar PostgreSQL local, correr migraciones (crean las tablas y cargan las 20 ciudades) y el seed (usuario demo `demo@geoquests.app` / `demo1234`):

   ```bash
   yarn db:local:up
   yarn db:migrate
   yarn db:seed
   ```

4. Levantar el servidor de desarrollo:

   ```bash
   yarn dev
   ```

## Project structure

Igual que en TeamUp, el código está organizado en **módulos** dentro de `app/` (no hay carpeta `src/`). Cada módulo es un *route group* de Next.js que encapsula todo lo relacionado con esa funcionalidad: páginas, endpoints, componentes, modelos, servicios, stores, hooks y utils.

```
app/
  layout.tsx              Root layout (tema, fuentes, service worker, toasts)
  page.tsx                Entry point: landing pública o redirección al menú principal
  globals.scss            Tokens de diseño (colores, safe areas, breakpoints) y estilos globales
  components/             Componentes compartidos (ThemeRegistry, GameButton, GamePanel, Logo, Loading, PlayerAvatar)
  models/                 Modelos compartidos (User, UserDto, ApiResponse, ApiException)
  hooks/                  Hooks compartidos (useRequests, useNotifications, useLoadingData, useInstallPrompt...)
  utils/                  Utilidades compartidas (api-server, email, urls, users, environment)
  (auth)/                 Módulo de autenticación (login, registro, verificación de email, recupero de contraseña)
  (public)/               Landing pública
  (pwa)/                  Manifest, service worker (Serwist), página offline, banner de instalación
  (protected)/            Módulos que requieren sesión (ver abajo)
proxy.ts                  Protección de rutas (middleware de Next.js — tiene que estar en la raíz)
database/migrations/      Migraciones (yarn db:migrate)
scripts/                  migrate / reset / seed de la base
tests/                    Tests (Vitest)
```

```
app/(protected)/
  components/AppShell/    Barra superior (y tab bar en celulares) de las páginas autenticadas
  stores/users.ts         Store con el usuario logueado
  (home)/                 Menú principal: modos de juego y últimas partidas
  (game)/                 ⭐ Módulo core del juego (ver abajo)
  (account)/              Perfil del jugador (nombre, estadísticas)
```

### Anatomía de un módulo

```
app/(module)/
  components/      Componentes del módulo — cada uno en su carpeta: index.tsx + index.scss
  models/          Entidades neorm (una por tabla) y tipos/DTOs del FE
  stores/          Stores zustand del módulo
  hooks/           Hooks del módulo — acá viven también las llamadas a la API (useRequests)
  utils/           Utilidades puras del módulo
  services/        Servicios del BE (lógica de negocio, queries)
  (pages)/         Páginas del módulo (route group: no afecta la URL)
  (api)/           Endpoints del módulo, en (api)/api/<verboSustantivo>/route.ts
```

Los imports siempre son absolutos con el alias `@/` (lo exige ESLint).

### API endpoints

Mismo contrato que TeamUp: siempre `POST` con body JSON, nombre `verbNoun` (`/api/startGame`, `/api/submitGuess`...), respuesta `{ success, data }` / `{ success: false, error: { name, message } }`. Los handlers se envuelven con `withApi` (público) o `withAuth` (requiere sesión, inyecta el `userId`) de `app/utils/api-server.ts`, y los errores se señalizan tirando `ApiException(message, status)`. En el FE, `useRequests()` devuelve `executeRequest<T>(url, payload)`.

## El módulo de juego — `app/(protected)/(game)`

Toda la lógica principal del juego vive en este módulo:

```
models/     Place, PlaceLocation, Game, GameRound (entidades) · GameMode (catálogo de modos + puntaje)
            GameView / RoundView (lo que ve el cliente) · PlaceArea, LatLng, GuessInput...
services/   places.ts     lugares habilitados de un modo
            locations.ts  rutina que obtiene una imagen aleatoria dentro de un lugar
            games.ts      crear partida, registrar respuestas, puntaje, historial, estadísticas
            imagery/      StreetImageryProvider (interfaz) + MapillaryProvider
utils/      geo.ts        haversine, puntos aleatorios en círculo/polígono, bounding boxes
            score.ts      fórmula de puntaje y formateos
components/ StreetView (MapillaryJS), GuessMap / ResultMap (MapLibre), GuessPanel, RoundHud,
            RoundResult, GameSummary, GameModeCard, RecentGames
(api)/api/  startGame, getGame, submitGuess, getRecentGames
(pages)/    /game/[id] (jugar) · /game/[id]/summary (resumen)
```

### Lugares (`places`)

Cada lugar pertenece a un modo de juego y define un área: un **círculo** (`latitude`, `longitude`, `radiusMeters`) o un **polígono** GeoJSON (`polygon`, columna `jsonb`). Las 20 ciudades de "Ciudades del mundo" se cargan en la migración `002-seed-world-cities` (17 círculos y 3 polígonos: Buenos Aires, Manhattan y París). No se usa PostGIS: la geometría está en `utils/geo.ts`, así el esquema es portable (y testeable con SQLite).

### Cómo se obtiene una ubicación aleatoria (`services/locations.ts`)

1. Se sortea un punto uniforme dentro del área (círculo: `R·√u`; polígono: muestreo por rechazo sobre su bounding box).
2. Se le piden a Mapillary las imágenes en un cuadrado de ~500 m alrededor del punto; se prefieren las panorámicas 360° y, entre ellas, la más cercana al punto (descartando las que caen fuera del área).
3. Si no hay imágenes se reintenta con otro punto (hasta 6 veces).
4. Cada imagen encontrada se guarda en `place_locations` (caché). Si Mapillary falla o no hay cobertura, se usa una ubicación de la caché.

`startGame` baraja los lugares y busca las 5 ubicaciones en paralelo (una por ronda, cada una en un lugar distinto). Las coordenadas reales **nunca se envían al cliente** antes de responder cada ronda: `RoundView` sólo trae el `imageId` hasta que la ronda se juega. (Un usuario técnico podría consultar la posición del `imageId` directamente en Mapillary; es un límite aceptado de la versión gratuita).

### Puntaje (`utils/score.ts`)

```
puntos = 5000 · e^(−distancia / 15 km)      (5000 si la distancia es ≤ 25 m)
```

La ciudad no se revela hasta responder: acertar la ciudad ya da muchos puntos (a 3 km ≈ 4.100) y la precisión dentro de ella completa los 5.000; una ciudad equivocada da prácticamente 0. Los parámetros están por modo en `GAME_MODES` (`models/GameMode.ts`).

### Agregar un modo de juego

1. Agregar el valor a `GameMode` y su configuración a `GAME_MODES` (nombre, descripción, rondas, curva de puntaje).
2. Cargar sus lugares con una migración (`places.mode = <nuevo modo>`).

El menú principal muestra automáticamente una tarjeta por modo.

## Diseño (look & feel de videojuego)

- Tema MUI oscuro con acentos saturados (`app/components/ThemeRegistry/theme.ts`) y los mismos colores como CSS custom properties en `app/globals.scss`.
- `GameButton` (botón "arcade" con borde 3D y animación al presionar) y `GamePanel` (panel con borde grueso y cinta de título) son los bloques base de todas las pantallas.
- Breakpoints usados en todos los `.scss`: **celular** ≤ 600 px, **tablet** 601–900 px, **desktop** ≥ 901 px. Se respetan las safe areas (`env(safe-area-inset-*)`) y se usa `100dvh`.
- Pantalla de juego inmersiva: en desktop el mapa está en la esquina y se agranda al pasar el mouse (o fijándolo con el pin); en celular/tablet se abre como *bottom sheet* desde el botón "Mapa".

## PWA

Manifest en `/manifest.webmanifest`, service worker de Serwist en `/serwist/sw.js`, página offline `/~offline` e íconos en `public/`. El juego necesita conexión (imágenes y mapas), por eso offline sólo se muestra la página de "sin señal".

## Testing

```bash
yarn test
```

- `tests/unit` — geometría, puntaje, elección de imágenes y el cliente de Mapillary (con `fetch` falso).
- `tests/flows` — el flujo completo del juego (crear partida, 5 respuestas, resumen, caché) contra SQLite en memoria con un proveedor de imágenes falso, usando las migraciones reales.
