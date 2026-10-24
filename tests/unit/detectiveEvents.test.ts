import { describe, expect, it } from 'vitest'
import { DetectiveEvent } from '@/app/(protected)/(game)/models/DetectiveEvent'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { DetectiveStage } from '@/app/(protected)/(game)/models/DetectiveStage'
import { getClueKindRoles, ROLE_CLUE_KIND, WITNESS_ROLES } from '@/app/(protected)/(game)/models/WitnessRole'
import { getTravelMinutes } from '@/app/(protected)/(game)/utils/detective'
import { DETECTIVE_DIFFICULTIES } from '@/app/(protected)/(game)/utils/detectiveDifficulty'
import {
  BAD_SIGNAL_ELIMINATED_VARIANTS,
  BAD_SIGNAL_FACTOR_VARIANTS,
  DETECTIVE_EVENT_TYPES,
  DETECTIVE_EVENTS,
  FLIGHT_EVENT_VARIANTS,
  getAllowedMistakes,
  getCallsLeft,
  getCasePace,
  getStageCallRules,
  getStageFlightMinutes,
  getStagePlan,
  getStageWitnessMinutes,
  HOTLINE_ELIMINATED_VARIANTS,
  HOTLINE_FACTOR_VARIANTS,
  MAX_SUSPECTS,
  MIN_SUSPECTS,
  MAX_REBALANCE_CHANCE,
  planCaseEvents,
  rebalanceStageEvents,
  revealStage,
  RULED_OUT_VARIANTS,
  SLOW_WITNESSES_VARIANTS
} from '@/app/(protected)/(game)/utils/detectiveEvents'
import { CLUES_PER_LANDMARK, getClueKind, planWitnessClues } from '@/app/(protected)/(game)/utils/landmarkClues'
import { seededRandom } from '@/app/(protected)/(game)/utils/seededRandom'
import { LOCALES } from '@/app/i18n/config'
import { createTranslator } from '@/app/i18n/translate'

const MEDIUM = DETECTIVE_DIFFICULTIES.medium

function stageWith(events: DetectiveEvent[]): DetectiveStage {
  return { events, witnesses: [], askedWitnesses: [], options: [], travel: null } as unknown as DetectiveStage
}

describe('witnesses by job', () => {
  it('gives every job a kind of clue, and every kind of clue some jobs', () => {
    for (const role of WITNESS_ROLES) {
      expect(ROLE_CLUE_KIND[role]).toBeDefined()
    }

    // Never more clues of a kind than jobs that know about it: no two witnesses of a stage share a job.
    expect(getClueKindRoles('geography').length).toBeGreaterThanOrEqual(2)
    expect(getClueKindRoles('culture').length).toBeGreaterThanOrEqual(2)
    expect(getClueKindRoles('history').length).toBeGreaterThanOrEqual(1)
  })

  it('plans the clues of the witnesses: different, one of geography, the first of each of its kind', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const random = seededRandom(seed)
      const count = 1 + (seed % CLUES_PER_LANDMARK)
      const perWitness = 1 + (seed % 2)
      const witnesses = planWitnessClues(count, perWitness, random)
      const all = witnesses.flatMap((witness) => witness.clueIndices)

      expect(witnesses).toHaveLength(count)
      expect(new Set(all).size).toBe(all.length)
      expect(all).toHaveLength(Math.min(CLUES_PER_LANDMARK, count * perWitness))
      expect(all.some((index) => getClueKind(index) === 'geography')).toBe(true)
      witnesses.forEach((witness) => {
        expect(getClueKind(witness.clueIndices[0])).toBe(witness.kind)
        expect(witness.clueIndices.length).toBeLessThanOrEqual(perWitness)
      })
    }
  })

  it('gives more clues to as many talkative witnesses as asked, only', () => {
    for (let seed = 1; seed <= 100; seed++) {
      for (const talkative of [0, 1, 2]) {
        const witnesses = planWitnessClues(3, 2, seededRandom(seed), talkative)

        expect(witnesses.filter((witness) => witness.clueIndices.length === 2)).toHaveLength(talkative)
        expect(witnesses.filter((witness) => witness.clueIndices.length === 1)).toHaveLength(3 - talkative)
      }
    }
  })
})

