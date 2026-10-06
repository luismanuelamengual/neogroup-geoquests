import type { Messages } from '@/app/i18n/messages/es'

/** English dictionary. It must have the same shape as the Spanish one (es.ts), which the compiler checks. */
export const en: Messages = {
  common: {
    cancel: 'Cancel',
    close: 'Close',
    menu: 'Menu',
    player: 'Player',
    loading: 'Loading...',
    points: 'pts'
  },
  nav: {
    play: 'Play',
    multiplayer: 'Multiplayer',
    myGames: 'My games',
    myProfile: 'My profile',
    logout: 'Sign out'
  },
  metadata: {
    mainMenu: 'Main menu',
    multiplayer: 'Multiplayer',
    invitation: 'Invitation',
    game: 'Game',
    chooseWhere: 'Choose where to play',
    myGames: 'My games',
    verifyEmail: 'Verify your email',
    register: 'Create account',
    forgotPassword: 'Recover password',
    newPassword: 'New password',
    login: 'Sign in',
    offline: 'Offline',
    profile: 'My profile'
  },
  pwa: {
    description: 'Where are you? Explore streets of cities around the world and guess the place. Free.',
    installPrompt:
      'Install GeoQuests on your phone and play full screen, with an icon on your home screen like any other game.',
    install: 'Install',
    offlineTitle: 'No signal',
    offlineText:
      'GeoQuests needs the internet to bring you the streets of the world. Check your connection and try again.'
  },
  landing: {
    tagline: 'Where are you? Explore the streets of the world and guess the place.',
    playFree: 'Play for free',
    steps: {
      look: { title: 'Look', text: 'You land on a street somewhere in the world. Turn around, zoom in, walk.' },
      mark: { title: 'Mark', text: 'Look for clues (signs, cars, architecture) and drop your pin on the map.' },
      score: { title: 'Score', text: 'The closer you are, the more points. 5 rounds, up to 25,000 points.' }
    },
    credits: 'Street imagery © Google Street View · Maps © OpenStreetMap / OpenFreeMap'
  },
  auth: {
    email: 'Email',
    password: 'Password',
    playerName: 'Player name',
    login: {
      title: 'Sign in',
      subtitle: 'Where are you? Come in and prove it.',
      google: 'Continue with Google',
      or: 'or',
      verified: 'Your email has been verified. You can now sign in.',
      passwordReset: 'Your password has been updated. You can now sign in.',
      invalidCredentials: 'Wrong email or password (or the account has not been verified yet)',
      submit: 'Sign in',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      register: 'Sign up'
    },
    register: {
      title: 'Create account',
      verifyTitle: 'Verify your email',
      verifySent: 'We sent a verification link to {email}. Check your inbox and click it to activate your account.',
      alreadyActivated: 'Already activated it?',
      login: 'Sign in',
      passwordHint: 'At least 6 characters',
      repeatPassword: 'Repeat password',
      passwordsMismatch: "Passwords don't match",
      passwordsMismatchDot: "Passwords don't match.",
      submit: 'Create account',
      haveAccount: 'Already have an account?'
    },
    forgot: {
      title: 'Recover password',
      sent: 'If there is an account associated with {email}, you will receive an email with instructions to reset your password.',
      subtitle: "Enter your email and we'll send you a link to reset your password.",
      submit: 'Send link',
      back: 'Back to sign in'
    },
    reset: {
      title: 'New password',
      newPassword: 'New password',
      confirmPassword: 'Confirm password',
      submit: 'Save password',
      requestNew: 'Request a new link'
    },
    verify: {
      expiredTitle: 'Link expired',
      expiredText:
        'The verification link has expired. Sign up again with the same email and we will send you a new one.',
      invalidTitle: 'Invalid link',
      invalidText: 'The verification link is not valid or has already been used.',
      title: 'Verify your email',
      text: 'Check your inbox and click the verification link to activate your account.',
      registerAgain: 'Sign up again'
    },
    resetInvalid: 'The link is not valid or has already been used.',
    goToLogin: 'Go to sign in',
    somethingWentWrong: 'Something went wrong. Please try again.',
    emails: {
      verifySubject: 'Activate your GeoQuests account',
      resetSubject: 'Reset your GeoQuests password',
      greeting: 'Hi {name}!',
      verifyIntro: 'Thanks for joining GeoQuests. To activate your account and start playing, verify your email:',
      verifyAction: 'Verify my email',
      verifyFooter: "The link is valid for {hours} hours. If you didn't create this account, ignore this message.",
      resetIntro: 'We received a request to reset the password of your GeoQuests account.',
      resetAction: 'Reset password',
      resetFooter: "The link is valid for {hours} hour. If you didn't request this change, ignore this message."
    }
  },
  account: {
    profile: 'My profile',
    playerNameTitle: 'Player name',
    save: 'Save',
    saved: 'Profile updated!',
    languageLabel: 'App language'
  },
  home: {
    greeting: 'Hi, {name}!',
    title: 'How do you want to play?',
    noModes: 'There are no game modes available yet.',
    subtitle: 'Single player: play solo, at your own pace.',
    modesTitle: 'Game modes',
    quickPlaysTitle: 'Quick classic game',
    quickPlaysSubtitle: 'They start right away, with the rules already set.',
    playNow: 'Play now',
    customClassic: {
      name: 'Classic game',
      description: 'Choose the map, the number of rounds and the time per round, and play solo, at your own pace.'
    }
  },
  multiplayerMenu: {
    greeting: 'Multiplayer',
    title: 'Play with your friends',
    subtitle: 'Everybody on the same streets, at the same time.',
    joinTitle: 'Were you invited to a game?',
    joinText: 'Enter the code you were given and join the room.',
    createTitle: 'Create your own room'
  },
  modes: {
    classic: {
      name: 'Classic',
      description:
        'Play solo, at your own pace: you land on a street somewhere in the world and have to guess where you are.'
    },
    friends: {
      name: 'Classic game',
      description: '2 to 8 players, the same streets at the same time. Whoever gets closest wins.'
    },
    'battle-royale': {
      name: 'Battle Royale',
      description:
        '3 to 8 players: after every set of rounds, whoever scored the fewest points is eliminated. The last one standing wins.'
    },
    detective: {
      name: 'Detective',
      description:
        'Follow a thief through iconic places of the world: talk to witnesses, choose where to travel and, in the end, point at the thief among the suspects before time runs out.'
    },
    onePlayer: '1 player',
    playersExact: '{count} players',
    playersRange: '{min} to {max} players',
    rounds: '{count} rounds',
    elimination: 'Elimination',
    eliminationEvery: 'Elimination every {count} rounds',
    timePerRound: '{time} per round',
    noTime: 'No time limit',
    configurable: 'Custom rules',
    fixedRules: 'Fixed rules',
    destinations: { one: '{count} destination', other: '{count} destinations' },
    choose: 'Choose'
  },
  maps: {
    'famous-cities': {
      name: 'Famous cities',
      description:
        'You land on a street in one of the 20 best known cities in the world. Do you know which one it is and where you are?'
    },
    'world-cities': {
      name: 'Cities of the world',
      description: '150 cities in 36 countries: capitals, but also medium and small cities. Can you recognize them?'
    },
    landmarks: {
      name: 'Iconic places',
      description:
        'You land next to a monument, a natural wonder or a famous sight: from the Colosseum to Machu Picchu, from the Eiffel Tower to Uluru. Over 500 places around the world, so they never repeat.'
    },
    argentina: {
      name: 'Argentina',
      description: 'You land anywhere in mainland Argentina, from the Puna to Santa Cruz. Where are you?'
    },
    spain: {
      name: 'Spain',
      description: 'You land anywhere in peninsular Spain, from Galicia to Andalusia. Where are you?'
    },
    'united-states': {
      name: 'United States',
      description: 'You land anywhere in the 48 contiguous states of the United States. Where are you?'
    },
    'latin-america': {
      name: 'Latin America',
      description:
        'From Mexico to Ushuaia: over 100 Latin American cities, from big capitals to small towns. Can you tell where you are?'
    },
    europe: {
      name: 'Europe',
      description:
        'Over 200 European cities, from Reykjavik to Athens and from Lisbon to Moscow: capitals, but also medium and small cities. Are you up for it?'
    }
  },
  picker: {
    chooseWhere: 'Choose where to play',
    rules: 'Game rules',
    rounds: 'Rounds',
    roundsPerElimination: 'Rounds per elimination',
    timePerRound: 'Time per round',
    noMaps: 'There are no maps to play yet.',
    places: { one: '{count} place', other: '{count} places' },
    createRoom: 'Create room',
    play: 'Play',
    preparingRoom: 'Preparing the room...',
    searchingPlaces: 'Looking for places around the world...',
    joinWithCode: 'Join with code',
    joinTitle: 'Join a game',
    codeLabel: 'Game code',
    codePlaceholder: 'E.g. K7QX2M',
    join: 'Join'
  },
  invitation: {
    title: "You're invited!",
    text: 'A friend invited you to play a game of GeoQuests.',
    join: 'Join the game',
    goToMenu: 'Go to the menu',
    joinFailed: "We couldn't add you to the game.",
    share: 'Play GeoQuests with me! Code: {code}',
    inviteFriends: 'Invite friends',
    linkCopied: 'Link copied! Send it to your friends.',
    copyFailed: "We couldn't copy the link. The game code is {code}."
  },
  game: {
    activeLobby: "You're in a room waiting to play with friends.",
    activeInProgress: 'You have a game with friends in progress.',
    back: 'Back',
    backToMenu: 'Back to the menu',
    removedFromGame: "You're no longer part of this game.",
    loadFailed: "We couldn't load the game.",
    modeUnavailable: 'This game mode is not available yet.',
    preparing: 'Preparing the game...',
    round: 'Round',
    roundNumber: 'Round {number}',
    roundOf: 'Round {number} of {total}',
    points: 'Points',
    remaining: 'Left',
    exit: 'Exit',
    exitAria: 'Exit the game',
    exitTitle: 'Exit the game?',
    keepPlaying: 'Keep playing',
    exitDefault:
      'The game is saved: you can resume it from the main menu. If the round is timed, the clock keeps running.',
    exitMultiplayer:
      "If you exit, you abandon the game: your points stay in the results, but you won't be able to rejoin.",
    exitEliminated: "You're already eliminated: if you exit, you stop watching the game.",
    exitBattleRoyale: 'If you exit, you abandon the game and are eliminated.',
    musicOff: 'Turn the music off',
    musicOn: 'Turn the music on',
    whereAreYou: 'Where are you?',
    closeMap: 'Close map',
    guess: 'Guess!',
    markAPoint: 'Drop a pin on the map',
    guessShort: 'Guess',
    map: 'Map',
    streetViewKey: 'Set {key} to see the imagery.',
    guessedTitle: '{name}: already answered',
    ready: 'Done! Waiting for the others…',
    eliminatedTitle: "You've been eliminated",
    eliminatedText: 'You keep watching the game until only one player is left.',
    gameOver: 'Game over!',
    yourAnswers: 'Your answers',
    rounds: 'Rounds',
    total: 'Total',
    playAgain: 'Play again',
    anotherWithFriends: 'Another with friends',
    anotherGame: 'Another game',
    menu: 'Menu',
    noAnswerTimeUp: 'No answer: time ran out',
    noAnswer: 'No answer',
    nobodyAnswered: 'Nobody answered in time',
    at: '{distance} away',
    best: 'Best: {name}, {distance} away',
    fell: 'Fell: {names}',
    nobodyFell: 'Nobody fell',
    eliminatedIn: 'Eliminated in round {round}',
    stoodUp: 'Still standing',
    eliminatedBadge: 'Eliminated',
    blockProgress: 'Round {number} of {total} before the elimination',
    eliminationRound: 'Elimination round!',
    won: 'You won!',
    wonStanding: 'You won! You were the last one standing',
    draw: "It's a tie for first place!",
    finished: 'You finished {position}',
    winnerIs: '{name} won',
    left: ' (left)',
    you: ' (you)'
  },
  result: {
    timeUp: "Time's up!",
    yourMark: 'Your pin landed {distance} from the place',
    noMark: "You didn't place a pin in time",
    seeSummary: 'See summary',
    nextRound: 'Next round',
    verdicts: {
      perfect: 'PERFECT!',
      excellent: 'Excellent!',
      veryGood: 'Very good!',
      notBad: 'Not bad',
      almost: 'Almost...',
      oops: 'Oops! Way off'
    },
    results: 'Results',
    nextRoundIn: '{what} in {seconds} s',
    seeResults: 'See results',
    next: 'Next',
    nobodyEliminated: 'Nobody was eliminated',
    roundsToElimination: { one: '{count} round to the elimination', other: '{count} rounds to the elimination' },
    eliminated: { one: 'Eliminated: {names}!', other: 'Eliminated: {names}!' }
  },
  lobby: {
    title: 'Waiting room',
    rules: '{rounds} · {time} per round',
    code: 'Game code',
    players: 'Players',
    host: 'Host',
    kick: 'Remove {name}',
    start: 'Start game',
    waitingPlayers: 'Waiting for players (minimum {min})',
    waitingHost: 'Waiting for {name} to start the game…',
    theHost: 'the host',
    leave: 'Leave the room'
  },
  myGames: {
    title: 'My games',
    games: 'Games',
    bestScore: 'Best score',
    average: 'Average',
    empty: "You haven't played any games yet.",
    letsPlay: "Let's play!",
    loadMore: 'Load more',
    position: '{position} of {total}',
    stars: '{count} stars',
    resume: 'Resume ({done}/{total})',
    waitingRoom: 'In the waiting room',
    casesSolved: 'Cases solved',
    caught: 'Caught',
    escaped: 'Escaped'
  },
  time: {
    seconds: '{count} s',
    minutes: '{count} min',
    minutesSeconds: '{minutes} min {seconds} s'
  },
  detective: {
    intro: {
      subtitle: 'A new case every game',
      difficulty: 'Difficulty',
      howTo: 'How to play',
      newCase: 'New case',
      preparing: 'Preparing the case…'
    },
    difficulty: {
      easy: { name: 'Easy', summary: 'More time and more mistakes allowed' },
      medium: { name: 'Medium', summary: 'The usual challenge' },
      hard: { name: 'Hard', summary: 'More places, little room for mistakes' }
    },
    howTo: {
      eyes: 'You explore the place where you are. The thief already left: only the witnesses know where to.',
      witnesses:
        'You talk to the witnesses: each one gives you a clue about the destination, and one of them also a trait of the thief. Each witness costs you {time}.',
      travel:
        'You choose where to travel among {options} destinations. If you are wrong, you waste the trip; after more than {mistakes} mistakes, you lose the trail.',
      catch:
        'If you reach their place number {hops} in time, you have to point at the thief among {suspects} suspects: remember the traits you were told.'
    },
    briefing: {
      caseNumber: 'Case #{id}',
      title: 'Robbery at {place}',
      story:
        'On {time} someone stole {loot} at {place}. The thief escaped and will go through {hops} places of the world before vanishing forever.',
      deadline: 'You have until {time}.',
      accept: 'Accept the case'
    },
    days: {
      d0: 'Monday',
      d1: 'Tuesday',
      d2: 'Wednesday',
      d3: 'Thursday',
      d4: 'Friday',
      d5: 'Saturday',
      d6: 'Sunday'
    },
    dayTime: '{day} {time}',
    loot: {
      loot1: "an ancient queen's crown",
      loot2: 'the largest diamond of the exhibition',
      loot3: 'a 3,000-year-old golden statuette',
      loot4: "an explorer's original map",
      loot5: 'the unpublished score of a symphony',
      loot6: 'a violin over 300 years old',
      loot7: 'the golden key to the city',
      loot8: 'an imperial jade egg',
      loot9: 'the secret recipe of a famous dessert',
      loot10: "the science museum's meteorite"
    },
    play: {
      youAreIn: 'You are in',
      clock: 'Clock',
      timeLeft: 'Time left',
      destination: 'Destination',
      travel: 'Travel',
      noTime: 'No time',
      exitMessage: 'The case stays saved: you can resume it from the menu whenever you want.'
    },
    travelPanel: {
      title: 'Where did the thief go?',
      clues: 'Clues',
      noClues: "You haven't talked to any witness yet.",
      lastChance: 'Last chance: if you get it wrong, you lose the trail.',
      duration: '{time} trip',
      choose: 'Choose a destination',
      go: 'Travel to {place}',
      cancel: 'Keep investigating'
    },
    travel: {
      flying: 'Traveling to {place}…',
      correct: 'Good! The thief was here.',
      wrong: 'No trace of the thief in {place}.',
      redirect: 'An informant tells you the thief went to {place}.',
      follow: 'Follow the trail',
      continue: 'Continue',
      caught: 'You caught the thief!',
      lastStop: 'You made it in time! The thief is here, mixed in with the crowd.',
      identify: 'Identify the thief',
      escaped: 'Time is up! The thief escaped.',
      lostTrail: 'Too many mistakes: you lost the trail and the thief escaped.',
      seeSummary: 'See summary'
    },
    summary: {
      caught: 'Case solved!',
      escaped: 'The thief escaped',
      caughtText: 'You caught the thief and recovered {loot}.',
      escapedText: 'The thief got away with {loot}. Good luck on the next case!',
      lostTrail: 'You lost the trail',
      lostTrailText: 'Too many wrong destinations: the thief got away with {loot}. Good luck on the next case!',
      wrongSuspect: 'It was somebody else',
      wrongSuspectText:
        'You made it in time, but you accused the wrong person: the thief got away with {loot}. Good luck on the next case!',
      thiefWas: 'The thief was',
      nextDifficulty: 'Difficulty of the next case',
      timeUsed: 'Time used',
      witnesses: 'Witnesses',
      mistakes: 'Mistakes',
      route: "The thief's route",
      stages: 'Destinations',
      right: 'Right ({time} trip)',
      wrongTo: 'You went to {place} ({time} lost)',
      notReached: 'Not reached'
    },
    roles: {
      waiter: { m: 'Waiter', f: 'Waitress' },
      guide: { m: 'Tour guide', f: 'Tour guide' },
      police: { m: 'Police officer', f: 'Police officer' },
      vendor: { m: 'Street vendor', f: 'Street vendor' },
      taxiDriver: { m: 'Taxi driver', f: 'Taxi driver' },
      tourist: { m: 'Tourist', f: 'Tourist' },
      backpacker: { m: 'Backpacker', f: 'Backpacker' }
    },
    witness: {
      intro1: 'Yes, I saw that person!',
      intro2: 'Hmm… I remember well.',
      intro3: 'They came by a while ago.',
      intro4: 'Sure, they looked very suspicious.',
      intro5: 'They asked me a strange question…',
      intro6: 'I heard them on the phone…',
      nothingSeen: "I haven't seen anyone like that around here. Are you sure you came to the right place?",
      suspectLead: 'Oh, and one more thing: the thief {trait}.'
    },
    lineup: {
      title: 'Who is the thief?',
      subtitle: 'Remember the traits the witnesses told you and point at the thief.',
      suspect: 'Suspect {letter}',
      choose: 'Choose the thief',
      accuse: 'Accuse suspect {letter}',
      thiefTag: 'The thief',
      accusedTag: 'Your accusation',
      caughtTitle: 'You caught them!',
      caughtText: 'It was suspect {letter}. The witnesses were right.',
      wrongTitle: 'Not them!',
      wrongText: 'The thief was suspect {letter}: they took advantage of the confusion and got away.',
      seeSummary: 'See summary'
    },
    suspect: {
      clues: {
        gender: { f: 'was a woman', m: 'was a man' },
        hairColor: {
          dark: 'had dark hair',
          brown: 'had brown hair',
          red: 'had red hair',
          blond: 'had blond hair',
          grey: 'had grey hair',
          blue: 'had blue hair',
          pink: 'had pink hair'
        },
        hairStyle: {
          short: 'had short hair',
          spiky: 'had spiky hair',
          curly: 'had curly hair',
          long: 'had long hair',
          bob: 'had chin-length hair',
          bun: 'had their hair in a bun',
          ponytail: 'had a ponytail',
          mohawk: 'had a mohawk',
          buzz: 'had a shaved head',
          bald: 'was bald'
        },
        eyeColor: {
          brown: 'had brown eyes',
          green: 'had green eyes',
          blue: 'had blue eyes',
          grey: 'had grey eyes'
        },
        glasses: { none: "wasn't wearing glasses", clear: 'wore glasses', sun: 'wore sunglasses' },
        facialHair: {
          none: 'had no beard or mustache',
          mustache: 'had a mustache',
          beard: 'had a beard',
          goatee: 'had a goatee',
          stubble: 'had stubble'
        },
        headwear: {
          none: "wasn't wearing anything on their head",
          beret: 'wore a beret',
          cap: 'wore a cap',
          sunHat: 'wore a sun hat',
          beanie: 'wore a beanie'
        },
        freckles: { yes: 'had freckles' },
        earrings: { yes: 'wore earrings' }
      }
    },
    gallery: {
      title: 'Witnesses',
      subtitle: 'Test page: tap a witness to hear their clue.',
      reroll: 'Other witnesses'
    }
  },
  errors: {
    internal: 'Internal error',
    notAuthenticated: 'User not authenticated',
    unauthorized: 'Unauthorized',
    playerNameRequired: 'Choose a player name',
    playerNameTooLong: 'The player name can have up to 40 characters',
    invalidLocale: 'Invalid language',
    invalidPosition: 'Invalid position',
    gameModeUnavailable: 'Game mode not available',
    notPlayingThisRound: "You're not playing this round",
    roundAlreadyOver: 'That round is already over',
    roundNotStarted: "The round hasn't started yet",
    roundAlreadyAnswered: "You've already answered this round",
    gameNotFound: 'Game not found',
    gameBusy: 'There is a lot of activity in this game: try again',
    gameCreationFailed: "We couldn't create the game. Try again.",
    mapNotFound: 'Map not found',
    alreadyInMultiplayerGame: "You're already in another game with friends",
    invalidAction: 'Invalid action',
    gameAlreadyOver: 'The game is already over',
    gameNotStarted: "The game hasn't started yet",
    gameCodeNotFound: "We couldn't find a game with that code",
    gameAlreadyStartedJoin: 'That game has already started',
    gameFull: 'The game is full',
    gameCannotBeAbandoned: 'This game cannot be abandoned',
    onlyHostCanKick: 'Only the host can remove players',
    kickOnlyBeforeStart: 'Players can only be removed before the game starts',
    cannotKickYourself: "You can't remove yourself: leave the game instead",
    playerNotInGame: "That player isn't in the game",
    gameAlreadyStarted: 'The game has already started',
    onlyHostCanStart: 'Only the host can start the game',
    notEnoughPlayers: 'At least {minPlayers} players are needed to start',
    onlyHostCanAdvance: 'Only the host can move on to the next round',
    roundNotFinished: "The round hasn't ended yet",
    noTimeForWitness: 'There is no time left to talk to another witness',
    roundAlreadyPlayed: 'That round has already been played',
    markAPlace: 'Drop a pin on the map',
    noPlacesLoaded: "This game mode doesn't have any places loaded yet",
    noImageryFound: "We couldn't find imagery to set up the game. Try again in a moment.",
    missingMapsApiKey: 'GOOGLE_MAPS_API_KEY is not configured on the server',
    eliminatedCannotAnswer: "You've been eliminated: you can no longer answer",
    emailRequired: 'Enter your email',
    invalidEmail: 'The email is not valid',
    passwordTooShort: 'The password must be at least {min} characters long',
    emailAlreadyRegistered: 'The email is already registered',
    fillAllFields: 'Fill in all the fields',
    linkInvalidOrUsed: 'The link is not valid or has already been used',
    linkExpired: 'The link has expired. Request a new one'
  }
}
