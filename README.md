# NeoGroup GeoQuests

Versión gratuita de un juego tipo *GeoGuessr*: aparecés en una calle de algún lugar del mundo y tenés que adivinar dónde estás marcando un punto en el mapa. Cuanto más cerca, más puntos.

Primero se elige el *modo de juego* (con sus reglas fijas en el código) y después el *mapa* (dónde jugar: las regiones del mundo, que se cargan en la base de datos). Por ahora hay tres modos, **Clásico** (solo), **Con amigos** (multijugador en vivo, de 2 a 8) y **Battle Royale** (de 3 a 8: en cada ronda queda eliminado el que marcó más lejos), y cinco mapas: **Ciudades famosas** (las 20 ciudades más conocidas), **Ciudades del mundo** (150 ciudades de 36 países, también medianas y chicas) y tres de países, **Argentina**, **España** y **Estados Unidos** (un lugar al azar en cualquier parte del país). Las partidas son de 5 rondas de 2 minutos (hasta 5.000 puntos por ronda, 25.000 por partida).

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **MUI** con un tema propio "arcade" + **SASS** (un `index.scss` por componente, mobile-first)
- **Auth.js v5** (Google + email/contraseña con verificación por email y recupero de contraseña vía Resend)
- **@neogroup/neorm** para el acceso a datos (PostgreSQL; SQLite en memoria en los tests)
- **zustand** para los stores del cliente
- **Serwist** para PWA / offline
- **Google Street View** (imágenes de calles: Street View Image Metadata + Maps Embed API, ambos gratuitos) + **MapLibre GL** con tiles de **OpenFreeMap** (mapa, gratis y sin API key)
- Tipografías self-hosted (`@fontsource`) para que funcionen también offline dentro de la PWA
- UI sólo en español

### Imágenes de calles: Google Street View

Se usan dos servicios de Google que su documentación declara **sin costo**:

- *Street View Image Metadata* (servidor, `services/streetView.ts` → `GoogleStreetViewFinder`): busca la panorámica exterior más cercana a un punto. No consume cuota.
- *Maps Embed API* (navegador, componente `StreetView`): muestra la panorámica en un iframe, arrancando hacia una dirección al azar. Uso ilimitado.

Hay que habilitar "Street View Static API" y "Maps Embed API" en Google Cloud y crear dos keys (ver `.env.example`): una de servidor (`GOOGLE_MAPS_API_KEY`) y otra de navegador restringida al dominio (`NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`). Google puede pedir una cuenta de facturación aunque estos servicios no cobren.

El iframe de Google muestra arriba a la izquierda un cartel con la dirección (¡la respuesta!). No se puede ocultar desde afuera, así que se tapa con un panel propio (`.address-cover`, tamaño ajustable con las variables `--cover-width` / `--cover-height` en `components/StreetView/index.scss`). El logo y los términos de Google, abajo, quedan visibles.

### Costos (APIs gratuitas)

| Necesidad | Servicio | Costo |
| --- | --- | --- |
| Imágenes de calles | Google Street View Image Metadata + Maps Embed API | Gratis (API keys; sin cuota / ilimitado) |
| Mapa para adivinar / resultados | OpenFreeMap + MapLibre GL | Gratis, sin API key ni límites |
| Emails | Resend | Plan gratuito (~3.000 mails/mes) |
| Hosting + DB | Vercel Hobby + Neon/Supabase free | Gratis para arrancar |

## Getting started

1. Instalar dependencias:

   ```bash
   yarn install
   ```

2. Crear el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

   Completar `AUTH_SECRET` (`openssl rand -base64 32`), las credenciales OAuth de Google, `RESEND_API_KEY`, los `DB_*` y las keys de Google Street View:

   - **Google Street View**: en Google Cloud Console habilitar *Street View Static API* y *Maps Embed API* y crear dos API keys: `GOOGLE_MAPS_API_KEY` (servidor, restringida a Street View Static API) y `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY` (navegador, restringida a Maps Embed API y a los dominios del sitio, p. ej. `http://localhost:3000/*`).
   - **Google OAuth**: en Google Cloud Console crear un OAuth Client (Web) con redirect URI `http://localhost:3000/api/auth/callback/google` (y la del dominio productivo).
   - Sin `RESEND_API_KEY` los mails no se envían: el link de verificación / reseteo se imprime en la consola del servidor.