describe('random events', () => {
  it('plans as many good events as bad ones, never two of the same kind in a stage', () => {
    for (let seed = 1; seed <= 400; seed++) {
      const { stages, suspects } = planCaseEvents(
        { ...MEDIUM, eventChance: 0.9, doubleEventChance: 0.6 },
        6,
        seededRandom(seed)
      )
      const events = stages.flat()
      const good = events.filter((event) => DETECTIVE_EVENTS[event.type].good).length

      expect(Math.abs(good - (events.length - good))).toBeLessThanOrEqual(1)
      expect(suspects).toBeGreaterThanOrEqual(MIN_SUSPECTS)
      expect(suspects).toBeLessThanOrEqual(MAX_SUSPECTS)

      for (const stage of stages) {
        expect(stage.length).toBeLessThanOrEqual(2)
        expect(new Set(stage.map((event) => DETECTIVE_EVENTS[event.type].group)).size).toBe(stage.length)
      }

      for (const event of events) {
        if (event.type === 'extraTime' || event.type === 'lostTime') {
          expect([120, 180, 240]).toContain(event.minutes)
        }

        if (event.type === 'directFlight' || event.type === 'delayedFlight') {
          expect(FLIGHT_EVENT_VARIANTS).toContain(event.minutes)
        }

        if (event.type === 'talkative') {
          expect([undefined, 1, 2]).toContain(event.witnesses)
        }

        if (event.type === 'ruledOut') {
          expect(RULED_OUT_VARIANTS).toContain(event.count)
        }

        if (event.type === 'slowWitnesses') {
          expect(SLOW_WITNESSES_VARIANTS).toContain(event.factor)
        }

        if (event.type === 'hotline') {
          expect(HOTLINE_FACTOR_VARIANTS).toContain(event.factor)
          expect(HOTLINE_ELIMINATED_VARIANTS).toContain(event.eliminatesChange)
        }

        if (event.type === 'badSignal') {
          expect(BAD_SIGNAL_FACTOR_VARIANTS).toContain(event.factor)
          expect(BAD_SIGNAL_ELIMINATED_VARIANTS).toContain(-event.eliminatesChange!)
        }
      }
    }
  })

  it('plans no events without chance, and never one that would do nothing', () => {
    expect(planCaseEvents({ ...MEDIUM, eventChance: 0 }, 5, seededRandom(1)).stages.flat()).toEqual([])

    for (let seed = 1; seed <= 300; seed++) {
      const events = planCaseEvents(
        { ...MEDIUM, eventChance: 1, doubleEventChance: 1, centralCalls: 0, maxMistakes: 0, suspects: 2 },
        6,
        seededRandom(seed)
      ).stages.flat()
      const types = events.map((event) => event.type)
      // Without calls, nothing about them but an extra call (the others come after one).
      const firstExtraCall = types.indexOf('extraCall')
      const callEvents = types.findIndex((type) => ['hotline', 'linesDown', 'badSignal'].includes(type))

      expect(callEvents === -1 || (firstExtraCall !== -1 && firstExtraCall < callEvents)).toBe(true)

      // Without mistakes allowed, pressure only after a second chance; never fewer than two suspects.
      const firstSecondChance = types.indexOf('secondChance')
      const pressure = types.indexOf('pressure')

      expect(pressure === -1 || (firstSecondChance !== -1 && firstSecondChance < pressure)).toBe(true)
    }
  })

  it('plans every variant of talkative and ruledOut, and never rules out every wrong destination', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const events = planCaseEvents(
        { ...MEDIUM, witnesses: 2, options: 3, eventChance: 1, doubleEventChance: 1 },
        6,
        seededRandom(seed)
      ).stages.flat()

      for (const event of events) {
        if (event.type === 'ruledOut') {
          expect(event.count).toBe(1)
        }
      }
    }

    const variants = new Set<string>()

    for (let seed = 1; seed <= 300; seed++) {
      planCaseEvents({ ...MEDIUM, eventChance: 1, doubleEventChance: 1 }, 6, seededRandom(seed))
        .stages.flat()
        .forEach((event) => {
          if (event.type === 'talkative') {
            variants.add(`talkative-${event.witnesses ?? 'all'}`)
          }

          if (event.type === 'ruledOut') {
            variants.add(`ruledOut-${event.count}`)
          }
        })
    }

    expect([...variants].sort()).toEqual(['ruledOut-1', 'ruledOut-2', 'talkative-1', 'talkative-2', 'talkative-all'])
  })

  it('happens all of them, sooner or later', () => {
    const seen = new Set<string>()

    for (let seed = 1; seed <= 300; seed++) {
      planCaseEvents({ ...MEDIUM, eventChance: 1, doubleEventChance: 1 }, 6, seededRandom(seed))
        .stages.flat()
        .forEach((event) => seen.add(event.type))
    }

    expect([...seen].sort()).toEqual([...DETECTIVE_EVENT_TYPES].sort())
  })

  it('tells what the witnesses know about only where there is more than one of them', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const { stages } = planCaseEvents(
        { ...MEDIUM, witnesses: 1, eventChance: 1, doubleEventChance: 1 },
        6,
        seededRandom(seed)
      )

      for (const events of stages) {
        const types = events.map((event) => event.type)
        const files = types.indexOf('witnessFiles')

        // With a single witness, only after another one showed up.
        expect(files === -1 || (types.indexOf('extraWitness') !== -1 && types.indexOf('extraWitness') < files)).toBe(
          true
        )
      }
    }
  })

  it('plans the witnesses and destinations of a stage with its events', () => {
    expect(getStagePlan(MEDIUM, [])).toEqual({
      witnesses: 3,
      cluesPerWitness: 1,
      talkativeWitnesses: 0,
      suspectClues: 1,
      decoys: 4
    })
    expect(
      getStagePlan(MEDIUM, [
        { type: 'extraWitness' },
        { type: 'talkative' },
        { type: 'sharpEye' },
        { type: 'moreRumors' }
      ])
    ).toEqual({ witnesses: 4, cluesPerWitness: 2, talkativeWitnesses: 4, suspectClues: 2, decoys: 5 })
    expect(getStagePlan(MEDIUM, [{ type: 'missingWitness' }, { type: 'noSighting' }])).toEqual({
      witnesses: 2,
      cluesPerWitness: 1,
      talkativeWitnesses: 0,
      suspectClues: 0,
      decoys: 4
    })
    expect(getStagePlan(MEDIUM, [{ type: 'talkative', witnesses: 1 }]).talkativeWitnesses).toBe(1)
    expect(
      getStagePlan(MEDIUM, [{ type: 'talkative', witnesses: 2 }, { type: 'missingWitness' }]).talkativeWitnesses
    ).toBe(2)
    expect(
      getStagePlan({ ...MEDIUM, witnesses: 2 }, [{ type: 'talkative', witnesses: 2 }, { type: 'missingWitness' }])
        .talkativeWitnesses
    ).toBe(1)
  })

  it('changes what a witness and a call cost at a stage', () => {
    expect(getStageWitnessMinutes(MEDIUM, stageWith([]))).toBe(120)
    expect(getStageWitnessMinutes(MEDIUM, stageWith([{ type: 'quickWitnesses' }]))).toBe(60)
    expect(getStageWitnessMinutes(MEDIUM, stageWith([{ type: 'slowWitnesses' }]))).toBe(180)
    expect(getStageWitnessMinutes({ witnessMinutes: 30 }, stageWith([{ type: 'quickWitnesses' }]))).toBe(30)
    expect(getStageWitnessMinutes(MEDIUM, stageWith([{ type: 'slowWitnesses', factor: 1.25 }]))).toBe(150)
    expect(getStageWitnessMinutes(MEDIUM, stageWith([{ type: 'slowWitnesses', factor: 2 }]))).toBe(240)

    expect(getStageCallRules(MEDIUM, stageWith([]))).toEqual({ available: true, minutes: 120, eliminates: 2 })
    expect(getStageCallRules(MEDIUM, stageWith([{ type: 'hotline' }]))).toEqual({
      available: true,
      minutes: 60,
      eliminates: 3
    })
    expect(getStageCallRules(MEDIUM, stageWith([{ type: 'badSignal' }]))).toEqual({
      available: true,
      minutes: 180,
      eliminates: 1
    })
    expect(getStageCallRules(MEDIUM, stageWith([{ type: 'linesDown' }])).available).toBe(false)

    // The variants.
    expect(getStageCallRules(MEDIUM, stageWith([{ type: 'hotline', factor: 0.25, eliminatesChange: 2 }]))).toEqual({
      available: true,
      minutes: 30,
      eliminates: 4
    })
    expect(getStageCallRules(MEDIUM, stageWith([{ type: 'hotline', factor: 0.75, eliminatesChange: 0 }]))).toEqual({
      available: true,
      minutes: 90,
      eliminates: 2
    })
    expect(getStageCallRules(MEDIUM, stageWith([{ type: 'badSignal', factor: 2, eliminatesChange: 0 }]))).toEqual({
      available: true,
      minutes: 240,
      eliminates: 2
    })
    expect(
      getStageCallRules(
        { ...MEDIUM, centralCallEliminates: 1 },
        stageWith([{ type: 'badSignal', factor: 1.25, eliminatesChange: -1 }])
      )
    ).toEqual({ available: true, minutes: 150, eliminates: 1 })
  })

  it('changes the trip out of a stage as its flight events say', () => {
    expect(getStageFlightMinutes(stageWith([]))).toBe(0)
    expect(getStageFlightMinutes(stageWith([{ type: 'delayedFlight' }]))).toBe(90)
    expect(getStageFlightMinutes(stageWith([{ type: 'directFlight' }]))).toBe(-90)
    expect(getStageFlightMinutes(stageWith([{ type: 'delayedFlight', minutes: 30 }]))).toBe(30)
    expect(getStageFlightMinutes(stageWith([{ type: 'directFlight', minutes: 120 }]))).toBe(-120)
  })

  it('rules out the destinations of a ruledOut event, old ones and new ones', () => {
    const data = {
      timeLimitMinutes: 1000,
      elapsedMinutes: 0,
      stages: [
        stageWith([{ type: 'ruledOut', placeId: 7 }]),
        stageWith([{ type: 'ruledOut', count: 2, placeIds: [3, 4] }])
      ]
    } as unknown as DetectiveGameData

    revealStage(data, 1)
    revealStage(data, 2)
    expect(data.stages[0].eliminated).toEqual([7])
    expect(data.stages[1].eliminated).toEqual([3, 4])
  })

  it('counts the events of the stages reached only', () => {
    const data = {
      settings: { ...MEDIUM, difficulty: 'medium' },
      currentStage: 1,
      stages: [stageWith([{ type: 'secondChance' }]), stageWith([{ type: 'extraCall' }, { type: 'pressure' }])]
    } as unknown as DetectiveGameData

    expect(getAllowedMistakes(data)).toBe(2)
    expect(getCallsLeft(data)).toBe(1)

    data.currentStage = 2
    expect(getAllowedMistakes(data)).toBe(1)
    expect(getCallsLeft(data)).toBe(2)

    data.stages[0].calls = 1
    expect(getCallsLeft(data)).toBe(1)
  })

  it('never takes so much time that the case ends right there', () => {
    const data = {
      timeLimitMinutes: 1000,
      elapsedMinutes: 850,
      stages: [stageWith([{ type: 'lostTime', minutes: 240 }])]
    } as unknown as DetectiveGameData

    revealStage(data, 1)
    expect(data.stages[0].events![0].minutes).toBe(90)
    expect(data.timeLimitMinutes).toBe(910)
  })

  it('has a title and a text of every event in every language', () => {
    for (const locale of LOCALES) {
      const t = createTranslator(locale)

      for (const type of DETECTIVE_EVENT_TYPES) {
        for (const part of ['title', 'text']) {
          const key = `detective.events.${type}.${part}`

          expect(t(key as never), `${locale} ${key}`).not.toBe(key)
        }
      }

      for (const key of ['detective.events.talkative.textSome', 'detective.events.ruledOut.textMany']) {
        expect(t(key as never, { count: 2 }), `${locale} ${key}`).not.toBe(key)
      }
    }
  })
})

