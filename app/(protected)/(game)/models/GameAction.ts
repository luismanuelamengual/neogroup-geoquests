import { AccuseAction } from '@/app/(protected)/(game)/models/AccuseAction'
import { AskWitnessAction } from '@/app/(protected)/(game)/models/AskWitnessAction'
import { GuessAction } from '@/app/(protected)/(game)/models/GuessAction'
import { NextRoundAction } from '@/app/(protected)/(game)/models/NextRoundAction'
import { StartRoundAction } from '@/app/(protected)/(game)/models/StartRoundAction'
import { TravelAction } from '@/app/(protected)/(game)/models/TravelAction'

/** Something a player does in a game (/api/sendGameAction). Each mode accepts some of them. */
export type GameAction =
  StartRoundAction | GuessAction | NextRoundAction | AskWitnessAction | TravelAction | AccuseAction