3. Levantar PostgreSQL local, correr migraciones (crean las tablas y cargan los mapas con sus ciudades) y el seed (usuario demo `demo@geoquests.app` / `demo1234`):

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
  (home)/                 Menú principal: la elección del modo de juego
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

Mismo contrato que TeamUp: siempre `POST` con body JSON (única excepción: `GET /api/cronCleanupGames`, que llama Vercel Cron), nombre `verbNoun` (`/api/createGame`, `/api/sendGameAction`...), respuesta `{ success, data }` / `{ success: false, error: { name, message } }`. Los handlers se envuelven con `withApi` (público) o `withAuth` (requiere sesión, inyecta el `userId`) de `app/utils/api-server.ts`, y los errores se señalizan tirando `ApiException(message, status)`. En el FE, `useRequests()` devuelve `executeRequest<T>(url, payload)`.

## El módulo de juego — `app/(protected)/(game)`

Toda la lógica principal del juego vive en este módulo:

```
models/     Entidades: Map, MapPlace, Place, PlaceLocation, Game, GamePlayer
            Enums: GameMode, GameStatus, GamePlayerStatus, GameOutcome
            Motor: GameModeEngine, GameModeDefinition, GameContext, GameAction (StartRoundAction, GuessAction...)
            Estado de cada modo (games.data): ClassicGameData, ClassicGameSettings, GameRound, GameGuess
            Lo que ve el cliente: GameView (+ ClassicGameView, RoundView), GameListItem, MapView...
services/   games.ts           servicio genérico: crear, consultar, acciones, historial, estadísticas
            gamePersistence.ts lectura / escritura de partidas con bloqueo optimista (games.version)
            gameModes.ts       registro de modos: GameMode → motor
            classicMode.ts     motor del modo Clásico
            classicMultiplayerMode.ts motor del modo Con amigos
            battleRoyaleMode.ts motor del modo Battle Royale
            roundBasedMode.ts  mecánica común de los modos multijugador por rondas (reloj compartido,
                               presencia, respuestas, cierre de ronda, vistas, ranking)
            gameCleanup.ts     limpieza de salas y partidas abandonadas
            rounds.ts          elección de las rondas de una partida
            maps.ts            mapas del menú y sus lugares (map_places)
            locations.ts       rutina que obtiene una imagen aleatoria dentro de un lugar
            streetView.ts      búsqueda de panorámicas en Google Street View (Image Metadata)
utils/      geo.ts        haversine, puntos aleatorios en círculo/polígono, bounding boxes
            guesses.ts    evaluación de una respuesta (distancia, puntaje, tiempo agotado)
            score.ts      fórmula de puntaje y formateos
            gameCodes.ts  códigos de invitación de las partidas multijugador
components/ GameScreen (elige la pantalla según el modo y estado) · Clásico: ClassicGamePlay, ClassicGameSummary
            Multijugador: MultiplayerLobby, InviteButton, MultiplayerGamePlay, RoundCountdown, PlayersStatus,
            BattleRoyaleGamePlay, BattleRoyaleRoundResult, BattleRoyaleGameSummary,
            MultiplayerRoundResult, Scoreboard, MultiplayerGameSummary · Menú: GameModeCard, GameModeIcon, MapPicker, MapCard, JoinGameDialog,
            ActiveGameBanner, MyGames, GameListRow · Comunes: StreetView (iframe de Google),
            GuessMap / ResultMap (MapLibre, con un pin por jugador), GuessPanel, RoundHud, RoundTimer, RoundResult
hooks/      useGames (llamadas a la API), useGameSync (polling de los modos en tiempo real), useNow, ...
(api)/api/  createGame, getGame, sendGameAction, getGames · joinGame, leaveGame, kickPlayer, startGame, getActiveGame
(pages)/    /play/[mode] (elegir dónde jugar un modo) · /game/[id] (sala de espera, jugar o ver el resumen) · /join/[code] (link de invitación) · /games (Mis partidas)
```

### Modos de juego y mapas