describe('evening out the events', () => {
  const STAGES = 4
  const place = (placeId: number, longitude: number) => ({
    placeId,
    placeName: `Place ${placeId}`,
    countryCode: 'XX',
    latitude: 0,
    longitude,
    panoId: `pano${placeId}`
  })
  const origin = place(0, 0)
  const destinations = Array.from({ length: STAGES }, (_, index) => place(index + 1, (index + 1) * 10))
  const stops = [origin, ...destinations]
  // The minutes of each stage on the right route, as the pace counts them.
  const stageMinutes = destinations.map(
    (destination, index) => getTravelMinutes(stops[index], destination) + MEDIUM.witnesses * MEDIUM.witnessBudgetMinutes
  )
  const total = stageMinutes.reduce((sum, minutes) => sum + minutes, 0)
  const MARGIN = 600

  /** A case at `currentStage` with `elapsedMinutes` spent, the events of the stage reached being `events`. */
  function caseAt(currentStage: number, elapsedMinutes: number, events: DetectiveEvent[] = []): DetectiveGameData {
    return {
      settings: { ...MEDIUM, difficulty: 'medium' },
      origin,
      currentStage,
      elapsedMinutes,
      timeLimitMinutes: total + MARGIN,
      stages: destinations.map((destination, index) => ({
        destination,
        options: [destination, place(100 + index * 10, 0), place(101 + index * 10, 0), place(102 + index * 10, 0)],
        witnesses: [{}, {}, {}],
        askedWitnesses: [],
        events: index === currentStage - 1 ? events.map((event) => ({ ...event })) : [],
        eliminated: [],
        calls: 0,
        travel: index < currentStage - 1 ? { correct: true } : null
      }))
    } as unknown as DetectiveGameData
  }

  /** Minutes spent on reaching `stage` having used `marginUsed` minutes of the margin so far. */
  function spentReaching(stage: number, marginUsed: number): number {
    return stageMinutes.slice(0, stage - 1).reduce((sum, minutes) => sum + minutes, 0) + marginUsed
  }

  const onPaceMargin = (stage: number) =>
    (MARGIN * stageMinutes.slice(0, stage - 1).reduce((sum, minutes) => sum + minutes, 0)) / total

  it('measures how the detective is doing with the time', () => {
    expect(getCasePace(caseAt(1, 0))).toBe(0)
    expect(getCasePace(caseAt(3, spentReaching(3, onPaceMargin(3))))).toBeCloseTo(0)
    // Not a minute of the margin spent halfway: ahead.
    expect(getCasePace(caseAt(3, spentReaching(3, 0)))).toBeGreaterThan(0.3)
    // The whole margin spent halfway: behind.
    expect(getCasePace(caseAt(3, spentReaching(3, MARGIN)))).toBeLessThan(-0.3)
    expect(getCasePace(caseAt(3, total + MARGIN * 3))).toBe(-1)
    expect(getCasePace({ ...caseAt(3, 0), timeLimitMinutes: total })).toBe(0)
  })

  it('changes nothing for a detective on pace', () => {
    const events: DetectiveEvent[] = [
      { type: 'extraTime', minutes: 120 },
      { type: 'slowWitnesses', factor: 2 }
    ]

    for (let seed = 1; seed <= 100; seed++) {
      const data = caseAt(1, 0, events)

      rebalanceStageEvents(data, 1, seededRandom(seed))
      expect(data.stages[0].events).toEqual(events)
    }
  })

  it('changes nothing in the cases created before the events were evened out', () => {
    const events: DetectiveEvent[] = [{ type: 'extraTime', minutes: 120 }, { type: 'quickWitnesses' }]

    for (let seed = 1; seed <= 100; seed++) {
      const data = caseAt(3, spentReaching(3, 0), events)

      delete (data.settings as Partial<typeof data.settings>).eventBalance
      rebalanceStageEvents(data, 3, seededRandom(seed))
      expect(data.stages[2].events).toEqual(events)
    }
  })

  it('turns good events bad for a detective ahead of time, and bad ones good for one behind', () => {
    const cases = [
      { elapsed: spentReaching(3, 0), from: true },
      { elapsed: spentReaching(3, MARGIN), from: false }
    ]

    for (const { elapsed, from } of cases) {
      let swapped = 0
      let swappable = 0

      for (let seed = 1; seed <= 400; seed++) {
        const flexible = DETECTIVE_EVENT_TYPES.filter(
          (type) => DETECTIVE_EVENTS[type].flexible && DETECTIVE_EVENTS[type].good === from
        )
        const structural = DETECTIVE_EVENT_TYPES.filter(
          (type) => !DETECTIVE_EVENTS[type].flexible && DETECTIVE_EVENTS[type].good === from
        )
        const first = flexible[seed % flexible.length]
        const second = structural[seed % structural.length]
        const data = caseAt(3, elapsed, [{ type: first }, { type: second }])

        rebalanceStageEvents(data, 3, seededRandom(seed))

        const [event, untouched] = data.stages[2].events!

        // Only the flexible ones change, and only to the other kind.
        expect(untouched.type).toBe(second)
        expect(DETECTIVE_EVENTS[event.type].flexible).toBe(true)
        expect(DETECTIVE_EVENTS[event.type].group).not.toBe(DETECTIVE_EVENTS[second].group)
        swappable++

        if (event.type !== first) {
          expect(DETECTIVE_EVENTS[event.type].good).toBe(!from)
          swapped++
        }
      }

      expect(swapped / swappable).toBeGreaterThan(0.2)
      expect(swapped / swappable).toBeLessThanOrEqual(MAX_REBALANCE_CHANCE + 0.05)
    }
  })

  it('never brings an event that would do nothing, and rules out wrong destinations of the stage', () => {
    const types = new Set<string>()

    for (let seed = 1; seed <= 400; seed++) {
      // Behind, without calls nor mistakes left: no hotline, but a ruledOut may come.
      const data = caseAt(3, spentReaching(3, MARGIN), [{ type: 'lostTime', minutes: 120 }])

      data.settings.centralCalls = 0
      data.stages[0].travel = { correct: false } as never
      rebalanceStageEvents(data, 3, seededRandom(seed))

      const [event] = data.stages[2].events!

      types.add(event.type)
      expect(event.type).not.toBe('hotline')

      if (event.type === 'ruledOut') {
        const stage = data.stages[2]
        const wrong = stage.options.filter((option) => option.placeId !== stage.destination.placeId)

        expect(event.placeIds).toHaveLength(event.count!)
        expect(event.count!).toBeLessThan(wrong.length)
        expect(event.placeIds!.every((id) => wrong.some((option) => option.placeId === id))).toBe(true)
      }
    }

    expect(types.has('ruledOut')).toBe(true)
    expect(types.has('extraCall')).toBe(true)
  })

  it('never brings pressure without mistakes left', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const data = caseAt(3, spentReaching(3, 0), [{ type: 'secondChance' }])

      data.stages[0].travel = { correct: false } as never
      data.stages[1].travel = { correct: false } as never
      rebalanceStageEvents(data, 3, seededRandom(seed))
      // Two mistakes made of the two allowed (the second chance does not count: it is the one being swapped).
      expect(data.stages[2].events![0].type).not.toBe('pressure')
    }
  })
})
