import { GuessAction } from '@/app/(protected)/(game)/models/GuessAction'
import { NextRoundAction } from '@/app/(protected)/(game)/models/NextRoundAction'
import { StartRoundAction } from '@/app/(protected)/(game)/models/StartRoundAction'

/** Something a player does in a game (/api/sendGameAction). Each mode accepts some of them. */
export type GameAction = StartRoundAction | GuessAction | NextRoundAction
