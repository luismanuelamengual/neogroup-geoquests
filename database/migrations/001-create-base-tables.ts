import { DB, Schema } from '@neogroup/neorm'

/**
 * Base schema of GeoQuests.
 *
 * The DDL is engine-agnostic (neorm's `Schema` builder compiles it to
 * PostgreSQL in production and to SQLite in tests):
 *
 *   - users / email_verification_tokens / password_reset_tokens → authentication
 *   - maps            → where to play, chosen after the game mode (name, description, image)
 *   - places          → playable areas (a circle or a GeoJSON polygon)
 *   - map_places      → which places each map draws its locations from (many-to-many)
 *   - place_locations → small fallback cache of Street View panoramas already found inside a place
 *   - games           → one row per game, of any mode: common columns + `data` (the mode's own state)
 *   - game_players    → who played each game and their final result (the history and the stats)
 *
 * `games.data` (jsonb, TEXT on SQLite) holds everything that is particular to
 * a game mode (rounds, answers, guesses, clocks...). It is only read and
 * written by the engine of that mode (see app/(protected)/(game)/services/gameModes.ts)
 * and never reaches the browser as is: every engine builds the view each
 * player is allowed to see. Anything that has to be filtered, indexed or
 * joined lives in a column instead. `games.version` is increased on every
 * write: updates are conditional on it (optimistic locking, several players
 * may act at once) and clients poll with it to know whether anything changed.
 *
 * `places.geometry` holds the area of a place as a GeoJSON geometry: a circle
 * (Point + `radius` in meters) or a Polygon — see
 * app/(protected)/(game)/models/PlaceGeometry.ts. No PostGIS, so the schema
 * stays portable; the geometry math lives in utils/geo.ts.
 *
 * Enumerations are stored as INTEGER: `mode` → GameMode, `status` →
 * GameStatus / GamePlayerStatus, `outcome` → GameOutcome.
 */
export default {
  name: '001-create-base-tables',

  async up(): Promise<void> {
    await DB.transaction(async () => {
      await Schema.createIfNotExists('users', (table) => {
        table.increments('id')
        table.string('email', 255).unique()
        table.string('passwordHash', 255).nullable()
        table.string('name', 60).nullable()
        // Language chosen by the player ('es' | 'en', see app/i18n/config.ts): app and emails.
        table.string('locale', 5).default('es')
        table.boolean('emailVerified').default(false)
        table.boolean('active').default(true)
        table.timestamp('createdAt').useCurrent()
      })

      await Schema.createIfNotExists('email_verification_tokens', (table) => {
        table.increments('id')
        table.integer('userId')
        table.string('token', 128).unique()
        table.timestamp('expiresAt')
        table.timestamp('createdAt').useCurrent()

        table.foreign('userId').references('id').on('users').cascadeOnDelete()
      })

      await Schema.createIfNotExists('password_reset_tokens', (table) => {
        table.increments('id')
        table.integer('userId')
        table.string('token', 128).unique()
        table.timestamp('expiresAt')
        table.timestamp('createdAt').useCurrent()

        table.foreign('userId').references('id').on('users').cascadeOnDelete()
      })

      await Schema.createIfNotExists('maps', (table) => {
        table.increments('id')
        table.string('name', 120)
        table.text('description')
        // Image of the map card (a path under /public or an absolute URL).
        table.string('image', 255).nullable()
        // Settings of the map (e.g. { scoreMaxDistanceKm: 3500 }) that override the ones of the game
        // modes: big regions (whole countries) need a bigger score scale than cities. Null: none.
        table.jsonb('settings').nullable()
        table.boolean('enabled').default(true)
        table.timestamp('createdAt').useCurrent()
      })

      await Schema.createIfNotExists('places', (table) => {
        table.increments('id')
        table.string('name', 120)
        table.char('countryCode', 2)
        // GeoJSON geometry of the area: { type: 'Point', coordinates: [lng, lat], radius: meters }
        // for a circle, or { type: 'Polygon', coordinates: [[[lng, lat], ...]] }.
        table.jsonb('geometry')
        table.boolean('enabled').default(true)
        table.timestamp('createdAt').useCurrent()
      })

      await Schema.createIfNotExists('map_places', (table) => {
        table.integer('mapId')
        table.integer('placeId')

        table.primary(['mapId', 'placeId'])
        table.index('placeId', 'idx_map_places_place')
        table.foreign('mapId').references('id').on('maps').cascadeOnDelete()
        table.foreign('placeId').references('id').on('places').cascadeOnDelete()
      })

      await Schema.createIfNotExists('place_locations', (table) => {
        table.increments('id')
        table.integer('placeId')
        // Google Street View panorama id.
        table.string('panoId', 128).unique()
        table.double('latitude')
        table.double('longitude')
        table.timestamp('createdAt').useCurrent()

        table.index('placeId', 'idx_place_locations_place')
        table.foreign('placeId').references('id').on('places').cascadeOnDelete()
      })

      await Schema.createIfNotExists('games', (table) => {
        table.increments('id')
        // GameMode enum.
        table.smallInteger('mode')
        table.integer('mapId').nullable()
        // GameStatus enum.
        table.smallInteger('status')
        // Invitation code of multiplayer games (cleared when the game ends).
        table.string('code', 6).nullable().unique()
        table.integer('hostUserId').nullable()
        // Increased on every write (optimistic locking + polling).
        table.integer('version').default(1)
        // State of the game mode (see the note at the top).
        table.jsonb('data')
        table.timestamp('createdAt').useCurrent()
        table.timestamp('startedAt').nullable()
        table.timestamp('finishedAt').nullable()
        table.timestamp('updatedAt').useCurrent()

        table.index(['status', 'updatedAt'], 'idx_games_status')
        table.foreign('mapId').references('id').on('maps').nullOnDelete()
        table.foreign('hostUserId').references('id').on('users').nullOnDelete()
      })

      await Schema.createIfNotExists('game_players', (table) => {
        table.integer('gameId')
        table.integer('userId')
        // GamePlayerStatus enum.
        table.smallInteger('status')
        // Final score (set when the game ends).
        table.integer('score').default(0)
        // Final position (1 = first), set when the game ends.
        table.smallInteger('position').nullable()
        // GameOutcome enum, set when the game ends (null when the mode has no winner).
        table.smallInteger('outcome').nullable()
        table.timestamp('joinedAt').useCurrent()
        // Last time the player asked for the game (presence in real time modes).
        table.timestamp('lastSeenAt').useCurrent()

        table.primary(['gameId', 'userId'])
        table.index(['userId', 'gameId'], 'idx_game_players_user')
        table.foreign('gameId').references('id').on('games').cascadeOnDelete()
        table.foreign('userId').references('id').on('users').cascadeOnDelete()
      })
    })
  }
}
