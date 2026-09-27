import { GuessInput } from '@/app/(protected)/(game)/models/GuessInput'
import { submitGuess } from '@/app/(protected)/(game)/services/games'
import { withAuth } from '@/app/utils/api-server'

/** POST /api/submitGuess — registers the guess of the current round and returns the updated game. */
export const POST = withAuth(async (request, _context, userId) => {
  const input = (await request.json()) as GuessInput

  return submitGuess(userId, input)
})
