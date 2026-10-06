import { DB } from '@neogroup/neorm'
import { beforeEach, describe, expect, it } from 'vitest'
import { LANDMARK_CLUES } from '@/app/(protected)/(game)/data/landmarkClues'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectiveGameView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { DETECTIVE_MAP_SLUG } from '@/app/(protected)/(game)/services/detectiveMode'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import { createGame, getGames, sendGameAction } from '@/app/(protected)/(game)/services/games'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { distanceKm, getDetectiveMaxScore, getTravelMinutes } from '@/app/(protected)/(game)/utils/detective'
import { DETECTIVE_DIFFICULTIES } from '@/app/(protected)/(game)/utils/detectiveDifficulty'
import { countContradictions, generateSuspect } from '@/app/(protected)/(game)/utils/suspects'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

/**
 * Other ways of naming a country (besides its official name, see the test
 * that uses it) that a clue must not use either: demonyms, languages, aliases.
 */
const COUNTRY_ALIASES: Record<string, string[]> = {
  AD: ['andorra'],
  AE: ['emiratos', 'emirates', 'dubái', 'dubai', 'abu dabi', 'abu dhabi'],
  AR: ['argentin'],
  AT: ['austria', 'austrí'],
  AU: ['australia'],
  BA: ['bosnia', 'herzegovina'],
  BE: ['bélgica', 'belgium', 'belga', 'belgian'],
  BG: ['bulgari', 'búlgar'],
  BO: ['bolivia'],
  BR: ['brasil', 'brazil'],
  CA: ['canadá', 'canada', 'canadian', 'canadiense'],
  CH: ['suiza', 'switzerland', 'swiss', 'suizo'],
  CL: ['chilen', 'chilean'],
  CO: ['colombia'],
  CR: ['costa rica', 'costarric'],
  CZ: ['chequia', 'checa', 'czech'],
  DE: ['alemania', 'germany', 'german', 'alemán'],
  DK: ['dinamarca', 'denmark', 'danish', 'danés'],
  DO: ['dominicana', 'dominican'],
  EC: ['ecuatorian'],
  EE: ['estoni'],
  ES: ['españa', 'spain', 'español', 'spanish'],
  FI: ['finlandia', 'finland', 'finnish'],
  FO: ['feroe', 'faroe', 'faroese'],
  FR: ['francés', 'french'],
  GB: ['inglaterra', 'england', 'escocia', 'scotland', 'gran bretaña', 'britain', 'british', 'británic'],
  GH: ['ghana'],
  GI: ['gibraltar'],
  GR: ['grecia', 'greece', 'griego', 'greek'],
  GT: ['guatemal'],
  HK: ['hong kong'],
  HR: ['croacia', 'croatia', 'croata', 'croatian'],
  HU: ['hungría', 'hungary', 'húngaro', 'hungarian'],
  ID: ['indonesia'],
  IE: ['irlanda', 'ireland', 'irish', 'irlandés'],
  IL: ['israel'],
  IN: ['hindú', 'indian'],
  IS: ['islandés', 'icelandic'],
  IT: ['italia', 'italy', 'italian', 'italiano'],
  JO: ['jordan'],
  JP: ['japón', 'japan', 'japonés', 'japanese'],
  KH: ['camboya', 'cambodia', 'jemer', 'khmer'],
  KR: ['corea', 'korea'],
  LI: ['liechtenstein'],
  LK: ['sri lanka', 'ceilán', 'ceylon'],
  LT: ['lituan', 'lithuan'],
  LU: ['luxembur'],
  LV: ['letonia', 'letón', 'latvia'],
  MC: ['mónaco', 'monaco', 'monegas'],
  MN: ['mongol'],
  MO: ['macao', 'macau'],
  MT: ['maltés', 'maltese'],
  MX: ['méxico', 'mexico', 'mexican'],
  MY: ['malasia', 'malaysia'],
  NL: ['holanda', 'holland', 'dutch', 'neerland'],
  NO: ['noruega', 'norway', 'norweg', 'noruego'],
  NZ: ['nueva zelanda', 'new zealand', 'kiwi'],
  PA: ['panameñ', 'panamanian'],
  PE: ['perú', 'peru'],
  PH: ['filipin', 'philippin'],
  PL: ['polonia', 'poland', 'polish', 'polaco'],
  PR: ['puerto rico', 'puertorr'],
  PT: ['portugués', 'portuguese'],
  PY: ['paraguay'],
  RO: ['rumania', 'romania', 'rumano', 'romanian'],
  RS: ['serbi'],
  RU: ['rusia', 'russia', 'ruso', 'russian'],
  SE: ['suecia', 'sweden', 'swedish', 'sueco'],
  SG: ['singapur', 'singapore'],
  SI: ['eslovenia', 'slovenia', 'esloven', 'sloven'],
  SK: ['eslovaquia', 'eslovac', 'slovak'],
  SM: ['san marino', 'sanmarin'],
  SN: ['senegal'],
  TH: ['tailandia', 'thailand', 'thai'],
  TN: ['túnez', 'tunisia', 'tunecin'],
  TR: ['turquía', 'turkey', 'türkiye', 'turco', 'turca', 'turkish'],
  TW: ['taiwán', 'taiwan', 'formosa'],
  US: ['estados unidos', 'united states', 'ee.uu', 'eeuu'],
  UY: ['uruguay'],
  VA: ['vaticano', 'vatican'],
  VN: ['vietnam'],
  ZA: ['sudáfrica', 'south africa', 'sudafrican']
}