Un **modo de juego** define las reglas: cantidad de rondas, tiempo por ronda, jugadores, escala del puntaje... Están fijas en el código, en `definition.settings` del motor de cada modo (`services/<modo>Mode.ts`); no hay configuración en la base de datos. Para el Clásico:

```jsonc
{ "rounds": 5, "timeLimitSeconds": 120, "scoreMaxDistanceKm": 2000 }   // timeLimitSeconds: null = sin límite
```

Un **mapa** es dónde se juega: una fila de `maps` y los lugares asociados en `map_places` (una región del mundo o varias).

| Columna | |
| --- | --- |
| `name`, `description` | Lo que muestra la tarjeta del selector de mapa |
| `image` | Imagen de la tarjeta: ruta bajo `/public` (p. ej. `/maps/ciudades-del-mundo.png`) o URL absoluta; sin imagen se dibuja una ilustración por defecto |
| `settings` | JSON opcional (`null` = ninguno) que pisa reglas del modo. Hoy sólo `scoreMaxDistanceKm`, la escala del puntaje (un país entero necesita una escala mayor que una ciudad), p. ej. `{ "scoreMaxDistanceKm": 3500 }`; sin ella, la del modo |
| `enabled` | Para ocultar un mapa sin borrarlo |

Un mismo lugar puede estar en varios mapas. Al crear una partida, sus settings son los del modo, salvo `scoreMaxDistanceKm` si el mapa lo define en `maps.settings` (`getGameSettings`, en `services/gameModes.ts`).

**Menú principal: primero el modo, después el mapa.** El menú (`/play`) muestra los modos de juego (`getGameModes`: los modos con motor registrado) como tarjetas con imagen (`GameModeCard`; la imagen es `definition.image`, en `public/modes/`), con chips de sus reglas: jugadores, cantidad de rondas y tiempo por ronda. Arriba aparecen, sólo cuando corresponden, el banner para instalar la app y el acceso a la partida con amigos en curso. Las partidas anteriores están en "Mis partidas" (`/games`) y "Unirme con código" está en la página del modo multijugador. Cada tarjeta abre `/play/<slug>` (`/play/classic`, `/play/multiplayer`; como todas las rutas, en inglés) (`MapPicker`), con la grilla de mapas (`getMaps()`: habilitados y con al menos un lugar habilitado); cada tarjeta (`MapCard`) muestra un único chip con la cantidad de lugares y un botón para jugar o crear la sala.

**Agregar un mapa:** una migración que inserte la fila en `maps`, sus lugares en `places` (si no existen) y las filas de `map_places`. Ver `002-seed-maps`, que carga cada lugar una sola vez y lo asocia a los mapas que lo usan.

### Partidas: tabla `games` + motores de modos de juego

Todas las partidas, de cualquier modo, están en la tabla `games`:

- Las **columnas** son las comunes a todos los modos y las que se filtran o indexan: `mode`, `mapId`, `status` (sala de espera · en curso · terminada), `code` (invitación, multijugador), `hostUserId`, `version`, fechas.
- **`data`** (jsonb) tiene todo lo particular del modo: rondas, respuestas correctas, lo que marcó cada jugador, relojes... Sólo lo lee y escribe el **motor** del modo, y nunca llega así al navegador: cada motor arma la vista que puede ver cada jugador (`toView`), sin respuestas antes de tiempo.
- **`game_players`** tiene una fila por jugador (también en partidas individuales) con su resultado final (`score`, `position`, `outcome`): es lo que usan el historial y las estadísticas.

Cada modo es un `GameModeEngine` (`models/GameModeEngine.ts`) registrado en `services/gameModes.ts`: crea el estado inicial, aplica las acciones de los jugadores (`/api/sendGameAction`), los cambios por tiempo (`advance`, que se aplica al principio de cada pedido porque no hay procesos en segundo plano), dice cuándo terminó y calcula los resultados finales. El servicio genérico (`services/games.ts`) se encarga de la base, los jugadores y los permisos.

