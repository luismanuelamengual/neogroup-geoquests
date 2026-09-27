import { DB, Schema } from '@neogroup/neorm'

/**
 * Base schema of GeoQuests.
 *
 * The DDL is engine-agnostic (neorm's `Schema` builder compiles it to
 * PostgreSQL in production and to SQLite in tests):
 *
 *   - users / email_verification_tokens / password_reset_tokens → authentication
 *   - places          → playable areas (a circle or a GeoJSON polygon) per game mode
 *   - place_locations → small cache of street-level images already found inside a place
 *   - games           → one row per game: progress and final score (the history)
 *
 * The rounds of a game are NOT stored: they travel with the player inside an
 * encrypted game token (see app/(protected)/(game)/services/gameTokens.ts).
 * `games.playedRounds` is what makes that safe — a token for a round that was
 * already played is rejected, so it cannot be replayed to re-guess an answer.
 *
 * Coordinates are stored as plain `double` columns (no PostGIS) so the schema
 * stays portable; the geometry lives in app/(protected)/(game)/utils/geo.ts.
 * `places.polygon` is a GeoJSON Polygon stored in a `jsonb` column (TEXT on SQLite).
 * Enum-like columns (`mode`, `status`) are INTEGERs mapped to the numeric enums
 * GameMode and GameStatus.
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

      await Schema.createIfNotExists('places', (table) => {
        table.increments('id')
        table.string('name', 120)
        table.char('countryCode', 2)
        table.integer('mode')
        // Center of the place: the circle center, or a reference point for polygons.
        table.double('latitude')
        table.double('longitude')
        // Circle radius in meters. Null when the area is described by `polygon`.
        table.integer('radiusMeters').nullable()
        // GeoJSON Polygon ({ type: 'Polygon', coordinates: [[[lng, lat], ...]] }). Null for circles.
        table.jsonb('polygon').nullable()
        table.boolean('enabled').default(true)
        table.timestamp('createdAt').useCurrent()

        table.index('mode', 'idx_places_mode')
      })

      await Schema.createIfNotExists('place_locations', (table) => {
        table.increments('id')
        table.integer('placeId')
        table.string('imageId', 64).unique()
        table.double('latitude')
        table.double('longitude')
        table.boolean('isPano').default(false)
        table.timestamp('createdAt').useCurrent()

        table.index('placeId', 'idx_place_locations_place')
        table.foreign('placeId').references('id').on('places').cascadeOnDelete()
      })

      await Schema.createIfNotExists('games', (table) => {
        table.increments('id')
        table.integer('userId')
        table.smallInteger('mode')
        table.smallInteger('status')
        table.smallInteger('roundsCount')
        // Rounds already guessed. The next token accepted must be for round playedRounds + 1.
        table.smallInteger('playedRounds').default(0)
        table.integer('totalScore').default(0)
        table.timestamp('createdAt').useCurrent()
        table.timestamp('finishedAt').nullable()

        table.index(['userId', 'id'], 'idx_games_user')
        table.foreign('userId').references('id').on('users').cascadeOnDelete()
      })
    })
  }
}
