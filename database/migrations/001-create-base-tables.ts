import { DB, Schema } from '@neogroup/neorm'

/**
 * Base schema of GeoQuests.
 *
 * The DDL is engine-agnostic (neorm's `Schema` builder compiles it to
 * PostgreSQL in production and to SQLite in tests):
 *
 *   - users / email_verification_tokens / password_reset_tokens → authentication
 *   - quests          → the game modes shown in the main menu (rounds, time per round, image)
 *   - places          → playable areas (a circle or a GeoJSON polygon)
 *   - quest_place     → which places each quest draws its rounds from (many-to-many)
 *   - place_locations → small fallback cache of Street View panoramas already found inside a place
 *   - games           → one row per game: progress and final score (the history)
 *
 * The rounds of a game are NOT stored: they travel with the player inside an
 * encrypted game token (see app/(protected)/(game)/services/gameTokens.ts).
 * `games.playedRounds` is what makes that safe — a token for a round that was
 * already played is rejected, so it cannot be replayed to re-guess an answer.
 *
 * `places.geometry` holds the area of a place as a GeoJSON geometry in a
 * `jsonb` column (TEXT on SQLite): a circle (Point + `radius` in meters) or a
 * Polygon — see app/(protected)/(game)/models/PlaceGeometry.ts. No PostGIS, so
 * the schema stays portable; the geometry math lives in utils/geo.ts.
 * `games.status` is an INTEGER mapped to the GameStatus enum.
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

      await Schema.createIfNotExists('quests', (table) => {
        table.increments('id')
        table.string('name', 120)
        table.text('description')
        // Rounds of every game of the quest.
        table.smallInteger('rounds')
        // Time limit of each round, in minutes. Null = no time limit.
        table.smallInteger('time').nullable()
        // Image of the quest card in the main menu (a path under /public or an absolute URL).
        table.string('image', 255).nullable()
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

      await Schema.createIfNotExists('quest_place', (table) => {
        table.integer('questId')
        table.integer('placeId')

        table.primary(['questId', 'placeId'])
        table.index('placeId', 'idx_quest_place_place')
        table.foreign('questId').references('id').on('quests').cascadeOnDelete()
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
        table.integer('userId')
        table.integer('questId')
        table.smallInteger('status')
        table.smallInteger('roundsCount')
        // Rounds already guessed. The next token accepted must be for round playedRounds + 1.
        table.smallInteger('playedRounds').default(0)
        table.integer('totalScore').default(0)
        // When the current round was shown to the player (timed quests): the
        // server measures the time limit from here, so reloading the page or
        // replaying a token can't restart the clock. Reset after every guess.
        table.timestamp('roundStartedAt').nullable()
        table.timestamp('createdAt').useCurrent()
        table.timestamp('finishedAt').nullable()

        table.index(['userId', 'id'], 'idx_games_user')
        table.foreign('userId').references('id').on('users').cascadeOnDelete()
        table.foreign('questId').references('id').on('quests').cascadeOnDelete()
      })
    })
  }
}
