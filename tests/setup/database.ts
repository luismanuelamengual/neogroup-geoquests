/* eslint-disable */
import { DB } from '@neogroup/neorm'
import baseTables from '@/database/migrations/001-create-base-tables'
import seedMaps from '@/database/migrations/002-seed-maps'
import progressAndDaily from '@/database/migrations/003-player-progress-and-daily-challenges'
import playerXp from '@/database/migrations/006-player-xp'
import achievements from '@/database/migrations/007-achievements'
import starGameBronze from '@/database/migrations/008-star-game-bronze'
import moreAchievements from '@/database/migrations/009-more-achievements'

const TABLES = [
  'user_achievements',
  'daily_results',
  'daily_challenges',
  'player_progress',
  'game_players',
  'games',
  'place_locations',
  'map_places',
  'places',
  'maps',
  'password_reset_tokens',
  'email_verification_tokens',
  'users'
]

/** Drops every table and re-applies the real migrations (schema + the seeded maps and cities). */
export async function resetDatabase(): Promise<void> {
  for (const table of TABLES) {
    await DB.execute(`DROP TABLE IF EXISTS "${table}"`)
  }

  await baseTables.up()
  await seedMaps.up()
  await progressAndDaily.up()
  await playerXp.up()
  await achievements.up()
  await starGameBronze.up()
  await moreAchievements.up()
}

/** Inserts a verified user and returns its id. */
export async function createUser(email = 'player@geoquests.test'): Promise<number> {
  await DB.table('users').insert({ email, name: 'Player', emailVerified: true, active: true })
  const row = await DB.table('users').where('email', email).first()

  return Number(row!.id)
}
