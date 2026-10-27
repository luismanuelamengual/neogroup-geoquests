import { Article } from '@/app/(public)/models/Article'

export const detectiveGuide: Article = {
  slug: 'detective',
  icon: '🕵️',
  image: '/modes/detective.png',
  playPath: '/play/detective',
  publishedAt: '2026-10-26',
  updatedAt: '2026-10-26',
  text: {
    es: {
      title: 'Cómo jugar al modo Detective',
      description:
        'Guía del modo Detective de GeoQuests: seguí el rastro de un ladrón por lugares icónicos del mundo, interrogá testigos, elegí destinos y atrapalo antes de que se acabe el tiempo.',
      sections: [
        {
          paragraphs: [
            'En el modo Detective no adivinás dónde estás: ya lo sabés. El desafío es descubrir a dónde fue el ladrón. Cada caso empieza con un robo en un lugar famoso del mundo, y el ladrón va a pasar por varios lugares más antes de desaparecer para siempre. Tu trabajo es seguirle el rastro con las pistas de los testigos y, al final, reconocerlo entre los sospechosos.'
          ]
        },
        {
          title: 'El caso',
          paragraphs: [
            'Al empezar recibís el informe del caso: qué se robaron, dónde y cuándo, y la fecha y hora límite para atraparlo. El reloj del caso es un reloj del juego, no del mundo real: cada acción que hacés consume horas de ese reloj. Si llega la hora límite antes de que lo atrapes, el ladrón se escapa.'
          ]
        },
        {
          title: 'Paso a paso',
          paragraphs: [],
          list: [
            'Recorré el lugar donde estás con la vista de calle. El ladrón ya se fue: solo los testigos saben a dónde.',
            'Hablá con los testigos. Cada uno te da una pista sobre el próximo destino, y uno de ellos además te cuenta un rasgo del ladrón (el color de pelo, si usa anteojos, si lleva sombrero…). Según su oficio, saben de geografía, de costumbres o de historia. Cada testigo te cuesta tiempo.',
            'Elegí a dónde viajar entre varios destinos posibles. Si acertás, seguís el rastro; si te equivocás, perdés el viaje y el tiempo, y con demasiados errores perdés el rastro.',
            'Si estás trabado, llamá a la central: descarta dos destinos equivocados, pero cuesta más tiempo que un testigo. Hay una llamada por caso.',
            'Al llegar a cada lugar puede pasar algo imprevisto, bueno o malo: más o menos testigos, tiempo extra o perdido, más destinos o más sospechosos.',
            'Cuando llegás al último lugar a tiempo, tenés que señalar al ladrón entre los sospechosos usando los rasgos que te contaron.'
          ]
        },
        {
          title: 'Las dificultades',
          paragraphs: ['Antes de cada caso elegís la dificultad:'],
          list: [
            'Fácil: 5 lugares, 4 destinos por viaje, 4 sospechosos y hasta 2 errores. Más tiempo para pensar.',
            'Medio: 5 lugares, 5 destinos por viaje, 4 sospechosos y 1 error permitido. El desafío de siempre.',
            'Difícil: 6 lugares, 6 destinos por viaje, 5 sospechosos y 1 error permitido, con muy poco margen de tiempo.'
          ]
        },
        {
          title: 'Cómo leer las pistas de los testigos',
          paragraphs: [
            'Las pistas nunca dicen el nombre del destino: hablan de lo que el ladrón preguntó, compró o comentó. Una pista sobre una moneda, un idioma o un plato típico apunta a un país; una sobre un monumento o un río apunta a una ciudad. Combiná las pistas de los tres testigos: muchas veces una sola es ambigua, pero dos juntas dejan un único destino posible.',
            'Anotá los rasgos del ladrón a medida que aparecen. En el final los sospechosos se parecen mucho entre sí, y un solo detalle, como los anteojos o el color de ojos, decide el caso.'
          ]
        },
        {
          title: 'Consejos de detective',
          paragraphs: [],
          list: [
            'No hace falta hablar con todos los testigos si una pista ya es clarísima: el tiempo que ahorrás puede salvarte más adelante.',
            'Guardá la llamada a la central para un viaje en el que dudes entre muchos destinos.',
            'Si un destino queda muy cerca del lugar actual, desconfiá: el ladrón suele viajar lejos.',
            'Los casos resueltos dan mucha experiencia, y más en las dificultades altas.'
          ]
        }
      ]
    },
    en: {
      title: 'How to play Detective mode',
      description:
        "A guide to GeoQuests' Detective mode: follow a thief's trail through iconic places around the world, question witnesses, choose destinations and catch them before time runs out.",
      sections: [
        {
          paragraphs: [
            'In Detective mode you do not guess where you are: you already know. The challenge is to find out where the thief went. Every case starts with a robbery at a famous place, and the thief will pass through several more places before vanishing forever. Your job is to follow the trail with the clues the witnesses give you and, at the end, pick the thief out of the suspects.'
          ]
        },
        {
          title: 'The case',
          paragraphs: [
            'At the start you get the case report: what was stolen, where and when, and the deadline to catch the thief. The case clock is a game clock, not a real-world one: every action you take uses up hours of it. If the deadline arrives before you catch the thief, they get away.'
          ]
        },
        {
          title: 'Step by step',
          paragraphs: [],
          list: [
            'Explore the place you are in with street view. The thief is already gone: only the witnesses know where.',
            'Talk to the witnesses. Each one gives you a clue about the next destination, and one of them also tells you a trait of the thief (hair color, glasses, a hat…). Depending on their job, they know about geography, customs or history. Every witness costs you time.',
            'Choose where to travel among several possible destinations. If you are right, you stay on the trail; if you are wrong, you lose the trip and the time, and with too many mistakes you lose the trail.',
            'If you are stuck, call headquarters: it rules out two wrong destinations, but it costs more time than a witness. There is one call per case.',
            'Something unexpected may happen when you arrive at each place, good or bad: more or fewer witnesses, extra or lost time, more destinations or more suspects.',
            'When you reach the last place in time, you have to point out the thief among the suspects using the traits you were told.'
          ]
        },
        {
          title: 'Difficulty levels',
          paragraphs: ['Before every case you choose the difficulty:'],
          list: [
            'Easy: 5 places, 4 destinations per trip, 4 suspects and up to 2 mistakes. More time to think.',
            'Medium: 5 places, 5 destinations per trip, 4 suspects and 1 mistake allowed. The classic challenge.',
            'Hard: 6 places, 6 destinations per trip, 5 suspects and 1 mistake allowed, with very little spare time.'
          ]
        },
        {
          title: 'How to read the witness clues',
          paragraphs: [
            'Clues never name the destination: they talk about what the thief asked, bought or mentioned. A clue about a currency, a language or a typical dish points to a country; one about a monument or a river points to a city. Combine the clues of the three witnesses: often a single one is ambiguous, but two together leave only one possible destination.',
            "Write down the thief's traits as they appear. At the end the suspects look very much alike, and a single detail, such as glasses or eye color, decides the case."
          ]
        },
        {
          title: 'Detective tips',
          paragraphs: [],
          list: [
            'You do not need to talk to every witness if one clue is already crystal clear: the time you save may rescue you later.',
            'Save the call to headquarters for a trip where you are torn between many destinations.',
            'If a destination is very close to where you are, be suspicious: the thief usually travels far.',
            'Solved cases give a lot of experience, even more on the higher difficulties.'
          ]
        }
      ]
    }
  }
}
