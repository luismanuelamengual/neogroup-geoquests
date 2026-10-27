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
    progress: 'Mi progreso',
    play: 'Jugar',
    multiplayer: 'Multijugador',
    achievements: 'Logros',
    myProfile: 'Mi perfil',
    logout: 'Cerrar sesión'
  },
  metadata: {
    progress: 'Mi progreso',
    achievements: 'Logros',
    ranking: 'Ranking',
    mainMenu: 'Menú principal',
    multiplayer: 'Multijugador',
    invitation: 'Invitación',
    game: 'Partida',
    chooseWhere: 'Elegí dónde jugar',
    verifyEmail: 'Verificá tu email',
    register: 'Crear cuenta',
    forgotPassword: 'Recuperar contraseña',
    newPassword: 'Nueva contraseña',
    login: 'Ingresar',
    offline: 'Sin conexión',
    profile: 'Mi perfil',
    privacy: 'Política de privacidad',
    deleteAccount: 'Eliminar cuenta',
    homeTitle: 'GeoQuests: juego de geografía con calles reales del mundo',
    homeDescription:
      'Juego de geografía gratuito: aparecés en una calle real del mundo y tenés que adivinar dónde estás. Modo clásico, desafío diario, partidas con amigos, Battle Royale y Detective.',
    howToPlay: 'Cómo jugar',
    guides: 'Guías',
    about: 'Acerca de',
    contact: 'Contacto',
    terms: 'Términos de uso',
    privacyDescription:
      'Qué datos guarda GeoQuests, para qué los usa, con qué servicios los comparte y cómo podés borrarlos.',
    termsDescription:
      'Las condiciones de uso de GeoQuests: tu cuenta, el juego limpio, el contenido de terceros y la publicidad.'
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
    howToPlay: 'Cómo se juega',
    intro: {
      title: 'Un juego de geografía para descubrir el mundo',
      p1: 'GeoQuests es un juego de geografía gratuito que se juega en el navegador o en el celular. En cada ronda aparecés en una calle real de algún lugar del mundo, con imágenes de Google Street View, y tenés que descubrir dónde estás mirando a tu alrededor: los carteles, el idioma, los autos, la vegetación, la arquitectura.',
      p2: 'Podés jugar solo a tu ritmo, competir con tus amigos en tiempo real, sobrevivir en un Battle Royale o resolver casos en el modo Detective. Cada partida es distinta, y mientras jugás aprendés a reconocer países, ciudades y paisajes que quizás nunca habías visto.'
    },
    stepsTitle: 'Cómo es una ronda',
    steps: {
      look: { title: 'Mirá', text: 'Aparecés en una calle de algún lugar del mundo. Girá, acercate, caminá.' },
      mark: { title: 'Marcá', text: 'Buscá pistas (carteles, autos, arquitectura) y poné tu pin en el mapa.' },
      score: { title: 'Sumá', text: 'Cuanto más cerca, más puntos. Hasta 5.000 por ronda.' }
    },
    modesTitle: 'Modos de juego',
    modesIntro: 'Cinco formas de jugar, para un rato solo o para una noche con amigos.',
    readRules: 'Ver las reglas',
    mapsTitle: 'Mapas',
    mapsIntro: 'Elegí dónde jugar: el mundo entero, un continente o un solo país.',
    guidesTitle: 'Guías y consejos',
    guidesIntro: 'Artículos originales para aprender a leer las pistas de la calle y sumar más puntos.',
    seeAllGuides: 'Ver todas las guías',
    faqTitle: 'Preguntas frecuentes',
    faq: {
      free: {
        question: '¿GeoQuests es gratis?',
        answer:
          'Sí. Todos los modos y mapas se juegan gratis. El juego se financia con anuncios que se muestran fuera de las partidas.'
      },
      account: {
        question: '¿Necesito una cuenta?',
        answer:
          'Sí, una cuenta gratuita, con email o con Google. Así se guardan tu progreso, tu racha, tus logros y tu puesto en el ranking diario.'
      },
      devices: {
        question: '¿En qué dispositivos se puede jugar?',
        answer:
          'En cualquier navegador moderno, en la computadora, la tablet o el celular. En Android y en la mayoría de los navegadores también se puede instalar como app.'
      },
      friends: {
        question: '¿Puedo jugar con amigos?',
        answer:
          'Sí. Creás una sala, compartís el código o el link y juegan de 2 a 8 personas las mismas rondas al mismo tiempo, en la Partida Clásica o en el Battle Royale.'
      },
      learn: {
        question: '¿Sirve para aprender geografía?',
        answer:
          'Mucho. Para adivinar tenés que fijarte en idiomas, señales, climas y paisajes, y el resultado de cada ronda te muestra dónde estabas. En nuestras guías explicamos las pistas más útiles.'
      }
    },
    ctaTitle: '¿Listo para tu primera ronda?',
    ctaText: 'Creá tu cuenta gratis y empezá con el Desafío diario de hoy.',
    credits: 'Imágenes de calles © Google Street View · Mapas © OpenStreetMap / OpenFreeMap'
  },
  publicSite: {
    nav: {
      howToPlay: 'Cómo jugar',
      guides: 'Guías',
      about: 'Acerca de',
      play: 'Jugar'
    },
    footer: {
      tagline: 'Un juego de geografía para explorar las calles del mundo.',
      game: 'El juego',
      info: 'Información',
      contact: 'Contacto',
      terms: 'Términos de uso',
      privacy: 'Política de privacidad',
      deleteAccount: 'Eliminar cuenta'
    },
    language: 'Idioma',
    home: 'Inicio',
    readingTime: { one: '{count} minuto de lectura', other: '{count} minutos de lectura' },
    updatedAt: 'Actualizado el {date}',
    playThisMode: 'Jugar a este modo',
    playNow: 'Jugar ahora',
    keepReading: 'Seguí leyendo',
    readGuide: 'Leer la guía',
    allGuides: 'Todas las guías',
    allModes: 'Todos los modos'
  },
  howToPlayPage: {
    title: 'Cómo jugar a GeoQuests',
    description:
      'Las reglas de GeoQuests: cómo es una ronda, cómo se calcula el puntaje y cómo se juega cada modo, del Clásico al Detective.',
    intro:
      'GeoQuests te deja en una calle real de algún lugar del mundo y te desafía a descubrir dónde estás. Acá tenés lo básico para empezar y las reglas completas de cada modo de juego.',
    basicsTitle: 'Lo básico',
    basics: {
      look: 'Al empezar cada ronda ves una panorámica de 360° con imágenes de Google Street View. Podés girar, acercarte y caminar por la calle.',
      clues:
        'Buscá pistas: de qué lado circulan los autos, el idioma de los carteles, la forma de las señales, la vegetación y la arquitectura.',
      pin: 'Abrí el mapa, poné tu pin donde creas que estás y confirmá. Si se termina el tiempo, se envía el pin que tengas marcado.',
      score:
        'Se revela el lugar real y la distancia a tu pin. Cada ronda vale hasta 5.000 puntos: cuanto más cerca, más puntos.'
    },
    scoringTitle: 'El puntaje',
    scoringText:
      'Un pin a menos de 25 metros del lugar exacto vale los 5.000 puntos. A partir de ahí los puntos bajan de forma exponencial con la distancia: con la escala estándar, a 100 km sacás unos 3.680 puntos y a 1.000 km apenas unos 230. Por eso acertar el país y la región es lo que más suma.',
    modesTitle: 'Los modos de juego',
    progressTitle: 'Progreso, racha y logros',
    progressText:
      'Cada partida terminada te da experiencia para subir de nivel, cuenta para tu racha de días seguidos y puede desbloquear alguno de los 29 logros del juego. En la sección Ranking podés ver a los mejores del Desafío diario.'
  },
  guidesPage: {
    title: 'Guías de geografía y consejos',
    description:
      'Guías originales para aprender a reconocer países por sus calles: carteles, idiomas, paisajes, estrategia de puntaje y planes de práctica.',
    intro:
      'Aprender a ubicarte en una calle desconocida es una habilidad que se entrena. En estas guías juntamos lo que aprendimos jugando y diseñando GeoQuests: qué pistas mirar, cómo interpretarlas y cómo practicar para mejorar.'
  },
  aboutPage: {
    title: 'Acerca de GeoQuests',
    description: 'Qué es GeoQuests, quién lo hace, de dónde salen las imágenes y cómo se financia el juego.',
    intro:
      'GeoQuests es un juego de geografía gratuito que nació de una idea simple: que aprender sobre el mundo sea tan divertido como un videojuego. Te ponemos en una calle real de cualquier rincón del planeta y te desafiamos a descubrir dónde estás.',
    what: {
      title: 'Qué es',
      text: 'Un juego de navegador y de celular con cinco modos: el Clásico para jugar solo, el Desafío diario con las mismas calles para todos, la Partida Clásica con amigos, el Battle Royale y el modo Detective, en el que seguís el rastro de un ladrón por lugares icónicos del mundo. Hay mapas del mundo entero, de continentes y de países, y un sistema de niveles, rachas y logros para que siempre haya un motivo para volver.'
    },
    who: {
      title: 'Quién lo hace',
      text: 'GeoQuests es un proyecto independiente, diseñado y desarrollado por un equipo chico apasionado por la geografía y los videojuegos. Lo mantenemos activamente: agregamos mapas, modos, logros y guías nuevas, y corregimos lo que los jugadores nos cuentan.'
    },
    images: {
      title: 'De dónde salen las imágenes y los mapas',
      text: 'Las imágenes de las calles son de Google Street View y se muestran a través de las herramientas oficiales de Google. Los mapas en los que marcás tu respuesta usan datos de OpenStreetMap, con estilos de OpenFreeMap. Los lugares de cada mapa (ciudades, regiones y sitios icónicos) los seleccionamos a mano, y cada ubicación se elige al azar en cada partida.'
    },
    funding: {
      title: 'Cómo se financia',
      text: 'GeoQuests es gratis y se financia con anuncios de Google AdSense, que se muestran en páginas con contenido, como estas guías, y nunca durante una partida. Así podemos pagar el servidor y las imágenes sin cobrarles a los jugadores.'
    },
    contact: {
      title: 'Hablemos',
      text: 'Si tenés una idea, encontraste un error o querés usar GeoQuests en una clase, escribinos a {email}. Leemos todos los mensajes.'
    }
  },
  contactPage: {
    title: 'Contacto',
    description: 'Cómo comunicarte con el equipo de GeoQuests para soporte, privacidad, sugerencias o propuestas.',
    intro:
      'Nos encanta saber de los jugadores. Escribinos a {email} y te respondemos lo antes posible, normalmente en unos pocos días hábiles.',
    topicsTitle: 'Sobre qué podés escribirnos',
    topics: {
      support: 'Problemas con tu cuenta, con el inicio de sesión o con una partida.',
      bugs: 'Errores en el juego: contanos qué pasó, en qué dispositivo y, si podés, mandanos una captura.',
      ideas: 'Ideas de mapas, modos o logros nuevos.',
      privacy: 'Consultas sobre tus datos personales o pedidos de eliminación de tu cuenta.',
      education: 'Propuestas para usar GeoQuests en escuelas, clases o eventos.'
    },
    deleteTitle: 'Eliminar tu cuenta',
    deleteText:
      'Podés eliminar tu cuenta y todos tus datos vos mismo, en cualquier momento. Te explicamos cómo en la página para eliminar tu cuenta.',
    deleteLink: 'Cómo eliminar tu cuenta'
  },
  auth: {
    email: 'Email',
    password: 'Contraseña',
    playerName: 'Nombre de jugador',
    lastName: 'Apellido',
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
    lastNameTitle: 'Apellido',
    nicknameTitle: 'Apodo',
    nicknameHint: 'Si tenés apodo, se muestra en lugar de tu nombre y apellido',
    save: 'Guardar',
    saved: '¡Perfil actualizado!',
    languageLabel: 'Idioma de la aplicación',
    delete: {
      section: 'Eliminar cuenta',
      description: 'Se borran tu cuenta, tu nombre de jugador, tu email y todas tus partidas. No se puede deshacer.',
      button: 'Eliminar mi cuenta',
      title: '¿Eliminar tu cuenta?',
      warning:
        'Vas a salir de las partidas que estés jugando y se van a borrar para siempre tu cuenta y tu historial. Esto no se puede deshacer.',
      confirmWord: 'ELIMINAR',
      confirmLabel: 'Escribí {word} para confirmar',
      confirm: 'Eliminar para siempre'
    }
  },
  legal: {
    privacyLink: 'Política de privacidad',
    termsLink: 'Términos de uso',
    terms: {
      title: 'Términos de uso',
      intro:
        'Estos términos regulan el uso de GeoQuests, el juego de geografía disponible en este sitio y en su app. Al crear una cuenta o jugar, aceptás estos términos. Si no estás de acuerdo con ellos, por favor no uses el servicio.',
      service: {
        title: 'El servicio',
        text: 'GeoQuests es un juego gratuito en el que tenés que adivinar ubicaciones del mundo a partir de imágenes de calles. Podemos agregar, cambiar o quitar modos, mapas y funciones en cualquier momento para mejorar el juego.'
      },
      account: {
        title: 'Tu cuenta',
        text: 'Para jugar necesitás una cuenta. Sos responsable de mantener tu contraseña en secreto y de la actividad de tu cuenta. Tenés que darnos un email válido y no podés crear cuentas en nombre de otras personas. Podés eliminar tu cuenta cuando quieras desde Mi perfil.'
      },
      conduct: {
        title: 'Uso aceptable',
        text: 'Te pedimos que juegues limpio: no uses programas, bots ni herramientas externas para obtener las respuestas, no intentes acceder a datos de otros jugadores ni alterar el funcionamiento del juego, y no uses nombres de jugador ofensivos, discriminatorios o que suplanten a otra persona. Podemos suspender o eliminar las cuentas que no respeten estas reglas.'
      },
      content: {
        title: 'Contenido de terceros',
        text: 'Las imágenes de las calles pertenecen a Google y a sus colaboradores, y se muestran mediante Google Street View según sus condiciones de uso. Los datos de los mapas son de OpenStreetMap y sus colaboradores. Los textos, el diseño, las guías y el resto del contenido de GeoQuests son nuestros y no se pueden copiar ni reutilizar sin permiso.'
      },
      ads: {
        title: 'Publicidad',
        text: 'GeoQuests se financia con anuncios de Google AdSense. Los anuncios los elige y los sirve Google según su propia política; no somos responsables de los productos o servicios que se anuncian.'
      },
      availability: {
        title: 'Disponibilidad y responsabilidad',
        text: 'Hacemos lo posible para que el juego funcione bien y esté siempre disponible, pero se ofrece "tal como está", sin garantías. Puede haber interrupciones, errores o pérdida de partidas en curso. En la medida en que lo permita la ley, no somos responsables de daños derivados del uso del juego.'
      },
      changes: {
        title: 'Cambios y contacto',
        text: 'Podemos actualizar estos términos; cuando lo hagamos, cambiaremos la fecha de arriba. Si seguís usando GeoQuests después de un cambio, aceptás los términos nuevos. Para cualquier consulta escribinos a {email}.'
      }
    },
    updatedAt: 'Última actualización: {date}',
    privacy: {
      title: 'Política de privacidad',
      intro:
        'GeoQuests es un juego de geografía: aparecés en una calle del mundo y tenés que adivinar dónde estás. Esta política explica qué datos guardamos, para qué los usamos y cómo podés borrarlos.',
      data: {
        title: 'Qué datos guardamos',
        text: 'Al crear tu cuenta: tu email, tu nombre de jugador y tu contraseña (guardada cifrada, nunca en texto plano). Si entrás con Google, recibimos de Google tu email y tu nombre. También guardamos el idioma que elegís y tus partidas: el modo, el mapa, tus respuestas y tus puntajes.'
      },
      use: {
        title: 'Para qué los usamos',
        text: 'Solo para que el juego funcione: iniciar sesión, mostrar tu nombre a los otros jugadores de una partida, armar tu historial y tus estadísticas, y mandarte los emails de verificación de cuenta y de recuperación de contraseña. No vendemos tus datos.'
      },
      thirdParties: {
        title: 'Servicios de terceros',
        text: 'Usamos Google para el inicio de sesión con Google, las imágenes de Google Street View, los anuncios que se muestran en las guías, en algunas páginas del sitio y en los resúmenes de partida (Google AdSense, nunca durante una partida) y las estadísticas de uso de la app (Google Analytics a través de Google Tag Manager); Vercel para alojar la aplicación; un proveedor de bases de datos PostgreSQL para guardar los datos; Resend para enviar los emails; y OpenStreetMap / OpenFreeMap para los mapas. Cada uno trata los datos según su propia política de privacidad.'
      },
      storage: {
        title: 'Cookies y almacenamiento',
        text: 'Usamos una cookie para mantener tu sesión iniciada y otra para recordar tu idioma. Google AdSense usa sus propias cookies e identificadores para mostrar y medir los anuncios; podés administrar los anuncios personalizados en la configuración de anuncios de tu cuenta de Google. El almacenamiento local del navegador guarda preferencias del dispositivo, como haber cerrado el aviso de instalación.'
      },
      retention: {
        title: 'Cuánto tiempo los guardamos',
        text: 'Las partidas se borran automáticamente a los 7 días. Tu cuenta se guarda hasta que la elimines.'
      },
      deletion: {
        title: 'Cómo borrar tus datos',
        text: 'Podés eliminar tu cuenta cuando quieras desde Mi perfil → Eliminar cuenta: se borran tu cuenta y todas tus partidas en el momento. Si no podés entrar, escribinos a {email} desde el email de tu cuenta y la borramos nosotros.'
      },
      security: {
        title: 'Seguridad',
        text: 'Toda la comunicación con GeoQuests viaja cifrada (HTTPS) y las contraseñas se guardan con un hash seguro (bcrypt).'
      },
      children: {
        title: 'Menores',
        text: 'GeoQuests no está dirigido a menores de 13 años y no recolectamos a sabiendas datos de menores de esa edad. Si creés que un menor nos dio sus datos, escribinos a {email} y los borramos.'
      },
      changes: {
        title: 'Cambios y contacto',
        text: 'Si cambiamos esta política, vamos a actualizar la fecha de arriba. Para cualquier consulta sobre tus datos escribinos a {email}.'
      }
    },
    deleteAccount: {
      title: 'Eliminar tu cuenta de GeoQuests',
      intro: 'Podés eliminar tu cuenta y todos tus datos desde la app, en cualquier momento:',
      steps: {
        signIn: 'Entrá a GeoQuests con tu cuenta.',
        profile: 'Abrí el menú de tu jugador y elegí Mi perfil.',
        confirm: 'Tocá Eliminar mi cuenta y confirmá escribiendo ELIMINAR.'
      },
      whatTitle: 'Qué se borra',
      whatText:
        'Se borran en el momento y para siempre tu cuenta (email, nombre de jugador y contraseña) y todas tus partidas y estadísticas. No guardamos ninguna copia.',
      noAccessTitle: '¿No podés entrar?',
      noAccessText: 'Escribinos a {email} desde el email de tu cuenta pidiendo que la borremos y lo hacemos nosotros.',
      goToProfile: 'Ir a Mi perfil'
    }
  },
  ads: {
    label: 'Publicidad'
  },
  home: {
    greeting: '¡Hola, {name}!',
    title: '¿Cómo querés jugar?',
    noModes: 'Todavía no hay modos de juego disponibles.',
    subtitle: 'Un jugador: jugá solo, a tu ritmo.',
    modesTitle: 'Modos de juego',
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
  publicGames: {
    title: 'Partidas públicas',
    text: 'Salas abiertas esperando jugadores. Entrá a cualquiera, sin código.',
    empty: 'No hay partidas públicas esperando jugadores. ¡Creá una!',
    host: 'Creada por {name}',
    timePerRound: '{time} por ronda',
    join: 'Unirme'
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
      description:
        'De 3 a 8 jugadores: cada tanda de rondas queda eliminado el que menos puntos sumó. El último en pie gana.'
    },
    detective: {
      name: 'Detective',
      description:
        'Seguí el rastro de un ladrón por lugares icónicos del mundo: hablá con testigos, elegí a dónde viajar y, al final, señalá al ladrón entre los sospechosos antes de que se acabe el tiempo.'
    },
    onePlayer: '1 jugador',
    playersExact: '{count} jugadores',
    playersRange: '{min} a {max} jugadores',
    rounds: '{count} rondas',
    elimination: 'Eliminación',
    eliminationEvery: 'Eliminación cada {count} rondas',
    timePerRound: '{time} por ronda',
    noTime: 'Sin tiempo',
    configurable: 'Reglas a elección',
    fixedRules: 'Reglas fijas',
    destinations: { one: '{count} destino', other: '{count} destinos' },
    choose: 'Elegir'
  },
  maps: {
    'famous-cities': {
      name: 'Ciudades famosas',
      description:
        'Aparecés en una calle de una de las 20 ciudades más conocidas del mundo. ¿Sabés cuál es y dónde estás?'
    },
    'world-cities': {
      name: 'Ciudades del mundo',
      description:
        '150 ciudades de 36 países: capitales, pero también ciudades medianas y chicas. ¿Te animás a reconocerlas?'
    },
    landmarks: {
      name: 'Lugares icónicos',
      description:
        'Aparecés junto a un monumento, una maravilla natural o un sitio famoso: del Coliseo a Machu Picchu, de la Torre Eiffel a Uluru. Más de 500 lugares en todo el mundo, así que no se repiten.'
    },
    argentina: {
      name: 'Argentina',
      description: 'Aparecés en cualquier lugar de la Argentina continental, de la Puna a Santa Cruz. ¿Dónde estás?'
    },
    spain: {
      name: 'España',
      description: 'Aparecés en cualquier lugar de la España peninsular, de Galicia a Andalucía. ¿Dónde estás?'
    },
    'united-states': {
      name: 'Estados Unidos',
      description: 'Aparecés en cualquier lugar de los 48 estados continentales de Estados Unidos. ¿Dónde estás?'
    },
    'latin-america': {
      name: 'Latinoamérica',
      description:
        'De México a Ushuaia: más de 100 ciudades latinoamericanas, desde las grandes capitales hasta pueblos chicos. ¿Reconocés dónde estás?'
    },
    europe: {
      name: 'Europa',
      description:
        'Más de 200 ciudades europeas, de Reikiavik a Atenas y de Lisboa a Moscú: capitales, pero también ciudades medianas y chicas. ¿Te animás?'
    }
  },
  picker: {
    chooseWhere: 'Elegí dónde jugar',
    rules: 'Reglas de la partida',
    rounds: 'Rondas',
    roundsPerElimination: 'Cantidad de rondas por eliminación',
    timePerRound: 'Tiempo por ronda',
    noMaps: 'Todavía no hay mapas para jugar.',
    places: { one: '{count} lugar', other: '{count} lugares' },
    preparingRoom: 'Preparando la sala...',
    searchingPlaces: 'Buscando lugares por el mundo...',
    joinWithCode: 'Unirme con código',
    joinTitle: 'Unirme a una partida',
    codeLabel: 'Código de la partida',
    codePlaceholder: 'Ej: K7QX2M',
    join: 'Unirme',
    visibility: 'Partida',
    private: 'Privada',
    public: 'Pública',
    privateHint: 'Solo pueden entrar quienes tengan el código.',
    publicHint: 'Aparece en la lista de partidas públicas y cualquiera puede unirse sin código.'
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
    exitDefault: 'Si salís, la partida se cancela: no vas a poder retomarla.',
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
    skipRound: 'Pasar ronda',
    mapFrozenTitle: 'Mapa bloqueado',
    mapFrozenText: 'Saliste de la ventana en medio de la ronda, así que el mapa queda bloqueado hasta que termine.',
    mapFrozenWithGuess: 'Podés enviar el punto que ya marcaste.',
    mapFrozenWithoutGuess: 'Como no marcaste ningún punto, esta ronda vale 0 puntos.',
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
    blockProgress: 'Ronda {number} de {total} para la eliminación',
    eliminationRound: '¡Ronda de eliminación!',
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
    roundsToElimination: {
      one: 'Falta {count} ronda para la eliminación',
      other: 'Faltan {count} rondas para la eliminación'
    },
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
    leave: 'Salir de la sala',
    publicGame: 'Partida pública',
    privateGame: 'Partida privada'
  },
  stats: {
    title: 'Estadísticas',
    games: 'Partidas',
    casesSolved: 'Casos resueltos',
    bestScore: 'Mejor puntaje',
    average: 'Promedio',
    currentStreak: 'Racha actual',
    bestStreak: 'Mejor racha'
  },
  time: {
    seconds: '{count} s',
    minutes: '{count} min',
    minutesSeconds: '{minutes} min {seconds} s'
  },
  detective: {
    intro: {
      subtitle: 'Un caso nuevo en cada partida',
      difficulty: 'Elegí la dificultad',
      howTo: 'Cómo se juega',
      newCase: 'Nuevo caso',
      preparing: 'Armando el caso…'
    },
    difficulty: {
      places: '{count} lugares',
      options: '{count} destinos por viaje',
      suspects: '{count} sospechosos',
      mistakes: 'Errores permitidos: {count}',
      easy: { name: 'Fácil', summary: 'Más tiempo y más errores permitidos' },
      medium: { name: 'Medio', summary: 'El desafío de siempre' },
      hard: { name: 'Difícil', summary: 'Más lugares, poco margen de error' }
    },
    howTo: {
      eyes: 'Recorrés el lugar donde estás. El ladrón ya se fue: solo los testigos saben a dónde.',
      witnesses:
        'Hablás con los testigos del lugar: cada uno te da una pista del destino y uno de ellos, además, un rasgo del ladrón. Según su oficio, saben de geografía (taxistas, mochileros, policías), de costumbres (camareros, vendedores) o de historia (guías, turistas). Cada testigo te cuesta {time}.',
      travel:
        'Elegís a dónde viajar entre {options} destinos. Si te equivocás, perdés el viaje; con más de {mistakes} errores, perdés el rastro.',
      call: {
        one: 'Si estás trabado, podés llamar a la central: descarta {eliminates} destinos equivocados a cambio de {time}. Tenés {count} llamada por caso.',
        other:
          'Si estás trabado, podés llamar a la central: descarta {eliminates} destinos equivocados a cambio de {time}. Tenés {count} llamadas por caso.'
      },
      events:
        'Al llegar a cada lugar puede pasar algo imprevisto, bueno o malo: más o menos testigos, tiempo, destinos o sospechosos… ¡estate atento!',
      catch:
        'Si llegás a su lugar número {hops} a tiempo, tenés que señalar al ladrón entre {suspects} sospechosos: acordate de los rasgos que te contaron.'
    },
    briefing: {
      newCase: 'Nuevo caso',
      case: 'Caso',
      title: 'Robo en {place}',
      story:
        'El {time} se robaron {loot} en {place}. El ladrón escapó y va a pasar por {hops} lugares del mundo antes de desaparecer para siempre.',
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
      youAreIn: 'Estás en',
      clock: 'Reloj',
      timeLeft: 'Te quedan',
      destination: 'Destino',
      travel: 'Viajar',
      noTime: 'Sin tiempo',
      exitMessage: 'Si salís, el caso se cancela: no vas a poder retomarlo.'
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
      lastStop: '¡Llegaste a tiempo! El ladrón está acá, mezclado entre la gente.',
      identify: 'Identificar al ladrón',
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
      wrongSuspect: 'Era otra persona',
      wrongSuspectText:
        'Llegaste a tiempo, pero acusaste a la persona equivocada: el ladrón se escapó con {loot}. ¡Suerte en el próximo caso!',
      lostFocus: 'Te distrajiste',
      lostFocusText:
        'Dejaste la investigación por un momento y el ladrón lo aprovechó para escaparse con {loot}. Un buen detective no se distrae: ¡suerte en el próximo caso!',
      thiefWas: 'El ladrón era',
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
    clueKinds: {
      geography: 'Sabe de geografía',
      culture: 'Sabe de costumbres',
      history: 'Sabe de historia'
    },
    call: {
      button: 'Llamar a la central',
      detail: 'Descarta {count} · {time}',
      left: { one: 'Te queda {count} llamada', other: 'Te quedan {count} llamadas' },
      noneLeft: 'Ya no te quedan llamadas a la central',
      linesDown: 'Las líneas están caídas: hoy no podés llamar desde acá',
      nothingToRuleOut: 'No queda nada que descartar',
      noTime: 'No te queda tiempo para llamar',
      ruledOut: 'Descartado'
    },
    events: {
      title: 'Al llegar…',
      good: 'Buena noticia',
      bad: 'Mala noticia',
      continue: 'A investigar',
      show: 'Ver novedades',
      extraWitness: {
        title: 'Un testigo más',
        text: 'Alguien más vio al ladrón y se acercó a contarte: hay un testigo más para preguntar.'
      },
      talkative: {
        title: 'Testigos charlatanes',
        text: 'Hoy todos tienen ganas de hablar: cada testigo te va a dar dos pistas del destino.',
        textSome: {
          one: 'Uno de los testigos tiene ganas de hablar: te va a dar dos pistas del destino.',
          other: '{count} de los testigos tienen ganas de hablar: cada uno te va a dar dos pistas del destino.'
        }
      },
      sharpEye: {
        title: 'Buena memoria',
        text: 'Dos testigos le vieron bien la cara al ladrón: acá vas a escuchar dos de sus rasgos.'
      },
      suspectCleared: {
        title: 'Un sospechoso menos',
        text: 'La central ya descartó a uno de los sospechosos: al final vas a tener uno menos entre quien elegir.'
      },
      extraTime: {
        title: 'El ladrón se demoró',
        text: 'Al ladrón se le complicó la fuga: tenés {time} más para atraparlo.'
      },
      ruledOut: {
        title: 'Destinos descartados',
        text: 'Un informante te asegura que el ladrón no fue a {place}: ya lo tachaste de la lista.',
        textMany:
          'Un informante te asegura que el ladrón no fue a ninguno de estos lugares: {places}. Ya los tachaste de la lista.'
      },
      quickWitnesses: {
        title: 'Testigos apurados',
        text: 'Los testigos están con prisa: hablar con cada uno te cuesta {time} en vez de {usual}.'
      },
      extraCall: {
        title: 'Llamada extra',
        text: 'Tu jefa te habilita una llamada más a la central para el resto del caso.'
      },
      hotline: {
        title: 'Línea directa',
        text: {
          one: 'La central está muy atenta: si llamás desde acá, te cuesta {time} y descarta {count} destino.',
          other: 'La central está muy atenta: si llamás desde acá, te cuesta {time} y descarta {count} destinos.'
        }
      },
      secondChance: {
        title: 'Margen extra',
        text: 'La central te banca: podés equivocarte de destino una vez más en el resto del caso.'
      },
      directFlight: {
        title: 'Vuelo directo',
        text: 'Conseguiste un vuelo directo: el viaje que sale de acá dura {time} menos.'
      },
      witnessFiles: {
        title: 'Fichas de los testigos',
        text: 'La central te mandó las fichas de los testigos: acá sabés de qué sabe cada uno (geografía, costumbres o historia).'
      },
      missingWitness: {
        title: 'Un testigo se fue',
        text: 'Uno de los testigos se fue antes de que llegaras: hay uno menos para preguntar.'
      },
      noSighting: {
        title: 'Nadie le vio la cara',
        text: 'El ladrón pasó por acá con la cara tapada: nadie te va a poder contar cómo era.'
      },
      accomplice: {
        title: 'Un cómplice',
        text: 'El ladrón tiene un cómplice que se le parece: al final vas a tener un sospechoso más.'
      },
      lostTime: {
        title: 'El ladrón aceleró',
        text: 'El ladrón consiguió un vuelo antes de lo previsto: perdiste {time}.'
      },
      moreRumors: {
        title: 'Rumores',
        text: 'Corren rumores de que el ladrón pudo haber ido a otro lugar: hay un destino más para elegir.'
      },
      slowWitnesses: {
        title: 'Testigos lentos',
        text: 'Los testigos se van por las ramas: hablar con cada uno te cuesta {time} en vez de {usual}.'
      },
      linesDown: {
        title: 'Líneas caídas',
        text: 'Se cortaron las líneas: desde acá no podés llamar a la central.'
      },
      badSignal: {
        title: 'Mala señal',
        text: {
          one: 'Casi no hay señal: si llamás a la central desde acá, te cuesta {time} y descarta {count} destino.',
          other: 'Casi no hay señal: si llamás a la central desde acá, te cuesta {time} y descarta {count} destinos.'
        }
      },
      pressure: {
        title: 'Presión de arriba',
        text: 'Tu jefa perdió la paciencia: tenés un error permitido menos en el resto del caso.'
      },
      delayedFlight: {
        title: 'Vuelo demorado',
        text: 'Tu próximo vuelo se demoró: el viaje que sale de acá dura {time} más.'
      }
    },
    witness: {
      intro1: '¡Sí, vi a esa persona!',
      intro2: 'Mmm… me acuerdo bien.',
      intro3: 'Pasó por acá hace un rato.',
      intro4: 'Claro, era muy sospechosa.',
      intro5: 'Me hizo una pregunta rara…',
      intro6: 'La escuché hablar por teléfono…',
      nothingSeen: 'No vi a nadie así por acá. ¿Seguro que viniste al lugar correcto?',
      suspectLead: 'Ah, y me fijé que {trait}.'
    },
    lineup: {
      title: '¿Quién es el ladrón?',
      subtitle: 'Acordate de los rasgos que te contaron los testigos y señalá al ladrón.',
      suspect: 'Sospechoso {letter}',
      choose: 'Elegí al ladrón',
      accuse: 'Acusar al sospechoso {letter}',
      thiefTag: 'El ladrón',
      accusedTag: 'Tu acusación',
      caughtTitle: '¡Lo atrapaste!',
      caughtText: 'Era el sospechoso {letter}. Los testigos no se equivocaban.',
      wrongTitle: '¡Ese no era!',
      wrongText: 'El ladrón era el sospechoso {letter}: aprovechó la confusión y se escapó.',
      seeSummary: 'Ver resumen'
    },
    suspect: {
      clues: {
        gender: { f: 'era una mujer', m: 'era un hombre' },
        hairColor: {
          dark: 'tenía el pelo oscuro',
          brown: 'tenía el pelo castaño',
          red: 'tenía el pelo colorado',
          blond: 'tenía el pelo rubio',
          grey: 'tenía el pelo canoso',
          blue: 'tenía el pelo azul',
          pink: 'tenía el pelo rosa'
        },
        hairStyle: {
          short: 'tenía el pelo corto',
          spiky: 'tenía el pelo de punta',
          curly: 'tenía rulos',
          long: 'tenía el pelo largo',
          bob: 'tenía el pelo a la altura del mentón',
          bun: 'tenía el pelo recogido en un rodete',
          ponytail: 'tenía una cola de caballo',
          mohawk: 'tenía una cresta',
          buzz: 'tenía la cabeza rapada',
          bald: 'no tenía nada de pelo'
        },
        eyeColor: {
          brown: 'tenía los ojos marrones',
          green: 'tenía los ojos verdes',
          blue: 'tenía los ojos azules',
          grey: 'tenía los ojos grises'
        },
        glasses: { none: 'no usaba anteojos', clear: 'usaba anteojos', sun: 'usaba anteojos de sol' },
        facialHair: {
          none: 'no tenía barba ni bigote',
          mustache: 'tenía bigote',
          beard: 'tenía barba',
          goatee: 'tenía perilla',
          stubble: 'tenía barba de unos días'
        },
        headwear: {
          none: 'no llevaba nada en la cabeza',
          beret: 'llevaba una boina',
          cap: 'llevaba una gorra',
          sunHat: 'llevaba un sombrero',
          beanie: 'llevaba un gorro de lana'
        },
        freckles: { yes: 'tenía pecas' },
        earrings: { yes: 'llevaba aros' }
      }
    },
    gallery: {
      title: 'Testigos',
      subtitle: 'Página de prueba: tocá un testigo para escuchar su pista.',
      reroll: 'Otros testigos'
    }
  },
  daily: {
    topTitle: 'Los mejores de hoy',
    seeRanking: 'Ver ranking',
    title: 'Desafío diario',
    badge: 'Nuevo cada día',
    subtitle: 'Las mismas calles para todos. Un solo intento por día: ¿cuánto sacás hoy?',
    rules: '{rounds} rondas · {time} por ronda',
    play: 'Jugar el desafío',
    resume: 'Seguir jugando',
    seeResult: 'Ver resultado',
    yourScore: 'Tu puntaje de hoy',
    rank: 'Puesto {position} de {total}',
    forfeited: 'Abandonaste el desafío de hoy. ¡Mañana hay otro!',
    nextIn: 'Próximo desafío en {time}',
    leaderboardTitle: 'Ranking',
    leaderboardEmpty: 'Todavía nadie terminó este desafío.',
    you: 'vos'
  },
  ranking: {
    title: 'Ranking',
    subtitle: 'Los mejores puntajes del desafío diario.',
    today: 'Hoy',
    previousDay: 'Día anterior',
    nextDay: 'Día siguiente'
  },
  xp: {
    title: 'Nivel',
    level: 'Nivel {level}',
    earned: '+{xp} XP',
    total: '{xp} XP en total',
    toNextLevel: 'Faltan {xp} XP para el nivel {level}',
    levelUp: '¡Subiste a nivel {level}!',
    ranks: {
      tourist: 'Turista',
      backpacker: 'Mochilero',
      explorer: 'Explorador',
      cartographer: 'Cartógrafo',
      navigator: 'Navegante',
      legend: 'Leyenda'
    }
  },
  achievements: {
    title: 'Medallas',
    count: '{unlocked} de {total} medallas',
    completed: '{percent}% completado',
    new: { one: '¡Logro nuevo!', other: '¡Logros nuevos!' },
    xp: '+{xp} XP',
    tiers: { bronze: 'Bronce', silver: 'Plata', gold: 'Oro' },
    progress: '{value} / {target}',
    items: {
      firstTrip: { name: 'Primer viaje', description: 'Terminá tu primera partida' },
      eagleEye: { name: 'Ojo de águila', description: 'Una ronda a menos de 1 km' },
      bullseye: { name: 'Diana', description: 'Una ronda a menos de 100 m' },
      starGame: {
        name: 'Partida estrella',
        description: {
          one: 'Terminá una partida clásica con {count} estrella',
          other: 'Terminá una partida clásica con {count} estrellas'
        }
      },
      earlyBird: { name: 'Madrugador', description: 'Jugá tu primer desafío diario' },
      friendsChampion: { name: 'Campeón entre amigos', description: 'Ganá una partida con amigos' },
      lastStanding: { name: 'Último en pie', description: 'Ganá un Battle Royale' },
      firstCase: { name: 'Primer caso', description: 'Resolvé tu primer caso' },
      inspector: { name: 'Inspector', description: 'Resolvé un caso en dificultad media' },
      sherlock: { name: 'Sherlock', description: 'Resolvé un caso en dificultad difícil' },
      cleanCase: { name: 'Caso limpio', description: 'Resolvé un caso sin viajar a un destino equivocado' },
      againstTheClock: { name: 'Contrarreloj', description: 'Atrapá al ladrón con {count} horas o más de sobra' },
      frequentTraveler: { name: 'Viajero frecuente', description: 'Terminá {count} partidas' },
      steady: { name: 'Constante', description: 'Llegá a una racha de {count} días' },
      careerDetective: { name: 'Detective de carrera', description: 'Resolvé {count} casos' },
      globetrotter: { name: 'Trotamundos', description: 'Jugá en los {count} mapas' },
      justInTime: { name: 'Justo a tiempo', description: 'Atrapá al ladrón con el reloj exactamente en 0' },
      quickCase: {
        name: 'Relámpago',
        description: 'Resolvé un caso en dificultad media o difícil en menos de {count} minutos'
      },
      noHints: {
        name: 'Sexto sentido',
        description: 'Resolvé un caso sin hablar con ningún testigo ni llamar a la central'
      },
      centralCaller: { name: 'Línea directa', description: 'Atrapá al ladrón habiendo llamado 2 veces a la central' },
      levels: { name: 'Veterano', description: 'Llegá al nivel {count}' },
      tracker: { name: 'Rastreador', description: 'Acertá el país en {count} rondas de Partidas Clásicas' },
      allContinents: {
        name: 'Seis continentes',
        description: 'Acertá el país en rondas de los {count} continentes en Partidas Clásicas'
      },
      instinct: {
        name: 'Instinto',
        description: 'Acertá {count} veces el destino del ladrón sin hablar con testigos ni llamar a la central'
      },
      badLuck: { name: 'Mala suerte', description: 'Te tocaron 2 eventos malos en la misma parada {count} veces' },
      goodLuck: { name: 'Buena suerte', description: 'Te tocaron 2 eventos buenos en la misma parada {count} veces' },
      iconicPlaces: {
        name: 'Postal',
        description: 'Acertá {count} lugares icónicos a menos de 2 km (mapa Lugares icónicos)'
      },
      classicWithFriends: { name: 'Clásico entre amigos', description: 'Jugá {count} Partidas Clásicas multijugador' },
      battleRoyalePlayer: { name: 'Gladiador', description: 'Jugá {count} partidas de Battle Royale' }
    }
  },
  streak: {
    tooltip: { one: 'Racha: {count} día seguido jugando', other: 'Racha: {count} días seguidos jugando' },
    days: { one: '{count} día', other: '{count} días' },
    safeToday: '¡Racha a salvo por hoy!',
    playToday: 'Terminá una partida hoy para no perder tu racha',
    freezes: { one: '{count} protector de racha', other: '{count} protectores de racha' },
    freezesHint: 'Ganás un protector cada 7 días de racha: te salva si un día no jugás.'
  },
  share: {
    button: 'Compartir',
    copied: '¡Resultado copiado! Pegalo donde quieras.',
    failed: 'No se pudo compartir el resultado.',
    dailyTitle: 'GeoQuests diario #{number}',
    gameTitle: 'GeoQuests · {map}',
    streak: { one: '🔥 Racha: {count} día', other: '🔥 Racha: {count} días' }
  },
  errors: {
    dailyChallengeUnavailable: 'El desafío de hoy no está disponible. Probá de nuevo en un rato.',
    dailyChallengeAlreadyPlayed: 'Ya usaste tu intento del desafío de hoy. ¡Volvé mañana!',
    dailyChallengeNotFound: 'No se encontró el desafío',
    internal: 'Error interno',
    notAuthenticated: 'Usuario no autenticado',
    unauthorized: 'No autorizado',
    playerNameRequired: 'Elegí un nombre de jugador',
    playerNameTooLong: 'El nombre de jugador puede tener hasta 40 caracteres',
    lastNameTooLong: 'El apellido puede tener hasta 40 caracteres',
    nicknameTooLong: 'El apodo puede tener hasta 40 caracteres',
    invalidLocale: 'Idioma no válido',
    invalidTimeZone: 'Zona horaria no válida',
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
    noTimeForCall: 'No te queda tiempo para llamar a la central',
    noCallsLeft: 'Ya no te quedan llamadas a la central',
    centralLinesDown: 'Las líneas están caídas: no podés llamar a la central desde acá',
    nothingToRuleOut: 'No queda ningún destino para descartar',
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
