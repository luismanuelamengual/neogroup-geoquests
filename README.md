# NeoGroup GeoQuests

Versión gratuita de un juego tipo *GeoGuessr*: aparecés en una calle de algún lugar del mundo y tenés que adivinar dónde estás marcando un punto en el mapa. Cuanto más cerca, más puntos.

Los modos de juego (*quests*) se cargan en la base de datos. Por ahora hay uno, **Ciudades del mundo**: 5 rondas de 2 minutos en 20 grandes ciudades (hasta 5.000 puntos por ronda, 25.000 por partida).

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
   yarn db:migrate      # crea la base si no existe
   yarn db:seed
   ```

   Para recrear la base local desde cero: `yarn db:reset` (borra todas las tablas y vuelve a correr las migraciones) y después `yarn db:seed`.

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
  (home)/                 Menú principal: los quests (modos de juego) y últimas partidas
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
models/     Quest, Place, PlaceLocation, Game (entidades) · QuestView (tarjeta del menú)
            GameState (estado completo, viaja cifrado) · GameView / RoundView (lo que ve el cliente)
services/   quests.ts     quests del menú y lugares de cada quest (quest_place)
            locations.ts  rutina que obtiene una imagen aleatoria dentro de un lugar
            games.ts      crear partida, registrar respuestas, puntaje, historial, estadísticas
            gameTokens.ts cifrado / descifrado del estado de la partida (AES-256-GCM)
            imagery/      StreetImageryProvider (interfaz) + MapillaryProvider
utils/      geo.ts        haversine, puntos aleatorios en círculo/polígono, bounding boxes
            score.ts      fórmula de puntaje y formateos
            gameStorage.ts partidas guardadas en el navegador (localStorage)
components/ StreetView (MapillaryJS), GuessMap / ResultMap (MapLibre), GuessPanel, RoundHud,
            RoundTimer, RoundResult, GameSummary, QuestCard, RecentGames, MyGames, GameListRow
(api)/api/  startGame, getGame, startRound, submitGuess, getGameResult, getGames
(pages)/    /game/[id] (jugar) · /game/[id]/summary (resumen) · /games (Mis partidas)
```

### Quests (modos de juego)

Cada modo de juego es una fila de `quests`:

| Columna | |
| --- | --- |
| `name`, `description` | Lo que muestra la tarjeta del menú principal |
| `rounds` | Cantidad de rondas de cada partida |
| `time` | Tiempo por ronda en **minutos**; `null` = sin límite |
| `image` | Imagen de la tarjeta: ruta bajo `/public` (p. ej. `/quests/ciudades-del-mundo.png`) o URL absoluta; sin imagen se dibuja una ilustración por defecto |
| `enabled` | Para ocultar un quest sin borrarlo |

Los lugares de cada quest se asocian en la tabla `quest_place` (`questId`, `placeId`): un mismo lugar puede estar en varios quests. El menú principal (`services/quests.ts` → `getQuests`) muestra todos los quests habilitados que tengan al menos un lugar habilitado.

**Agregar un quest:** una migración que inserte la fila en `quests`, sus lugares en `places` (si no existen) y las filas de `quest_place`. Ver `002-seed-world-cities`.

### Tiempo por ronda

Cuando el quest tiene `time`, el tiempo lo controla el **servidor**:

1. Al mostrar cada ronda el cliente llama a `/api/startRound`, que guarda la hora de inicio en `games.roundStartedAt`. Es idempotente: si se recarga la página, la ronda conserva su hora de inicio original (no se gana tiempo).
2. El cliente muestra la cuenta regresiva (`RoundTimer`, en rojo los últimos 10 s) a partir del tiempo restante que informa el servidor.
3. Al llegar a 0, el cliente envía automáticamente el pin marcado (o ninguno).
4. En `/api/submitGuess`, una respuesta que llega después del límite (más 5 s de tolerancia por la latencia) o sin pin vale **0 puntos** y la ronda queda como "¡Se acabó el tiempo!".

### Lugares (`places`)

Cada lugar define su área en una sola columna `geometry` (`jsonb`) con una **geometría GeoJSON** (RFC 7946, coordenadas `[longitud, latitud]`):

```jsonc
// Círculo: GeoJSON no tiene círculos, así que es un Point (centro) + `radius` en metros
{ "type": "Point", "coordinates": [-68.8458, -32.8895], "radius": 5000 }
// Polígono (el primer anillo es el borde; los siguientes, huecos)
{ "type": "Polygon", "coordinates": [[[-58.46, -34.535], [-58.413, -34.56], ..., [-58.46, -34.535]]] }
```

