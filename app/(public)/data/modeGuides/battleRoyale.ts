import { Article } from '@/app/(public)/models/Article'

export const battleRoyaleGuide: Article = {
  slug: 'battle-royale',
  icon: '👑',
  image: '/modes/battle-royale.png',
  playPath: '/multiplayer/battle-royale',
  publishedAt: '2026-10-26',
  updatedAt: '2026-10-26',
  text: {
    es: {
      title: 'Cómo jugar al Battle Royale',
      description:
        'Las reglas del Battle Royale de GeoQuests: de 3 a 8 jugadores, en cada tanda de rondas queda eliminado el que menos sumó y gana el último en pie.',
      sections: [
        {
          paragraphs: [
            'El Battle Royale es el modo más intenso de GeoQuests. Usa la misma mecánica que la Partida Clásica con amigos (sala con código, mismas calles y mismo reloj para todos), pero cambia el objetivo: no gana el que suma más puntos al final, sino el que sobrevive. En cada eliminación cae un jugador, hasta que queda uno solo.'
          ]
        },
        {
          title: 'Quién queda eliminado',
          paragraphs: [
            'Al crear la sala, el anfitrión elige cada cuántas rondas hay una eliminación: 1, 2 o 3. Con una ronda por eliminación, al cerrarse cada ronda cae quien no respondió a tiempo o, si respondieron todos, quien marcó más lejos del lugar real; si hay empate en la distancia, cae el que respondió último. Con tandas de 2 o 3 rondas, al terminar la tanda cae quien sumó menos puntos en ella, y los puntos vuelven a empezar de cero para la tanda siguiente.',
            'Hay algunas reglas para que la partida sea justa: si nadie respondió, no cae nadie y se juega otra ronda; quien abandona la partida queda eliminado; y nunca se elimina a todos los que siguen en pie (por ejemplo, ante un empate exacto entre los dos últimos).'
          ]
        },
        {
          title: 'Las reglas',
          paragraphs: [],
          list: [
            'Jugadores: de 3 a 8, todos con cuenta.',
            'Tiempo por ronda: de 30 segundos a 5 minutos (por defecto, 3 minutos).',
            'Rondas por eliminación: 1, 2 o 3.',
            'Las rondas se preparan al empezar: una tanda por cada eliminación necesaria y dos rondas de repuesto por si alguna termina sin eliminados.',
            'Si se terminan las rondas antes de que quede uno solo, gana el de más puntos entre los que siguen en pie.'
          ]
        },
        {
          title: 'Después de caer',
          paragraphs: [
            'Quedar eliminado no te saca de la partida: seguís mirando cada ronda y los pines de todos, así que podés ver cómo se define. Las posiciones finales dependen de en qué momento cayó cada uno: el ganador queda primero, el último eliminado segundo, y así. Los que caen en la misma ronda comparten el puesto.'
          ]
        },
        {
          title: 'Estrategia para sobrevivir',
          paragraphs: [
            'En el Battle Royale no hace falta ser el mejor en cada ronda: alcanza con no ser el peor. Eso cambia la forma de jugar.'
          ],
          list: [
            'Responder siempre es lo primero: quedarse sin responder es la forma más segura de caer.',
            'Con una ronda por eliminación, un pin prudente en el país correcto suele salvarte aunque no sea perfecto.',
            'En tandas de varias rondas podés arriesgar en una ronda difícil si venís con ventaja en la tanda.',
            'Mirá el reloj: con poco tiempo por ronda, marcá un pin aproximado temprano y movelo si encontrás algo mejor.',
            'Cuando quedan dos jugadores, cada metro cuenta: tomate unos segundos más para afinar la ubicación.'
          ]
        }
      ]
    },
    en: {
      title: 'How to play Battle Royale',
      description:
        "The rules of GeoQuests' Battle Royale: 3 to 8 players, after every block of rounds the lowest scorer is eliminated and the last one standing wins.",
      sections: [
        {
          paragraphs: [
            'Battle Royale is the most intense mode of GeoQuests. It uses the same mechanics as the Classic game with friends (a room with a code, the same streets and the same clock for everybody), but the goal changes: the winner is not whoever scores the most points at the end, but whoever survives. Every elimination knocks out one player, until only one is left.'
          ]
        },
        {
          title: 'Who gets eliminated',
          paragraphs: [
            'When creating the room, the host chooses how many rounds are played between eliminations: 1, 2 or 3. With one round per elimination, when each round closes the player who did not answer in time is out or, if everybody answered, the one whose pin was farthest from the real location; on a distance tie, the one who answered last falls. With blocks of 2 or 3 rounds, at the end of the block the player who scored the fewest points in it is out, and points start again from zero for the next block.',
            'A few rules keep the game fair: if nobody answered, nobody falls and another round is played; a player who leaves the game is eliminated; and the game never eliminates everybody still standing (for example, on an exact tie between the last two).'
          ]
        },
        {
          title: 'The rules',
          paragraphs: [],
          list: [
            'Players: 3 to 8, all with an account.',
            'Time per round: from 30 seconds to 5 minutes (3 minutes by default).',
            'Rounds per elimination: 1, 2 or 3.',
            'Rounds are prepared at the start: one block for each elimination needed plus two spare rounds in case a round ends without eliminations.',
            'If the rounds run out before only one player is left, the player with the most points among those still standing wins.'
          ]
        },
        {
          title: 'After you fall',
          paragraphs: [
            "Being eliminated does not throw you out of the game: you keep watching every round and everybody's pins, so you can see how it ends. Final positions depend on when each player fell: the winner is first, the last one eliminated second, and so on. Players who fall in the same round share the position."
          ]
        },
        {
          title: 'Survival strategy',
          paragraphs: [
            'In Battle Royale you do not need to be the best in every round: it is enough not to be the worst. That changes how you play.'
          ],
          list: [
            'Always answering comes first: not answering is the surest way to fall.',
            'With one round per elimination, a careful pin in the right country will often save you even if it is not perfect.',
            'In blocks of several rounds you can take a risk in a hard round if you are ahead in the block.',
            'Watch the clock: with little time per round, place a rough pin early and move it if you find something better.',
            'When two players are left, every meter counts: take a few extra seconds to fine-tune the location.'
          ]
        }
      ]
    }
  }
}