function detective(game: GameView): DetectiveGameView {
  return game.modeView as DetectiveGameView
}

const {
  maxMistakes: MAX_MISTAKES,
  witnessBudgetMinutes: WITNESS_BUDGET_MINUTES,
  witnessMinutes: WITNESS_MINUTES
} = DETECTIVE_DIFFICULTIES.medium

describe('detective game flow', () => {
  let userId: number

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
  })

  function create(finder = new FakePanoramaFinder()): Promise<GameView> {
    return createGame(userId, { mode: GameMode.DETECTIVE }, { finder })
  }

  function act(gameId: number, action: GameAction): Promise<GameView> {
    return sendGameAction(userId, { gameId, action })
  }

  /** The case as stored in the database (with the answers). */
  async function stored(gameId: number): Promise<DetectiveGameData> {
    return (await Game.find(gameId))!.data as DetectiveGameData
  }

  /** Travels to the right destination of every stage (asking the first witness of each): the detective gets to the suspects. */
  async function reachLastStop(gameId: number): Promise<GameView> {
    let view: GameView | null = null

    for (let stage = 1; stage <= 5; stage++) {
      await act(gameId, { type: 'askWitness', stageNumber: stage, witness: 0 })
      view = await travelRight(gameId)
    }

    return view!
  }

  /** Travels to the right destination of the current stage. */
  async function travelRight(gameId: number): Promise<GameView> {
    const data = await stored(gameId)
    const stage = data.stages[data.currentStage - 1]

    return act(gameId, { type: 'travel', stageNumber: data.currentStage, placeId: stage.destination.placeId })
  }

  it('is offered in the "Jugar" menu, always in the landmarks map', async () => {
    const mode = getGameModes().find((item) => item.mode === GameMode.DETECTIVE)

    expect(mode).toMatchObject({ slug: 'detective', maxPlayers: 1, mapSlug: DETECTIVE_MAP_SLUG })

    // Whatever map the client sends, the case is played in the landmarks map.
    const otherMap = (await getMaps()).find((map) => map.slug !== DETECTIVE_MAP_SLUG)!
    const game = await createGame(
      userId,
      { mode: GameMode.DETECTIVE, mapId: otherMap.id },
      { finder: new FakePanoramaFinder() }
    )
    const landmarks = (await getMaps()).find((map) => map.slug === DETECTIVE_MAP_SLUG)!

    expect(game.mapId).toBe(landmarks.id)
    expect(game.status).toBe(GameStatus.IN_PROGRESS)
  })

  it('plans a route of landmarks with clues, decoys and a time limit', async () => {
    const game = await create()
    const data = await stored(game.id)
    const seeded = new Set((await Place.get()).map((place) => place.name))

    expect(data.stages).toHaveLength(5)
    expect(data.currentStage).toBe(1)
    expect(data.elapsedMinutes).toBe(0)
    expect(data.timeLimitMinutes % 60).toBe(0)
    expect(data.origin.panoId).toBeTruthy()

    const route = [data.origin, ...data.stages.map((stage) => stage.destination)]

    // Every stop is a different place, every destination has its clues, far enough from the previous stop.
    expect(new Set(route.map((stop) => stop.placeId)).size).toBe(6)
    data.stages.forEach((stage, index) => {
      expect(LANDMARK_CLUES[stage.destination.placeName], stage.destination.placeName).toBeDefined()
      expect(distanceKm(route[index], stage.destination)).toBeGreaterThan(400)
      expect(stage.destination.panoId).toBeTruthy()

      // Four options: the right one and decoys of other countries (all different).
      expect(stage.options).toHaveLength(4)
      expect(stage.options.map((option) => option.placeId)).toContain(stage.destination.placeId)
      expect(new Set(stage.options.map((option) => option.countryCode)).size).toBe(4)

      // Three witnesses with three different clues, at least one about geography.
      expect(stage.witnesses).toHaveLength(3)
      expect(new Set(stage.witnesses.map((witness) => witness.clueIndex)).size).toBe(3)
      expect(stage.witnesses.some((witness) => witness.clueIndex <= 1)).toBe(true)
      expect(stage.askedWitnesses).toEqual([])
      expect(stage.travel).toBeNull()

      // One of the three witnesses also tells a trait of the thief.
      expect(stage.witnesses.filter((witness) => witness.suspectClue)).toHaveLength(1)
    })

    // The thief and its decoys: the traits told along the case (one per stage) tell the thief from each of them.
    const clues = data.stages.map((stage) => stage.witnesses.find((witness) => witness.suspectClue)!.suspectClue!)

    expect(data.lineup!.seeds).toHaveLength(4)
    expect(new Set(data.lineup!.seeds).size).toBe(4)
    expect(data.lineup!.accused).toBeNull()
    expect(new Set(clues.map((clue) => clue.trait)).size).toBe(5)
    data.lineup!.seeds.forEach((seed, index) => {
      expect(countContradictions(generateSuspect(seed), clues) === 0).toBe(index === data.lineup!.thief)
    })

    // The time is enough for the perfect route (with the witnesses budgeted).
    const perfect =
      data.stages.reduce((total, stage, index) => total + getTravelMinutes(route[index], stage.destination), 0) +
      5 * 3 * WITNESS_BUDGET_MINUTES

    expect(data.timeLimitMinutes).toBeGreaterThan(perfect)

    // Every landmark with clues exists in the seed (names must match exactly).
    for (const name of Object.keys(LANDMARK_CLUES)) {
      expect(seeded.has(name), name).toBe(true)
    }
  })

  it('plans each difficulty with its own rules, kept in the case', async () => {
    for (const difficulty of ['easy', 'medium', 'hard'] as const) {
      const rules = DETECTIVE_DIFFICULTIES[difficulty]

      for (let attempt = 0; attempt < 5; attempt++) {
        const game = await createGame(
          userId,
          { mode: GameMode.DETECTIVE, settings: { difficulty } },
          { finder: new FakePanoramaFinder() }
        )
        const data = await stored(game.id)

        expect(data.settings).toMatchObject({ difficulty, hops: rules.hops, maxMistakes: rules.maxMistakes })
        expect(data.stages).toHaveLength(rules.hops)
        expect(data.lineup!.seeds).toHaveLength(rules.suspects)

        const clues = data.stages.map((stage) => stage.witnesses.find((witness) => witness.suspectClue)?.suspectClue)

        for (const stage of data.stages) {
          expect(stage.options).toHaveLength(rules.options)
          expect(stage.witnesses).toHaveLength(rules.witnesses)
        }

        // Only the traits the difficulty allows, and the thief is the only one that matches them all.
        expect(clues.every((clue) => clue && rules.suspectTraits.includes(clue.trait))).toBe(true)
        data.lineup!.seeds.forEach((seed, index) => {
          expect(countContradictions(generateSuspect(seed), clues as never) === 0).toBe(index === data.lineup!.thief)
        })

        expect(detective(game)).toMatchObject({
          difficulty,
          stagesCount: rules.hops,
          suspectsCount: rules.suspects,
          witnessMinutes: rules.witnessMinutes,
          maxMistakes: rules.maxMistakes
        })
      }
    }
  })

  it('plays a case of the difficulty chosen: its witnesses cost what it says', async () => {
    const game = await createGame(
      userId,
      { mode: GameMode.DETECTIVE, settings: { difficulty: 'hard' } },
      { finder: new FakePanoramaFinder() }
    )
    const asked = await act(game.id, { type: 'askWitness', stageNumber: 1, witness: 0 })

    expect(detective(asked).elapsedMinutes).toBe(DETECTIVE_DIFFICULTIES.hard.witnessMinutes)
  })

  it('falls back to the medium difficulty when it is missing or not valid', async () => {
    for (const settings of [undefined, { difficulty: 'nightmare' }]) {
      const game = await createGame(
        userId,
        { mode: GameMode.DETECTIVE, settings: settings as never },
        { finder: new FakePanoramaFinder() }
      )

      expect(detective(game).difficulty).toBe('medium')
      expect((await stored(game.id)).settings).toMatchObject({ hops: DETECTIVE_DIFFICULTIES.medium.hops })
    }
  })

  it('has clues that never name the country of their landmark', async () => {
    const names = [new Intl.DisplayNames(['es'], { type: 'region' }), new Intl.DisplayNames(['en'], { type: 'region' })]

    for (const [name, clues] of Object.entries(LANDMARK_CLUES)) {
      const place = await Place.where('name', name).first()

      expect(place, name).toBeTruthy()

      const forbidden = [
        ...names.map((displayNames) => displayNames.of(place!.countryCode)!.toLowerCase()),
        ...(COUNTRY_ALIASES[place!.countryCode] ?? [])
      ]

      for (const clue of [...clues.es, ...clues.en]) {
        for (const word of forbidden) {
          expect(clue.toLowerCase(), `${name}: "${word}"`).not.toContain(word)
        }
      }
    }
  })

  it('never shows the answer of the current stage', async () => {
    const game = await create()
    const view = detective(game)
    const data = await stored(game.id)

    expect(view.currentStageNumber).toBe(1)
    expect(view.currentStage!.panoId).toBe(data.origin.panoId)
    expect(view.currentStage!.location.placeId).toBe(data.origin.placeId)
    expect(view.currentStage!.options).toHaveLength(4)
    expect(view.currentStage!.witnesses.every((witness) => !witness.asked && witness.clue === null)).toBe(true)
    expect(view.route).toBeNull()
    expect(view.lineup).toBeNull()
    expect(view.suspectsCount).toBe(4)
    expect(view.playedStages).toEqual([])
    expect(view.maxScore).toBe(getDetectiveMaxScore(5))

    const json = JSON.stringify(view)

    expect(json).not.toContain('clueIndex')
    expect(json).not.toContain('suspectClue":{')
    expect(json).not.toContain('destination')
    expect(json).not.toContain(data.stages[0].destination.panoId)
    expect(json).not.toContain(data.stages[1].destination.panoId)
  })

  it('charges the time of a witness once and shows its clue in every language', async () => {
    const game = await create()
    const data = await stored(game.id)
    const witness = data.stages[0].witnesses[1]
    const clues = LANDMARK_CLUES[data.stages[0].destination.placeName]
    const asked = await act(game.id, { type: 'askWitness', stageNumber: 1, witness: 1 })

    expect(detective(asked).elapsedMinutes).toBe(WITNESS_MINUTES)
    expect(detective(asked).currentStage!.witnesses[1]).toMatchObject({
      asked: true,
      seed: witness.seed,
      role: witness.role,
      clue: { es: clues.es[witness.clueIndex], en: clues.en[witness.clueIndex] }
    })

    // Only the witness that knows a trait of the thief tells it (the others, nothing).
    expect(detective(asked).currentStage!.witnesses[1].suspectClue).toEqual(witness.suspectClue ?? null)
    expect(
      detective(asked).currentStage!.witnesses.every((item, index) => index === 1 || item.suspectClue === null)
    ).toBe(true)

    // Asking again is free (and nothing is written).
    const again = await act(game.id, { type: 'askWitness', stageNumber: 1, witness: 1 })

    expect(detective(again).elapsedMinutes).toBe(WITNESS_MINUTES)
    expect(again.version).toBe(asked.version)

    await expect(act(game.id, { type: 'askWitness', stageNumber: 1, witness: 3 })).rejects.toThrow()
    await expect(act(game.id, { type: 'askWitness', stageNumber: 2, witness: 0 })).rejects.toThrow()
  })

  it('moves on after a right trip, and after a wrong one through the right destination', async () => {
    const game = await create()
    const data = await stored(game.id)
    const [first, second] = data.stages
    const right = await travelRight(game.id)

    expect(detective(right).currentStageNumber).toBe(2)
    expect(detective(right).elapsedMinutes).toBe(getTravelMinutes(data.origin, first.destination))
    expect(detective(right).currentStage!.location.placeId).toBe(first.destination.placeId)
    expect(detective(right).currentStage!.panoId).toBe(first.destination.panoId)
    expect(detective(right).playedStages[0]).toMatchObject({
      stageNumber: 1,
      destination: { placeId: first.destination.placeId },
      travel: { correct: true, redirectMinutes: 0 }
    })

    const wrongOption = second.options.find((option) => option.placeId !== second.destination.placeId)!
    const wrong = await act(game.id, { type: 'travel', stageNumber: 2, placeId: wrongOption.placeId })
    const wasted = getTravelMinutes(first.destination, wrongOption)
    const redirect = getTravelMinutes(wrongOption, second.destination)

    expect(detective(wrong).currentStageNumber).toBe(3)
    expect(detective(wrong).elapsedMinutes).toBe(detective(right).elapsedMinutes + wasted + redirect)
    expect(detective(wrong).currentStage!.location.placeId).toBe(second.destination.placeId)
    expect(detective(wrong).playedStages[1]).toMatchObject({
      chosen: { placeId: wrongOption.placeId },
      travel: { correct: false, travelMinutes: wasted, redirectMinutes: redirect }
    })

    // Only the destinations offered, only in the current stage.
    await expect(act(game.id, { type: 'travel', stageNumber: 3, placeId: -1 })).rejects.toThrow()
    await expect(
      act(game.id, { type: 'travel', stageNumber: 2, placeId: second.destination.placeId })
    ).rejects.toThrow()
  })

  it('does not end the case at the last stop: the detective has to point at the thief among the suspects', async () => {
    const game = await create()
    const data = await stored(game.id)
    const view = await reachLastStop(game.id)
    const result = detective(view)

    expect(view.status).toBe(GameStatus.IN_PROGRESS)
    expect(result.outcome).toBeNull()
    expect(result.currentStage).toBeNull()
    expect(result.currentStageNumber).toBeNull()
    expect(result.playedStages).toHaveLength(5)

    // The suspects are shown (not who the thief is), where the detective is.
    const last = data.stages[4].destination

    expect(result.lineup).toEqual({
      location: expect.objectContaining({ placeId: last.placeId }),
      panoId: last.panoId,
      suspects: data.lineup!.seeds,
      thief: null,
      accused: null
    })
    expect(JSON.stringify(result)).not.toContain(`"thief":${data.lineup!.thief}`)

    // Nothing else can be done there but accusing.
    await expect(act(game.id, { type: 'askWitness', stageNumber: 6, witness: 0 })).rejects.toThrow()
    await expect(act(game.id, { type: 'travel', stageNumber: 6, placeId: last.placeId })).rejects.toThrow()
    await expect(act(game.id, { type: 'accuse', suspect: -1 })).rejects.toThrow()
    await expect(act(game.id, { type: 'accuse', suspect: 4 })).rejects.toThrow()
    await expect(act(game.id, { type: 'accuse', suspect: 1.5 })).rejects.toThrow()
    expect((await stored(game.id)).outcome).toBeNull()
  })

  it('catches the thief when the detective points at it', async () => {
    const game = await create()
    const data = await stored(game.id)

    await reachLastStop(game.id)

    const view = await act(game.id, { type: 'accuse', suspect: data.lineup!.thief })
    const result = detective(view)

    expect(view.status).toBe(GameStatus.FINISHED)
    expect(result.outcome).toBe('caught')
    expect(result.currentStage).toBeNull()
    expect(result.route).toHaveLength(6)
    expect(result.playedStages).toHaveLength(5)
    expect(result.lineup).toMatchObject({ thief: data.lineup!.thief, accused: data.lineup!.thief })
    expect(result.score).toBeGreaterThan(5 * 400 + 1000)
    expect(result.score).toBeLessThanOrEqual(result.maxScore)

    const player = await GamePlayer.where('gameId', game.id).first()

    expect(player).toMatchObject({ outcome: GameOutcome.WON, score: result.score })
    expect((await getGames(userId)).items[0]).toMatchObject({ score: result.score, completedSteps: 5, totalSteps: 5 })

    await expect(act(game.id, { type: 'askWitness', stageNumber: 5, witness: 1 })).rejects.toThrow()
    await expect(act(game.id, { type: 'accuse', suspect: data.lineup!.thief })).rejects.toThrow()
  })

  it('lets the thief escape when the detective points at somebody else', async () => {
    const game = await create()
    const data = await stored(game.id)
    const other = data.lineup!.seeds.findIndex((_, index) => index !== data.lineup!.thief)

    await reachLastStop(game.id)

    const view = await act(game.id, { type: 'accuse', suspect: other })
    const result = detective(view)

    expect(view.status).toBe(GameStatus.FINISHED)
    expect(result.outcome).toBe('wrongSuspect')
    // The destinations count, the catch (and its time bonus) does not.
    expect(result.score).toBe(5 * 400)
    expect(result.lineup).toMatchObject({ thief: data.lineup!.thief, accused: other })
    expect(result.route).toHaveLength(6)
    expect(await GamePlayer.where('gameId', game.id).first()).toMatchObject({ outcome: GameOutcome.LOST })

    await expect(act(game.id, { type: 'accuse', suspect: data.lineup!.thief })).rejects.toThrow()
  })

  it('does not accuse before getting to the last stop', async () => {
    const game = await create()

    await expect(act(game.id, { type: 'accuse', suspect: 0 })).rejects.toThrow()
    expect(detective(game).lineup).toBeNull()
  })

  it('ends as before, caught at the last stop, the cases created without suspects', async () => {
    const game = await create()
    const data = await stored(game.id)

    delete data.lineup
    await DB.table('games')
      .where('id', game.id)
      .update({ data: JSON.stringify(data) })

    const view = await reachLastStop(game.id)

    expect(view.status).toBe(GameStatus.FINISHED)
    expect(detective(view)).toMatchObject({ outcome: 'caught', lineup: null, suspectsCount: 0 })
    expect(detective(view).currentStage).toBeNull()
  })

  it('lets the suspect escape when the time runs out', async () => {
    const game = await create()
    const data = await stored(game.id)

    // Almost no time left: the next trip goes over the limit.
    data.timeLimitMinutes = 30
    await DB.table('games')
      .where('id', game.id)
      .update({ data: JSON.stringify(data) })

    const view = await travelRight(game.id)

    expect(view.status).toBe(GameStatus.FINISHED)
    expect(detective(view).outcome).toBe('escaped')
    expect(detective(view).score).toBe(400)
    expect(await GamePlayer.where('gameId', game.id).first()).toMatchObject({ outcome: GameOutcome.LOST })
  })

  it('loses the trail at one mistake too many, whatever the time left', async () => {
    const game = await create()
    const data = await stored(game.id)

    // All the time in the world: only the mistakes count.
    data.timeLimitMinutes = 100000
    await DB.table('games')
      .where('id', game.id)
      .update({ data: JSON.stringify(data) })

    let view = game

    for (let mistake = 1; mistake <= MAX_MISTAKES + 1; mistake++) {
      const current = await stored(game.id)
      const stage = current.stages[current.currentStage - 1]
      const wrong = stage.options.find((option) => option.placeId !== stage.destination.placeId)!

      view = await act(game.id, { type: 'travel', stageNumber: current.currentStage, placeId: wrong.placeId })
      expect(detective(view).mistakes).toBe(mistake)
    }

    const result = detective(view)

    expect(view.status).toBe(GameStatus.FINISHED)
    expect(result.outcome).toBe('lostTrail')
    expect(result.maxMistakes).toBe(MAX_MISTAKES)
    expect(result.score).toBe(0)
    // The last trip ends where the trail was lost: no redirect.
    expect(result.playedStages.at(-1)!.travel).toMatchObject({ correct: false, redirectMinutes: 0 })
    expect(await GamePlayer.where('gameId', game.id).first()).toMatchObject({ outcome: GameOutcome.LOST })
  })

  it('does not let a witness end the case: without time for it, it stays silent', async () => {
    const game = await create()
    const data = await stored(game.id)

    // Less time left than a witness costs.
    data.timeLimitMinutes = WITNESS_MINUTES - 30
    await DB.table('games')
      .where('id', game.id)
      .update({ data: JSON.stringify(data) })

    await expect(act(game.id, { type: 'askWitness', stageNumber: 1, witness: 0 })).rejects.toThrow()

    expect((await stored(game.id)).outcome).toBeNull()
    expect((await stored(game.id)).elapsedMinutes).toBe(0)

    // The time runs out on the trip.
    expect(detective(await travelRight(game.id)).outcome).toBe('escaped')
  })

  it('replaces the places without imagery', async () => {
    // No imagery around the first landmark with clues: it never ends up in a route.
    const [excluded] = Object.keys(LANDMARK_CLUES)
    const place = (await Place.where('name', excluded).first())!
    const [longitude, latitude] = (place.geometry as { coordinates: [number, number] }).coordinates
    const finder = new FakePanoramaFinder((point) =>
      distanceKm(point, { latitude, longitude }) < 60 ? 'empty' : 'found'
    )

    for (let i = 0; i < 5; i++) {
      const data = await stored((await create(finder)).id)
      const route = [data.origin, ...data.stages.map((stage) => stage.destination)]

      expect(route.map((stop) => stop.placeName)).not.toContain(excluded)
    }
  })
})