`radius` es un *foreign member* permitido por el RFC: cualquier herramienta GeoJSON lo sigue leyendo como un Point válido. Los tipos están en `models/PlaceGeometry.ts`; para soportar otra geometría (p. ej. `MultiPolygon`) se agrega al tipo `PlaceGeometry` y a `randomPointInGeometry` / `isPointInGeometry` en `utils/geo.ts`. Las 20 ciudades de "Ciudades del mundo" se cargan en la migración `002-seed-world-cities` (17 círculos y 3 polígonos: Buenos Aires, Manhattan y París). No se usa PostGIS: la geometría está en `utils/geo.ts`, así el esquema es portable (y testeable con SQLite).

### Cómo se obtiene una ubicación aleatoria (`services/locations.ts`)

1. Se sortea un punto uniforme dentro de la geometría (círculo: `R·√u`; polígono: muestreo por rechazo sobre su bounding box).
2. Se le piden a Mapillary las imágenes alrededor del punto; se prefieren las panorámicas 360° y, entre ellas, la más cercana al punto (descartando las que caen fuera de la geometría).
3. Si no hay imágenes se reintenta con otro punto y un radio cada vez mayor (250 m, 500 m, 1 km, 2 km, 3 km, 3 km — siempre dentro del límite de 0,01°² de Mapillary).

`startGame` (`planRounds` en `services/games.ts`) baraja los lugares del quest y busca las ubicaciones en paralelo, una por ronda y cada una en un lugar distinto. **Un lugar donde no aparece ninguna imagen en vivo se saltea y se prueba con otro.**

**Caché de respaldo (`place_locations`) — la excepción, no la regla.** Cada imagen encontrada en vivo se guarda ahí, pero sólo se *lee* si las búsquedas en vivo no alcanzaron para armar la partida (en la práctica: Mapillary falla o limita la búsqueda), y aun así se prefieren lugares todavía no usados en la partida. Guarda como máximo 100 ubicaciones por lugar y, llegado el límite, cada imagen nueva reemplaza a una vieja al azar: el respaldo va rotando y no se vuelve un conjunto fijo de lugares que los jugadores aprendan de memoria. (Si Mapillary está caído del todo la caché tampoco alcanza, porque el visor también descarga las imágenes de Mapillary.)

### Dónde viven las rondas: token cifrado + tabla `games` mínima

Para que la base (Supabase free) sea lo más chica posible, **las rondas no se guardan en la base**:

- El estado completo de la partida (imágenes, respuestas correctas, lo que marcó el jugador y los puntajes) se serializa, se comprime y se **cifra con AES-256-GCM** en el servidor (`services/gameTokens.ts`, clave derivada de `AUTH_SECRET`). Ese *token* es lo único que recibe el navegador, junto con una vista que sólo revela las rondas ya jugadas.
- El navegador guarda token + vista en **localStorage** (`utils/gameStorage.ts`, últimas 5 partidas) y manda el token en cada respuesta; el servidor lo descifra, calcula el puntaje y devuelve un token nuevo. GCM detecta cualquier modificación del token.
- La tabla `games` guarda sólo el progreso y el resultado (≈ 100 bytes por partida). `games.playedRounds` impide reutilizar un token viejo (p. ej. volver a responder una ronda después de ver la respuesta): un token cuyas rondas jugadas no coinciden con la base se rechaza, y la actualización es condicional para que cada ronda se puntúe una sola vez.
- Consecuencias: una partida sin terminar sólo se puede seguir en el dispositivo donde empezó; el detalle por ronda del resumen sólo está en ese dispositivo (en otro se ve el resultado final). Las partidas sin terminar de más de 24 h se borran solas.
- Cambiar `AUTH_SECRET` invalida las partidas en curso.

### Puntaje (`utils/score.ts`)

```
puntos = 5000 · e^(−distancia / 15 km)      (5000 si la distancia es ≤ 25 m)
```

La ciudad no se revela hasta responder: acertar la ciudad ya da muchos puntos (a 3 km ≈ 4.100) y la precisión dentro de ella completa los 5.000; una ciudad equivocada da prácticamente 0. Los parámetros están en `SCORE_SETTINGS` (`utils/score.ts`) y son los mismos para todos los quests.

### Mis partidas

La página `/games` (menú principal → "Mis partidas") lista todas las partidas del jugador, de la más nueva a la más vieja, de a 20 (`/api/getGames`): quest, fecha, puntaje, estrellas y estado. Las terminadas abren su resumen; las que están en curso se pueden seguir sólo desde el dispositivo donde empezaron. El perfil (nombre y estadísticas) sigue disponible desde el menú del usuario.

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
- `tests/flows` — el flujo completo del juego contra SQLite en memoria con un proveedor de imágenes falso y las migraciones reales: quests y sus lugares, partida completa, tiempo por ronda (inicio idempotente, tolerancia, respuestas fuera de tiempo, quests sin tiempo), tokens cifrados (reutilización, modificación, otro usuario), historial paginado, limpieza de partidas abandonadas y caché.
