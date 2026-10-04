/**
 * Spanish dictionary — the default language and the reference of the others
 * (see en.ts, whose shape must match this one). Keys are grouped by feature.
 * `{name}` placeholders are replaced by the params of `t(key, params)`; a
 * `{ one, other }` message is a plural chosen with `params.count`.
 */
export const es = {
  common: {
    cancel: 'Cancelar',
    close: 'Cerrar',
    menu: 'Menú',
    player: 'Jugador',
    loading: 'Cargando...',
    points: 'pts'
  },
  nav: {
    play: 'Jugar',
    multiplayer: 'Multijugador',
    myGames: 'Mis partidas',
    myProfile: 'Mi perfil',
    logout: 'Cerrar sesión'
  },
  metadata: {
    mainMenu: 'Menú principal',
    multiplayer: 'Multijugador',
    invitation: 'Invitación',
    game: 'Partida',
    chooseWhere: 'Elegí dónde jugar',
    myGames: 'Mis partidas',
    verifyEmail: 'Verificá tu email',
    register: 'Crear cuenta',
    forgotPassword: 'Recuperar contraseña',
    newPassword: 'Nueva contraseña',
    login: 'Ingresar',
    offline: 'Sin conexión',
    profile: 'Mi perfil'
  },
  pwa: {
    description: '¿Dónde estás? Explorá calles de ciudades del mundo y adiviná el lugar. Gratis.',
    installPrompt:
      'Instalá GeoQuests en tu celular y jugá en pantalla completa, con un ícono en tu pantalla de inicio como cualquier otro juego.',
    install: 'Instalar',
    offlineTitle: 'Sin señal',
    offlineText: 'GeoQuests necesita internet para traer las calles del mundo. Revisá tu conexión y volvé a intentarlo.'
  },
  landing: {
    tagline: '¿Dónde estás? Explorá las calles del mundo y adiviná el lugar.',
    playFree: 'Jugar gratis',
    steps: {
      look: { title: 'Mirá', text: 'Aparecés en una calle de algún lugar del mundo. Girá, acercate, caminá.' },
      mark: { title: 'Marcá', text: 'Buscá pistas (carteles, autos, arquitectura) y poné tu pin en el mapa.' },
      score: { title: 'Sumá', text: 'Cuanto más cerca, más puntos. 5 rondas, hasta 25.000 puntos.' }
    },
    credits: 'Imágenes de calles © Google Street View · Mapas © OpenStreetMap / OpenFreeMap'
  },
  auth: {
    email: 'Email',
    password: 'Contraseña',
    playerName: 'Nombre de jugador',
    login: {
      title: 'Iniciar sesión',
      subtitle: '¿Dónde estás? Entrá y demostralo.',
      google: 'Continuar con Google',
      or: 'o',
      verified: 'Tu email fue verificado. Ya podés iniciar sesión.',
      passwordReset: 'Tu contraseña fue actualizada. Ya podés iniciar sesión.',
      invalidCredentials: 'Email o contraseña incorrectos (o la cuenta todavía no fue verificada)',
      submit: 'Ingresar',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tenés cuenta?',
      register: 'Registrate'
    },
    register: {
      title: 'Crear cuenta',
      verifyTitle: 'Verificá tu email',
      verifySent:
        'Te enviamos un enlace de verificación a {email}. Revisá tu bandeja de entrada y hacé clic para activar tu cuenta.',
      alreadyActivated: '¿Ya la activaste?',
      login: 'Ingresar',
      passwordHint: 'Mínimo 6 caracteres',
      repeatPassword: 'Repetir contraseña',
      passwordsMismatch: 'Las contraseñas no coinciden',
      passwordsMismatchDot: 'Las contraseñas no coinciden.',
      submit: 'Crear cuenta',
      haveAccount: '¿Ya tenés cuenta?'
    },
    forgot: {
      title: 'Recuperar contraseña',
      sent: 'Si existe una cuenta asociada a {email}, vas a recibir un correo con instrucciones para restablecer tu contraseña.',
      subtitle: 'Ingresá tu email y te enviamos un enlace para restablecer tu contraseña.',
      submit: 'Enviar enlace',
      back: 'Volver a ingresar'
    },
    reset: {
      title: 'Nueva contraseña',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar contraseña',
      submit: 'Guardar contraseña',
      requestNew: 'Pedir un enlace nuevo'
    },
    verify: {
      expiredTitle: 'Enlace vencido',
      expiredText:
        'El enlace de verificación expiró. Registrate nuevamente con el mismo email y te mandamos uno nuevo.',
      invalidTitle: 'Enlace inválido',
      invalidText: 'El enlace de verificación no es válido o ya fue utilizado.',
      title: 'Verificá tu email',
      text: 'Revisá tu bandeja de entrada y hacé clic en el enlace de verificación para activar tu cuenta.',
      registerAgain: 'Registrarme de nuevo'
    },
    resetInvalid: 'El enlace no es válido o ya fue utilizado.',
    goToLogin: 'Ir a ingresar',
    somethingWentWrong: 'Algo salió mal. Intentá de nuevo.',
    emails: {
      verifySubject: 'Activá tu cuenta de GeoQuests',
      resetSubject: 'Restablecer tu contraseña de GeoQuests',
      greeting: '¡Hola {name}!',
      verifyIntro: 'Gracias por sumarte a GeoQuests. Para activar tu cuenta y empezar a jugar, verificá tu email:',
      verifyAction: 'Verificar mi email',
      verifyFooter: 'El enlace es válido por {hours} horas. Si no creaste esta cuenta, ignorá este mensaje.',
      resetIntro: 'Recibimos una solicitud para restablecer la contraseña de tu cuenta de GeoQuests.',
      resetAction: 'Restablecer contraseña',
      resetFooter: 'El enlace es válido por {hours} hora. Si no pediste este cambio, ignorá este mensaje.'
    }
  },
  account: {
    profile: 'Mi perfil',
    playerNameTitle: 'Nombre de jugador',
    save: 'Guardar',
    saved: '¡Perfil actualizado!',
    languageLabel: 'Idioma de la aplicación'
  },
  home: {
    greeting: '¡Hola, {name}!',
    title: '¿Cómo querés jugar?',
    noModes: 'Todavía no hay modos de juego disponibles.',
    subtitle: 'Un jugador: jugá solo, a tu ritmo.',
    modesTitle: 'Modos de juego',
    quickPlaysTitle: 'Partida rápida',
    quickPlaysSubtitle: 'Arrancan al toque, con las reglas ya elegidas.',
    playNow: 'Jugar ya',
    customClassic: {
      name: 'Partida clásica',
      description: 'Elegí el mapa, la cantidad de rondas y el tiempo por ronda, y jugá solo, a tu ritmo.'
    }
  },
  multiplayerMenu: {
    greeting: 'Multijugador',
    title: 'Jugá con tus amigos',
    subtitle: 'Todos las mismas calles, al mismo tiempo.',
    joinTitle: '¿Te invitaron a una partida?',
    joinText: 'Ingresá el código que te pasaron y entrá a la sala.',
    createTitle: 'Creá tu propia sala'
  },
  modes: {
    classic: {
      name: 'Clásico',
      description: 'Jugá solo, a tu ritmo: aparecés en una calle del mundo y tenés que adivinar dónde estás.'
    },
    friends: {
      name: 'Partida Clásica',
      description: 'De 2 a 8 jugadores, las mismas calles al mismo tiempo. Gana el que más se acerque.'
    },
    'battle-royale': {
      name: 'Battle Royale',
      description: 'De 3 a 8 jugadores: en cada ronda queda eliminado el que marcó más lejos. El último en pie gana.'
    },
    detective: {
      name: 'Detective',
      description:
        'Seguí el rastro de un ladrón por cinco lugares icónicos del mundo: hablá con testigos, elegí a dónde viajar y atrapalo antes de que se acabe el tiempo.'
    },
    onePlayer: '1 jugador',
    playersExact: '{count} jugadores',
    playersRange: '{min} a {max} jugadores',
    rounds: '{count} rondas',
    elimination: 'Eliminación',
    timePerRound: '{time} por ronda',
    noTime: 'Sin tiempo',
    configurable: 'Reglas a elección',
    fixedRules: 'Reglas fijas',
    destinations: { one: '{count} destino', other: '{count} destinos' },
    choose: 'Elegir'
  },
  maps: {
    'ciudades-famosas': {
      name: 'Ciudades famosas',
      description:
        'Aparecés en una calle de una de las 20 ciudades más conocidas del mundo. ¿Sabés cuál es y dónde estás?'
    },
    'ciudades-del-mundo': {
      name: 'Ciudades del mundo',
      description:
        '150 ciudades de 36 países: capitales, pero también ciudades medianas y chicas. ¿Te animás a reconocerlas?'
    },
    'lugares-iconicos': {
      name: 'Lugares icónicos',
      description:
        'Aparecés junto a un monumento, una maravilla natural o un sitio famoso: del Coliseo a Machu Picchu, de la Torre Eiffel a Uluru. Más de 500 lugares en todo el mundo, así que no se repiten.'
    },
    argentina: {
      name: 'Argentina',
      description: 'Aparecés en cualquier lugar de la Argentina continental, de la Puna a Santa Cruz. ¿Dónde estás?'
    },
    espana: {
      name: 'España',
      description: 'Aparecés en cualquier lugar de la España peninsular, de Galicia a Andalucía. ¿Dónde estás?'
    },
    'estados-unidos': {
      name: 'Estados Unidos',
      description: 'Aparecés en cualquier lugar de los 48 estados continentales de Estados Unidos. ¿Dónde estás?'
    },
    latinoamerica: {
      name: 'Latinoamérica',
      description:
        'De México a Ushuaia: más de 100 ciudades latinoamericanas, desde las grandes capitales hasta pueblos chicos. ¿Reconocés dónde estás?'
    },
    europa: {
      name: 'Europa',
      description:
        'Más de 200 ciudades europeas, de Reikiavik a Atenas y de Lisboa a Moscú: capitales, pero también ciudades medianas y chicas. ¿Te animás?'
    }
  },
  picker: {
    chooseWhere: 'Elegí dónde jugar',
    rules: 'Reglas de la partida',
    rounds: 'Rondas',
    timePerRound: 'Tiempo por ronda',
    noMaps: 'Todavía no hay mapas para jugar.',
    places: { one: '{count} lugar', other: '{count} lugares' },
    createRoom: 'Crear sala',
    play: 'Jugar',
    preparingRoom: 'Preparando la sala...',
    searchingPlaces: 'Buscando lugares por el mundo...',
    joinWithCode: 'Unirme con código',
    joinTitle: 'Unirme a una partida',
    codeLabel: 'Código de la partida',
    codePlaceholder: 'Ej: K7QX2M',
    join: 'Unirme'
  },
  invitation: {
    title: '¡Te invitaron!',
    text: 'Un amigo te invitó a jugar una partida de GeoQuests.',
    join: 'Unirme a la partida',
    goToMenu: 'Ir al menú',
    joinFailed: 'No pudimos unirte a la partida.',
    share: '¡Jugá conmigo a GeoQuests! Código: {code}',
    inviteFriends: 'Invitar amigos',
    linkCopied: '¡Link copiado! Pasáselo a tus amigos.',
    copyFailed: 'No pudimos copiar el link. El código de la partida es {code}.'
  },
  game: {
    activeLobby: 'Estás en una sala esperando para jugar con amigos.',
    activeInProgress: 'Tenés una partida con amigos en curso.',
    back: 'Volver',
    backToMenu: 'Volver al menú',
    removedFromGame: 'Ya no formás parte de esta partida.',
    loadFailed: 'No pudimos cargar la partida.',
    modeUnavailable: 'Este modo de juego todavía no está disponible.',
    preparing: 'Preparando la partida...',
    round: 'Ronda',
    roundNumber: 'Ronda {number}',
    roundOf: 'Ronda {number} de {total}',
    points: 'Puntos',
    remaining: 'Quedan',
    exit: 'Salir',
    exitAria: 'Salir de la partida',
    exitTitle: '¿Salir de la partida?',
    keepPlaying: 'Seguir jugando',
    exitDefault:
      'La partida queda guardada: podés retomarla desde el menú principal. Si la ronda tiene tiempo, el reloj sigue corriendo.',
    exitMultiplayer:
      'Si salís, abandonás la partida: tus puntos quedan en los resultados, pero no vas a poder volver a entrar.',
    exitEliminated: 'Ya quedaste eliminado: si salís, dejás de mirar la partida.',
    exitBattleRoyale: 'Si salís, abandonás la partida y quedás eliminado.',
    musicOff: 'Apagar la música',
    musicOn: 'Prender la música',
    whereAreYou: '¿Dónde estás?',
    closeMap: 'Cerrar mapa',
    guess: '¡Adivinar!',
    markAPoint: 'Marcá un punto en el mapa',
    guessShort: 'Adivinar',
    map: 'Mapa',
    streetViewKey: 'Falta configurar {key} para ver las imágenes.',
    guessedTitle: '{name}: ya respondió',
    ready: '¡Listo! Esperando a los demás…',
    eliminatedTitle: 'Quedaste eliminado',
    eliminatedText: 'Seguís mirando la partida hasta que quede uno solo.',
    gameOver: '¡Partida terminada!',
    yourAnswers: 'Tus respuestas',
    rounds: 'Rondas',
    total: 'Total',
    playAgain: 'Jugar de nuevo',
    anotherWithFriends: 'Otra con amigos',
    anotherGame: 'Otra partida',
    menu: 'Menú',
    noAnswerTimeUp: 'Sin respuesta: se acabó el tiempo',
    noAnswer: 'Sin respuesta',
    nobodyAnswered: 'Nadie respondió a tiempo',
    at: 'a {distance}',
    best: 'Mejor: {name} a {distance}',
    fell: 'Cayó: {names}',
    nobodyFell: 'Nadie cayó',
    eliminatedIn: 'Eliminado en la ronda {round}',
    stoodUp: 'Quedó en pie',
    eliminatedBadge: 'Eliminado',
    won: '¡Ganaste!',
    wonStanding: '¡Ganaste! Quedaste en pie',
    draw: '¡Empate en el primer puesto!',
    finished: 'Terminaste {position}',
    winnerIs: 'Ganó {name}',
    left: ' (se fue)',
    you: ' (vos)'
  },
  result: {
    timeUp: '¡Se acabó el tiempo!',
    yourMark: 'Tu marca quedó a {distance} del lugar',
    noMark: 'No llegaste a marcar un lugar a tiempo',
    seeSummary: 'Ver resumen',
    nextRound: 'Siguiente ronda',
    verdicts: {
      perfect: '¡PERFECTO!',
      excellent: '¡Excelente!',
      veryGood: '¡Muy bien!',
      notBad: 'Nada mal',
      almost: 'Casi...',
      oops: '¡Ups! Muy lejos'
    },
    results: 'Resultados',
    nextRoundIn: '{what} en {seconds} s',
    seeResults: 'Ver resultados',
    next: 'Siguiente',
    nobodyEliminated: 'Nadie quedó eliminado',
    eliminated: { one: '¡Eliminado: {names}!', other: '¡Eliminados: {names}!' }
  },
  lobby: {
    title: 'Sala de espera',
    rules: '{rounds} · {time} por ronda',
    code: 'Código de la partida',
    players: 'Jugadores',
    host: 'Anfitrión',
    kick: 'Sacar a {name}',
    start: 'Empezar partida',
    waitingPlayers: 'Esperando jugadores (mínimo {min})',
    waitingHost: 'Esperando a que {name} empiece la partida…',
    theHost: 'el anfitrión',
    leave: 'Salir de la sala'
  },
  myGames: {
    title: 'Mis partidas',
    games: 'Partidas',
    bestScore: 'Mejor puntaje',
    average: 'Promedio',
    empty: 'Todavía no jugaste ninguna partida.',
    letsPlay: '¡A jugar!',
    loadMore: 'Cargar más',
    position: '{position} de {total}',
    stars: '{count} estrellas',
    resume: 'Seguir ({done}/{total})',
    waitingRoom: 'En sala de espera'
  },
  time: {
    seconds: '{count} s',
    minutes: '{count} min',
    minutesSeconds: '{minutes} min {seconds} s'
  },
  detective: {
    intro: {
      subtitle: 'Un caso nuevo en cada partida',
      howTo: 'Cómo se juega',
      newCase: 'Nuevo caso',
      preparing: 'Armando el caso…'
    },
    howTo: {
      eyes: 'Mirás a través de los ojos del ladrón: ves dónde está ahora.',
      witnesses: 'Hablás con los testigos del lugar: cada uno te da una pista, pero te cuesta {time}.',
      travel:
        'Elegís a dónde viajar entre {options} destinos. Si te equivocás, perdés el viaje; con más de {mistakes} errores, perdés el rastro.',
      catch: 'Lo atrapás si llegás a su lugar número {hops} antes de que se acabe el tiempo.'
    },
    briefing: {
      caseNumber: 'Caso #{id}',
      title: 'Robo en {place}',
      story:
        'Hoy a las 9:00 se robaron {loot} en {place}. El ladrón escapó y va a pasar por {hops} lugares del mundo antes de desaparecer para siempre.',
      deadline: 'Tenés tiempo hasta el {time}.',
      accept: 'Aceptar caso'
    },
    days: {
      d0: 'lunes',
      d1: 'martes',
      d2: 'miércoles',
      d3: 'jueves',
      d4: 'viernes',
      d5: 'sábado',
      d6: 'domingo'
    },
    dayTime: '{day} {time}',
    loot: {
      loot1: 'la corona de una reina antigua',
      loot2: 'el diamante más grande de la exposición',
      loot3: 'una estatuilla de oro de 3000 años',
      loot4: 'el mapa original de un explorador',
      loot5: 'la partitura inédita de una sinfonía',
      loot6: 'un violín de más de 300 años',
      loot7: 'la llave dorada de la ciudad',
      loot8: 'un huevo de jade imperial',
      loot9: 'la receta secreta de un postre famoso',
      loot10: 'el meteorito del museo de ciencias'
    },
    play: {
      thiefEyes: 'Lo que ve el ladrón',
      youAreIn: 'Estás en',
      clock: 'Reloj',
      timeLeft: 'Te quedan',
      destination: 'Destino',
      travel: 'Viajar',
      noTime: 'Sin tiempo',
      mistakes: 'Errores',
      exitMessage: 'El caso queda guardado: podés retomarlo cuando quieras desde el menú.'
    },
    travelPanel: {
      title: '¿A dónde fue el ladrón?',
      clues: 'Pistas',
      noClues: 'Todavía no hablaste con ningún testigo.',
      lastChance: 'Último intento: si te equivocás, perdés el rastro.',
      duration: '{time} de viaje',
      choose: 'Elegí un destino',
      go: 'Viajar a {place}',
      cancel: 'Seguir investigando'
    },
    travel: {
      flying: 'Viajando a {place}…',
      correct: '¡Bien! El ladrón estuvo acá.',
      wrong: 'No hay rastro del ladrón en {place}.',
      redirect: 'Un informante te dice que el ladrón fue a {place}.',
      follow: 'Seguir el rastro',
      continue: 'Continuar',
      caught: '¡Lo atrapaste!',
      escaped: '¡Se acabó el tiempo! El ladrón escapó.',
      lostTrail: 'Fueron demasiados errores: perdiste el rastro y el ladrón escapó.',
      seeSummary: 'Ver resumen'
    },
    summary: {
      caught: '¡Caso resuelto!',
      escaped: 'El ladrón escapó',
      caughtText: 'Atrapaste al ladrón y recuperaste {loot}.',
      escapedText: 'El ladrón se escapó con {loot}. ¡Suerte en el próximo caso!',
      lostTrail: 'Perdiste el rastro',
      lostTrailText: 'Demasiados destinos equivocados: el ladrón se escapó con {loot}. ¡Suerte en el próximo caso!',
      timeUsed: 'Tiempo usado',
      witnesses: 'Testigos',
      mistakes: 'Errores',
      route: 'La ruta del ladrón',
      stages: 'Destinos',
      right: 'Acertaste ({time} de viaje)',
      wrongTo: 'Fuiste a {place} ({time} perdidas)',
      notReached: 'No llegaste'
    },
    roles: {
      waiter: { m: 'Camarero', f: 'Camarera' },
      guide: { m: 'Guía turístico', f: 'Guía turística' },
      police: { m: 'Policía', f: 'Policía' },
      vendor: { m: 'Vendedor', f: 'Vendedora' },
      taxiDriver: { m: 'Taxista', f: 'Taxista' },
      tourist: { m: 'Turista', f: 'Turista' },
      backpacker: { m: 'Mochilero', f: 'Mochilera' }
    },
    witness: {
      intro1: '¡Sí, vi a esa persona!',
      intro2: 'Mmm… me acuerdo bien.',
      intro3: 'Pasó por acá hace un rato.',
      intro4: 'Claro, era muy sospechosa.',
      intro5: 'Me hizo una pregunta rara…',
      intro6: 'La escuché hablar por teléfono…',
      nothingSeen: 'No vi a nadie así por acá. ¿Seguro que viniste al lugar correcto?'
    },
    gallery: {
      title: 'Testigos',
      subtitle: 'Página de prueba: tocá un testigo para escuchar su pista.',
      reroll: 'Otros testigos'
    }
  },
  errors: {
    internal: 'Error interno',
    notAuthenticated: 'Usuario no autenticado',
    unauthorized: 'No autorizado',
    playerNameRequired: 'Elegí un nombre de jugador',
    playerNameTooLong: 'El nombre de jugador puede tener hasta 40 caracteres',
    invalidLocale: 'Idioma no válido',
    invalidPosition: 'Posición inválida',
    gameModeUnavailable: 'Modo de juego no disponible',
    notPlayingThisRound: 'No estás jugando esta ronda',
    roundAlreadyOver: 'Esa ronda ya terminó',
    roundNotStarted: 'La ronda todavía no empezó',
    roundAlreadyAnswered: 'Ya respondiste esta ronda',
    gameNotFound: 'Partida no encontrada',
    gameBusy: 'Hay mucha actividad en esta partida: intentá de nuevo',
    gameCreationFailed: 'No pudimos crear la partida. Intentá de nuevo.',
    mapNotFound: 'Mapa no encontrado',
    alreadyInMultiplayerGame: 'Ya estás en otra partida con amigos',
    invalidAction: 'Acción no válida',
    gameAlreadyOver: 'La partida ya terminó',
    gameNotStarted: 'La partida todavía no empezó',
    gameCodeNotFound: 'No encontramos una partida con ese código',
    gameAlreadyStartedJoin: 'Esa partida ya empezó',
    gameFull: 'La partida está completa',
    gameCannotBeAbandoned: 'Esta partida no se puede abandonar',
    onlyHostCanKick: 'Solo el anfitrión puede sacar jugadores',
    kickOnlyBeforeStart: 'Solo se pueden sacar jugadores antes de empezar',
    cannotKickYourself: 'No podés sacarte a vos mismo: salí de la partida',
    playerNotInGame: 'Ese jugador no está en la partida',
    gameAlreadyStarted: 'La partida ya empezó',
    onlyHostCanStart: 'Solo el anfitrión puede empezar la partida',
    notEnoughPlayers: 'Hacen falta al menos {minPlayers} jugadores para empezar',
    onlyHostCanAdvance: 'Solo el anfitrión puede pasar a la siguiente ronda',
    roundNotFinished: 'La ronda todavía no terminó',
    noTimeForWitness: 'No te queda tiempo para hablar con otro testigo',
    roundAlreadyPlayed: 'Esa ronda ya fue jugada',
    markAPlace: 'Marcá un lugar en el mapa',
    noPlacesLoaded: 'Este modo de juego todavía no tiene lugares cargados',
    noImageryFound: 'No pudimos encontrar imágenes para armar la partida. Intentá de nuevo en un momento.',
    missingMapsApiKey: 'Falta configurar GOOGLE_MAPS_API_KEY en el servidor',
    eliminatedCannotAnswer: 'Quedaste eliminado: ya no podés responder',
    emailRequired: 'Ingresá tu email',
    invalidEmail: 'El email no es válido',
    passwordTooShort: 'La contraseña debe tener al menos {min} caracteres',
    emailAlreadyRegistered: 'El email ya está registrado',
    fillAllFields: 'Completá todos los campos',
    linkInvalidOrUsed: 'El enlace no es válido o ya fue utilizado',
    linkExpired: 'El enlace expiró. Pedí uno nuevo'
  }
}

export type Messages = typeof es