**Concurrencia:** `data` se lee, se modifica y se escribe entero, así que cada escritura es condicional a la `version` leída (`services/gamePersistence.ts`). Si otro pedido escribió antes, el cambio se vuelve a aplicar sobre el estado nuevo (hasta 4 veces). Eso también garantiza que cada ronda se puntúe una sola vez. `version` sirve además para el polling: `/api/getGame` con `sinceVersion` responde `{ unchanged: true }` si no cambió nada.

Como el estado vive en el servidor, **una partida se puede seguir desde cualquier dispositivo** y el resumen conserva el detalle de cada ronda.

**Agregar un modo:** un valor en `GameMode`, sus modelos (settings, data, view), un motor en `services/<modo>Mode.ts` registrado en `services/gameModes.ts`, su `slug`, `description` e `image` (menú), su ícono en `components/GameModeIcon`, sus pantallas registradas en `components/GameScreen` y sus `settings` fijos en la definición.

**Limpieza** (`services/gameCleanup.ts`, se ejecuta al crear una partida y una vez por día con Vercel Cron): las salas de espera de más de 30 min se borran, y las partidas en curso sin actividad por más tiempo del que define su modo (Clásico: 24 h) se borran o se dan por terminadas, según el modo.

### Modo Multijugador

De 2 a 8 jugadores (todos con cuenta) juegan las mismas rondas al mismo tiempo, con el mismo reloj:

1. **Sala de espera:** el anfitrión crea la partida (`createGame`, queda en estado `LOBBY` con un código de 6 caracteres) y los demás entran con el código (`joinGame`). El anfitrión puede sacar jugadores (`kickPlayer`) y la empieza (`startGame`) cuando hay al menos 2: recién ahí se eligen las rondas. Cada jugador puede estar en una sola partida multijugador activa (`getActiveGame`).
2. **Ronda:** empieza para todos después de una cuenta regresiva de 3 s. Se cierra cuando respondieron todos los jugadores conectados o se acaba el tiempo (con la misma tolerancia de 5 s); quien no respondió saca 0. Hasta que se cierra, nadie ve dónde marcaron los demás (sólo quién ya respondió).
3. **Resultado:** se muestran los pines de todos durante 15 s (el anfitrión puede pasar antes con la acción `next`) y arranca la siguiente ronda. Después de la última, la partida termina: gana el mayor puntaje total y, en caso de empate, la menor distancia total. El resultado de cada jugador queda en `game_players`.

En el navegador, `GameScreen` mantiene la partida al día con `useGameSync`, que la consulta cada ~1,5 s (se pausa con la pestaña oculta y espera más tras un error); los relojes se calculan a partir del momento en que llegó cada respuesta. Para invitar se comparte el link `/join/<código>` (o el código, que se ingresa con "Unirme con código" en el menú); abrir el link no une a nadie hasta confirmar. Los clientes consultan la partida cada ~1,5 s (`getGame` con `sinceVersion`); cada consulta registra la **presencia** del jugador (`game_players.lastSeenAt`, como mucho una escritura cada 10 s). Un jugador que no consultó en los últimos 20 s se considera desconectado y la ronda no lo espera. Quien abandona (`leaveGame`) antes de empezar sale de la partida; después, queda en los resultados con los puntos que hizo. Si se va el anfitrión, el rol pasa al jugador que entró primero. Una partida en curso sin actividad por 5 minutos se da por terminada con los puntajes que había.

Tiempos y límites son fijos por modo (`definition.settings`): `{ "rounds": 5, "timeLimitSeconds": 120, "maxPlayers": 8, "revealSeconds": 15, "countdownSeconds": 3, "scoreMaxDistanceKm": 2000 }`. `scoreMaxDistanceKm` es la distancia (km) a partir de la cual un intento da 0 puntos: cuanto más grande, más permisivo el puntaje.

### Tarea programada: limpieza diaria

