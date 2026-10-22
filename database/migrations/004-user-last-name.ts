import { DB, Schema } from '@neogroup/neorm'

/**
 * Last name of the players:
 *
 *   - users.lastName → shown next to the name everywhere (see getUserDisplayName). Taken from Google
 *                      (family_name) on sign-in while it is null; '' means the player cleared it on purpose.
 */
export default {
  name: '004-user-last-name',

  async up(): Promise<void> {
    await DB.transaction(async () => {
      if (!(await Schema.hasColumn('users', 'lastName'))) {
        await Schema.table('users', (table) => {
          table.string('lastName', 60).nullable()
        })
      }
    })
  }
}
