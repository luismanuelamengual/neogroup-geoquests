import { DB, Schema } from '@neogroup/neorm'

/**
 * Base schema of GeoQuests.
 *
 * The DDL is engine-agnostic (neorm's `Schema` builder compiles it to
 * PostgreSQL in production and to SQLite in tests):
 *
 *   - users / email_verification_tokens / password_reset_tokens → authentication
 *   - places          → playable areas (a circle or a GeoJSON polygon) per game mode
 *   - place_locations → cache of street-level images already found inside a place
 *   - games / game_rounds → the matches played and their rounds
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
        table.integer('mode')
        table.integer('status')
        table.integer('roundsCount')
        table.integer('totalScore').default(0)
        table.timestamp('createdAt').useCurrent()
        table.timestamp('finishedAt').nullable()

        table.index('userId', 'idx_games_user')
        table.foreign('userId').references('id').on('users').cascadeOnDelete()
      })

      await Schema.createIfNotExists('game_rounds', (table) => {
        table.increments('id')
        table.integer('gameId')
        table.integer('roundNumber')
        table.integer('placeId')
        // The street-level image shown in the round and its real position.
        table.string('imageId', 64)
        table.double('latitude')
        table.double('longitude')
        // The player's guess (null until the round is played).
        table.double('guessLatitude').nullable()
        table.double('guessLongitude').nullable()
        table.double('distanceMeters').nullable()
        table.integer('score').nullable()
        table.timestamp('guessedAt').nullable()

        table.unique(['gameId', 'roundNumber'])
        table.foreign('gameId').references('id').on('games').cascadeOnDelete()
        table.foreign('placeId').references('id').on('places')
      })
    })
  }
}
