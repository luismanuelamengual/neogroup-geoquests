import { Article } from '@/app/(public)/models/Article'

export const multiplayerGuide: Article = {
  slug: 'multiplayer',
  icon: '👥',
  image: '/modes/multiplayer.png',
  playPath: '/multiplayer/friends',
  publishedAt: '2026-10-26',
  updatedAt: '2026-10-26',
  text: {
    es: {
      title: 'Cómo jugar una Partida Clásica con amigos',
      description:
        'Cómo crear una sala, invitar a tus amigos con un código y competir en las mismas calles al mismo tiempo en el modo multijugador de GeoQuests.',
      sections: [
        {
          paragraphs: [
            'La Partida Clásica multijugador lleva las reglas del modo Clásico a una competencia en vivo: de 2 a 8 jugadores ven exactamente las mismas calles, al mismo tiempo y con el mismo reloj. Gana quien, sumando todas las rondas, se acerque más a los lugares reales.'
          ]
        },
        {
          title: 'Crear la sala e invitar',
          paragraphs: [
            'Desde el menú Multijugador elegís el modo, las reglas y el mapa, y creás la sala. GeoQuests le asigna un código de 6 caracteres que podés compartir de dos formas: mandando el link de invitación o dictando el código, que tus amigos ingresan con el botón "Unirme con código". Todos los jugadores necesitan una cuenta gratuita.',
            'Mientras esperan, la sala muestra quién entró. El anfitrión puede sacar a alguien de la sala y empieza la partida cuando ya hay al menos dos jugadores.'
          ]
        },
        {
          title: 'Las reglas',
          list: [
            'Rondas: 3, 5 o 10 (por defecto, 5).',
            'Tiempo por ronda: de 30 segundos a 5 minutos (por defecto, 3 minutos).',
            'Cada ronda empieza para todos después de una cuenta regresiva de 3 segundos.',
            'La ronda se cierra cuando respondieron todos los jugadores conectados o cuando se acaba el tiempo. Quien no respondió saca 0 puntos.',
            'Hasta que se cierra la ronda nadie ve dónde marcaron los demás, solo quién ya respondió.'
          ],
          paragraphs: []
        },
        {
          title: 'Resultados y desempates',
          paragraphs: [
            'Al cerrarse cada ronda, el mapa muestra durante 15 segundos los pines de todos junto al lugar real, con la distancia y los puntos de cada uno. Es el mejor momento de la partida: ahí se ve quién reconoció el lugar y quién se fue a otro continente. Después arranca la ronda siguiente.',
            'El puntaje de cada ronda se calcula igual que en el modo Clásico: hasta 5.000 puntos, que bajan cuanto más lejos queda el pin. Al terminar la última ronda gana el mayor puntaje total y, si hay empate, quien acumuló menos distancia en total.'
          ]
        },
        {
          title: 'Si alguien se desconecta',
          paragraphs: [
            'La partida vive en el servidor, así que se puede seguir desde cualquier dispositivo: si se te cierra el navegador, volvés a entrar y seguís donde estabas. Un jugador que deja de responder por unos segundos se considera desconectado y la ronda no lo espera. Si el anfitrión se va, el rol pasa al jugador que entró primero.'
          ]
        },
        {
          title: 'Ideas para jugar en grupo',
          paragraphs: ['El multijugador funciona muy bien para reuniones, clases o videollamadas:'],
          list: [
            'Para un grupo que recién empieza, elegí Ciudades famosas y 3 minutos por ronda.',
            'Para un grupo con experiencia, probá Ciudades del mundo con 1 minuto: la presión del reloj cambia todo.',
            'En una clase de geografía, después de cada ronda pedí que expliquen qué pistas usaron.',
            'Si son muchos y quieren más tensión, pasen al modo Battle Royale.'
          ]
        }
      ]
    },
    en: {
      title: 'How to play a Classic game with friends',
      description:
        "How to create a room, invite your friends with a code and compete on the same streets at the same time in GeoQuests' multiplayer mode.",
      sections: [
        {
          paragraphs: [
            'The multiplayer Classic game takes the rules of Classic mode to a live competition: 2 to 8 players see exactly the same streets, at the same time and with the same clock. Whoever gets closest to the real places, adding up every round, wins.'
          ]
        },
        {
          title: 'Create the room and invite',
          paragraphs: [
            'From the Multiplayer menu you pick the mode, the rules and the map, and create the room. GeoQuests gives it a 6-character code you can share in two ways: by sending the invitation link or by reading out the code, which your friends enter with the "Join with code" button. Every player needs a free account.',
            'While you wait, the room shows who has joined. The host can remove someone from the room and starts the game once there are at least two players.'
          ]
        },
        {
          title: 'The rules',
          list: [
            'Rounds: 3, 5 or 10 (5 by default).',
            'Time per round: from 30 seconds to 5 minutes (3 minutes by default).',
            'Every round starts for everybody after a 3-second countdown.',
            'The round closes when every connected player has answered or when time runs out. Whoever did not answer scores 0.',
            'Until the round closes nobody sees where the others guessed, only who has already answered.'
          ],
          paragraphs: []
        },
        {
          title: 'Results and tiebreakers',
          paragraphs: [
            "When each round closes, the map shows everybody's pins next to the real location for 15 seconds, with each player's distance and points. It is the best moment of the game: you see who recognized the place and who ended up on another continent. Then the next round starts.",
            'Each round is scored just like in Classic mode: up to 5,000 points, fewer the farther the pin lands. After the last round the highest total score wins and, in a tie, the player with the lowest total distance.'
          ]
        },
        {
          title: 'If someone disconnects',
          paragraphs: [
            'The game lives on the server, so it can be followed from any device: if your browser closes, you come back and continue where you were. A player who stops responding for a few seconds is considered disconnected and the round does not wait for them. If the host leaves, the role passes to the player who joined first.'
          ]
        },
        {
          title: 'Ideas for playing in a group',
          paragraphs: ['Multiplayer works great for get-togethers, classrooms or video calls:'],
          list: [
            'For a group that is just starting, pick Famous cities and 3 minutes per round.',
            'For an experienced group, try World cities with 1 minute: the pressure of the clock changes everything.',
            'In a geography class, ask players to explain which clues they used after each round.',
            'If there are many of you and you want more tension, move on to Battle Royale.'
          ]
        }
      ]
    }
  }
}