`vercel.json` agenda con **Vercel Cron** una llamada diaria (06:00 UTC; en el plan Hobby alcanza con una por día) a `GET /api/cronCleanupGames`, la única ruta `GET` de la API. Vercel la llama con `Authorization: Bearer <CRON_SECRET>`: hay que definir `CRON_SECRET` en las variables de entorno del proyecto en Vercel (`openssl rand -base64 32`). Sin esa variable la ruta rechaza todos los pedidos. La limpieza también corre cada vez que se crea una partida, así que el cron es una red de seguridad para los días sin actividad. Para probarla localmente:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cronCleanupGames
```

### Modo Battle Royale

Usa la misma mecánica que "Con amigos" (sala de espera con código, mismas rondas y mismo reloj para todos, cuenta 3-2-1, resultado de cada ronda con los pines de todos, presencia y abandono; todo en `services/roundBasedMode.ts`), pero con otra regla: **en cada ronda queda eliminado un jugador** y gana el último en pie. De 3 a 8 jugadores, 60 s por ronda (`definition.settings`, sin `rounds`).

- **Quién cae** cuando se cierra la ronda: si nadie respondió, nadie (se juega otra ronda); si no, los que no respondieron a tiempo; si respondieron todos, el que marcó más lejos y, si hay empate, el que respondió último. Quien abandonó la partida también cae. Nunca se elimina a todos los que siguen jugando (p. ej. un empate exacto entre los dos últimos): en ese caso no cae nadie.
- **Rondas:** se eligen al empezar, una por eliminación (jugadores − 1) más 2 de repuesto (`SPARE_ROUNDS`) para las rondas sin eliminados. Si se terminan, gana el de más puntos entre los que siguen en pie.
- **Eliminados:** siguen mirando la partida (ven cada ronda y los pines de todos) pero ya no responden; la ronda sólo espera a los que siguen en pie.
- **Posiciones:** el ganador 1.º y después según la ronda en que cayó cada uno (los que cayeron en la misma ronda comparten el puesto). Los puntos se muestran pero no deciden la posición; en `game_players` quedan la posición, el resultado (`WON`/`LOST`/`DRAW`) y los puntos.

### Tiempo por ronda

Cuando el modo tiene `timeLimitSeconds`, el tiempo lo controla el **servidor**:

1. Al mostrar cada ronda el cliente manda la acción `startRound`, que guarda la hora de inicio en el estado de la partida. Es idempotente: si se recarga la página, la ronda conserva su hora de inicio original (no se gana tiempo).
2. El cliente muestra la cuenta regresiva (`RoundTimer`, en rojo los últimos 10 s) a partir del tiempo restante que informa el servidor.
3. Al llegar a 0, el cliente envía automáticamente el pin marcado (o ninguno).
4. En la acción `guess`, una respuesta que llega después del límite (más 5 s de tolerancia por la latencia) o sin pin vale **0 puntos** y la ronda queda como "¡Se acabó el tiempo!" (`utils/guesses.ts`).

### Lugares (`places`)

Cada lugar define su área en una sola columna `geometry` (`jsonb`) con una **geometría GeoJSON** (RFC 7946, coordenadas `[longitud, latitud]`):

```jsonc
// Círculo: GeoJSON no tiene círculos, así que es un Point (centro) + `radius` en metros
{ "type": "Point", "coordinates": [-68.8458, -32.8895], "radius": 5000 }
// Polígono (el primer anillo es el borde; los siguientes, huecos)
{ "type": "Polygon", "coordinates": [[[-58.46, -34.535], [-58.413, -34.56], ..., [-58.46, -34.535]]] }
```

`radius` es un *foreign member* permitido por el RFC: cualquier herramienta GeoJSON lo sigue leyendo como un Point válido. Los tipos están en `models/PlaceGeometry.ts`; para soportar otra geometría (p. ej. `MultiPolygon`) se agrega al tipo `PlaceGeometry` y a `randomPointInGeometry` / `isPointInGeometry` en `utils/geo.ts`. Las 150 ciudades se cargan en la migración `002-seed-maps` (círculos, salvo 3 polígonos: Buenos Aires, Manhattan y París); las 20 marcadas como famosas forman además "Ciudades famosas". Los mapas de países tienen un único lugar: el contorno aproximado del territorio continental como polígono (sin islas, p. ej. sin Tierra del Fuego, Baleares, Canarias, Alaska ni Hawái), dibujado un poco hacia adentro en las fronteras terrestres para que una panorámica encontrada cerca del límite nunca sea del país vecino. No se usa PostGIS: la geometría está en `utils/geo.ts`, así el esquema es portable (y testeable con SQLite).

### Cómo se obtiene una ubicación aleatoria (`services/locations.ts`)

1. Se sortea un punto uniforme dentro de la geometría (círculo: `R·√u`; polígono: muestreo por rechazo sobre su bounding box).
2. Se le pide a Street View (Image Metadata) la panorámica exterior más cercana al punto; se descarta si cae fuera de la geometría del lugar.
3. Si no hay panorámica se reintenta con otro punto y un radio cada vez mayor (250 m, 500 m, 1 km, 2 km, 3 km, 3 km). En lugares grandes (más de 100 km de punta a punta, como un país entero) un punto al azar suele quedar lejos de cualquier ruta, así que se busca mucho más lejos y más veces (2, 5, 10, 20, 30 y 3 × 50 km; `getSearchRadii`).

Al crear una partida, `planRounds` (`services/rounds.ts`) baraja los lugares del mapa y busca las ubicaciones en paralelo, una por ronda y cada una en un lugar distinto. **Un lugar donde no aparece ninguna imagen en vivo se saltea y se prueba con otro.**

**Caché de respaldo (`place_locations`) — la excepción, no la regla.** Cada panorámica encontrada en vivo se guarda ahí, pero sólo se *lee* si las búsquedas en vivo no alcanzaron para armar la partida (en la práctica: Street View falla o la key está mal configurada), y aun así se prefieren lugares todavía no usados en la partida. Guarda como máximo 100 ubicaciones por lugar y, llegado el límite, cada panorámica nueva reemplaza a una vieja al azar: el respaldo va rotando y no se vuelve un conjunto fijo de lugares que los jugadores aprendan de memoria.

### Puntaje (`utils/score.ts`)

```
puntos = 5000 · e^(−distancia / 15 km)      (5000 si la distancia es ≤ 25 m)
```

La ciudad no se revela hasta responder. El puntaje decae exponencialmente con la distancia: 5.000 dentro de los 25 m y 0 a partir de `scoreMaxDistanceKm` (por defecto 2.000 km; es la del modo; un mapa puede pisarla con `maps.settings.scoreMaxDistanceKm`). Con 2.000 km: a 3 km ≈ 4.930, a 50 km ≈ 3.970, a 300 km ≈ 1.260, a 1.000 km ≈ 50. Ningún mapa cargado la pisa; a un mapa de un país entero conviene darle una distancia mayor (p. ej. `{ "scoreMaxDistanceKm": 3500 }` en `maps.settings`). Constantes en `utils/score.ts`.

### Mis partidas

La página `/games` (menú principal → "Mis partidas") lista todas las partidas del jugador, de la más nueva a la más vieja, de a 20 (`/api/getGames`): mapa, fecha, puntaje, estrellas, posición (multijugador) y estado. Las terminadas abren su resumen y las que están en curso se pueden seguir desde cualquier dispositivo. Las estadísticas se calculan por modo con `game_players`. El perfil (nombre y estadísticas) sigue disponible desde el menú del usuario.

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

- `tests/unit` — geometría, puntaje, evaluación de respuestas, códigos de invitación, autorización del cron, el cliente de Street View (con `fetch` falso) y la validación de panorámicas.
- `tests/flows` — el flujo completo del juego contra SQLite en memoria con un buscador de panorámicas falso y las migraciones reales: mapas con sus lugares, modos con sus reglas fijas, partida completa, retomar una partida, polling con `sinceVersion`, tiempo por ronda (inicio idempotente, tolerancia, respuestas fuera de tiempo, modo sin tiempo), rondas puntuadas una sola vez, permisos, historial paginado, limpieza de partidas abandonadas y caché; y la persistencia con bloqueo optimista (reintentos ante escrituras concurrentes); y el multijugador: sala de espera, códigos, límite de jugadores, inicio, mismas rondas para todos, pines ocultos hasta cerrar la ronda, cierre por tiempo o por jugadores desconectados, siguiente ronda, resultados finales, abandono, anfitrión y limpieza; y el Battle Royale: mínimo de jugadores, rondas planificadas, eliminación del más lejano, desempate por el que respondió último, eliminación de quien no respondió o abandonó, rondas sin eliminados y posiciones finales.
