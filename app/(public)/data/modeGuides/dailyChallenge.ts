import { Article } from '@/app/(public)/models/Article'

export const dailyChallengeGuide: Article = {
  slug: 'daily-challenge',
  icon: '📅',
  image: '/modes/classic.png',
  playPath: '/play',
  publishedAt: '2026-10-26',
  updatedAt: '2026-10-26',
  text: {
    es: {
      title: 'Cómo funciona el Desafío diario',
      description:
        'El Desafío diario de GeoQuests: las mismas cinco calles para todos los jugadores, un solo intento por día, ranking diario y un resultado para compartir.',
      sections: [
        {
          paragraphs: [
            'Todos los días hay un Desafío diario nuevo: una partida del modo Clásico con las mismas ubicaciones para todos los jugadores del mundo. Como tenés un solo intento, cada desafío es una pequeña competencia entre todos los que lo juegan ese día.'
          ]
        },
        {
          title: 'Las reglas',
          paragraphs: [],
          list: [
            '5 rondas de 3 minutos cada una.',
            'Las mismas cinco ubicaciones para todos.',
            'Un solo intento por día: si abandonás la partida, gastás el intento.',
            'El mapa va rotando día a día entre Ciudades famosas, Ciudades del mundo y Lugares icónicos.',
            'El puntaje de cada ronda se calcula igual que en el Clásico, hasta 5.000 puntos por ronda.'
          ]
        },
        {
          title: 'Cuándo cambia el desafío',
          paragraphs: [
            'El desafío cambia a la medianoche de tu zona horaria, como en otros juegos diarios. Por eso, el desafío de un día se puede jugar durante algo más de 24 horas en todo el mundo, desde que empieza ese día en las islas del Pacífico hasta que termina en las últimas zonas horarias. En el menú ves una cuenta regresiva hasta el próximo.'
          ]
        },
        {
          title: 'El ranking',
          paragraphs: [
            'Al terminar ves tu puntaje y tu puesto entre todos los que ya jugaron ese día. La sección Ranking muestra los mejores de hoy y también los de días anteriores, para recorrerlos día por día. Los empates comparten el puesto.'
          ]
        },
        {
          title: 'Compartir el resultado',
          paragraphs: [
            'El resumen tiene un botón para compartir tu resultado sin revelar las ubicaciones: un cuadrado de color por ronda (verde para 4.000 puntos o más, amarillo desde 2.000, naranja si sumaste algo y rojo si sacaste 0), tu racha y el link al juego. Así podés comparar con tus amigos sin arruinarles el desafío.'
          ]
        },
        {
          title: 'Racha y recompensas',
          paragraphs: [
            'Jugar el desafío da 50 puntos de experiencia extra y cuenta para tu racha de días seguidos. Cada 7 días de racha ganás un protector, que la salva si te salteás un solo día. Es la forma más simple de convertir GeoQuests en un hábito de cinco minutos por día y, de paso, aprender un poco más de geografía cada mañana.'
          ]
        }
      ]
    },
    en: {
      title: 'How the Daily challenge works',
      description:
        "GeoQuests' Daily challenge: the same five streets for every player, a single attempt per day, a daily leaderboard and a result to share.",
      sections: [
        {
          paragraphs: [
            'There is a new Daily challenge every day: a Classic game with the same locations for every player in the world. Since you get a single attempt, every challenge is a small competition among everybody who plays it that day.'
          ]
        },
        {
          title: 'The rules',
          paragraphs: [],
          list: [
            '5 rounds of 3 minutes each.',
            'The same five locations for everybody.',
            'A single attempt per day: if you leave the game, the attempt is used up.',
            'The map rotates every day between Famous cities, World cities and Landmarks.',
            'Each round is scored just like in Classic mode, up to 5,000 points per round.'
          ]
        },
        {
          title: 'When the challenge changes',
          paragraphs: [
            "The challenge changes at midnight in your time zone, like other daily games. That is why a given day's challenge can be played for somewhat more than 24 hours around the world, from when that day begins on the Pacific islands until it ends in the last time zones. The menu shows a countdown to the next one."
          ]
        },
        {
          title: 'The leaderboard',
          paragraphs: [
            "When you finish you see your score and your position among everybody who has played that day. The Ranking section shows today's best players and those of previous days, so you can browse them day by day. Ties share the position."
          ]
        },
        {
          title: 'Sharing your result',
          paragraphs: [
            'The summary has a button to share your result without revealing the locations: one colored square per round (green for 4,000 points or more, yellow from 2,000, orange if you scored anything and red for 0), your streak and the link to the game. That way you can compare with your friends without spoiling the challenge for them.'
          ]
        },
        {
          title: 'Streak and rewards',
          paragraphs: [
            'Playing the challenge gives 50 extra experience points and counts towards your streak of consecutive days. Every 7 days of streak you earn a shield, which saves it if you skip a single day. It is the simplest way to turn GeoQuests into a five-minute daily habit and learn a bit more geography every morning along the way.'
          ]
        }
      ]
    }
  }
}
