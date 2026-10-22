import { DB, Schema } from '@neogroup/neorm'

/**
 * Nickname of the players:
 *
 *   - users.nickname → when set, shown instead of the name and last name (see getUserDisplayName).
 */
export default {
  name: '005-user-nickname',

  async up(): Promise<void> {
    await DB.transaction(async () => {
      if (!(await Schema.hasColumn('users', 'nickname'))) {
        await Schema.table('users', (table) => {
          table.string('nickname', 60).nullable()
        })
      }
    })
  }
}
