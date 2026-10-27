import { Article } from '@/app/(public)/models/Article'

export const classicGuide: Article = {
  slug: 'classic',
  icon: '🧭',
  image: '/modes/classic.png',
  playPath: '/play/classic',
  publishedAt: '2026-10-26',
  updatedAt: '2026-10-26',
  text: {
    es: {
      title: 'Cómo jugar al modo Clásico',
      description:
        'Las reglas del modo Clásico de GeoQuests: aparecés en una calle del mundo, buscás pistas y marcás en el mapa dónde creés que estás. Cuanto más cerca, más puntos.',
      sections: [
        {
          paragraphs: [
            'El modo Clásico es el corazón de GeoQuests y la mejor forma de empezar. Jugás solo y a tu ritmo: en cada ronda aparecés en un punto al azar de una calle real, con imágenes de Google Street View, y tu objetivo es adivinar dónde estás. No hay ningún cartel que diga el nombre de la ciudad: lo tenés que deducir mirando a tu alrededor.'
          ]
        },
        {
          title: 'Cómo es una ronda',
          paragraphs: [
            'Al empezar la ronda ves una panorámica de 360°. Podés girar la cámara, acercarte para leer un cartel y caminar por la calle para buscar más pistas. Cuando tengas una idea, abrí el mapa, poné tu pin donde creas que estás y confirmá tu respuesta.',
            'Enseguida se revela el lugar real: el mapa muestra tu pin, la ubicación correcta y la distancia entre los dos. Con eso se calculan los puntos de la ronda.'
          ]
        },
        {
          title: 'Las reglas que podés elegir',
          paragraphs: ['Antes de empezar elegís el mapa y las reglas de la partida:'],
          list: [
            'Rondas: 3, 5 o 10. La partida estándar tiene 5.',
            'Tiempo por ronda: 30 segundos, 1, 2, 3 o 5 minutos, o sin límite. Por defecto son 3 minutos.',
            'Mapa: Ciudades famosas, Ciudades del mundo, Lugares icónicos, Latinoamérica, Europa, Argentina, España o Estados Unidos.'
          ]
        },
        {
          title: 'Cómo se calcula el puntaje',
          paragraphs: [
            'Cada ronda vale hasta 5.000 puntos. Si tu pin queda a menos de 25 metros del lugar exacto, te llevás los 5.000. A partir de ahí los puntos bajan de forma exponencial con la distancia: la precisión cerca del objetivo vale mucho, y alejarse cuesta cada vez más. Con la escala estándar, un pin a 10 km da unos 4.850 puntos, a 100 km unos 3.680, a 500 km alrededor de 1.080 y a 1.000 km apenas unos 230.',
            'Si se termina el tiempo, el juego envía el pin que tengas marcado. Si no marcaste nada, la ronda vale 0. Al final de la partida ves el total, las estrellas que ganaste (de 0 a 3, según el porcentaje del puntaje máximo) y el detalle de cada ronda en el mapa.'
          ]
        },
        {
          title: 'Consejos para tus primeras partidas',
          paragraphs: ['Si recién empezás, estas ideas te van a ayudar a sumar más:'],
          list: [
            'Empezá por Ciudades famosas: son 20 ciudades muy conocidas y es el mapa más amable.',
            'Antes de mirar el mapa, decidí primero el continente, después el país y recién al final la ciudad.',
            'Fijate de qué lado de la calle circulan los autos y en qué idioma están los carteles: son las dos pistas más rápidas.',
            'Caminá hasta una esquina: los nombres de las calles y los comercios suelen confirmar la ciudad.',
            'Si dudás entre dos lugares lejanos, conviene jugársela por el más probable antes que dejar el pin en el medio del océano.'
          ]
        },
        {
          title: 'Por qué jugarlo seguido',
          paragraphs: [
            'Cada partida terminada te da experiencia (XP) para subir de nivel, suma a tu racha de días seguidos y puede desbloquear logros, como acertar una ronda a menos de 100 metros o conseguir las tres estrellas. Y como las ubicaciones se eligen al azar en cada partida, nunca vas a jugar dos veces la misma.'
          ]
        }
      ]
    },
    en: {
      title: 'How to play Classic mode',
      description:
        "The rules of GeoQuests' Classic mode: you are dropped on a street somewhere in the world, look for clues and mark on the map where you think you are. The closer you get, the more points you score.",
      sections: [
        {
          paragraphs: [
            'Classic mode is the heart of GeoQuests and the best way to start. You play alone, at your own pace: every round drops you at a random spot on a real street, with Google Street View imagery, and your goal is to guess where you are. No sign tells you the name of the city: you have to work it out by looking around.'
          ]
        },
        {
          title: 'How a round works',
          paragraphs: [
            'When the round starts you see a 360° panorama. You can turn the camera, zoom in to read a sign and walk down the street to find more clues. Once you have an idea, open the map, drop your pin where you think you are and confirm your guess.',
            'The real location is revealed right away: the map shows your pin, the correct spot and the distance between them. That distance decides the points of the round.'
          ]
        },
        {
          title: 'The rules you can choose',
          paragraphs: ['Before starting you pick the map and the rules of the game:'],
          list: [
            'Rounds: 3, 5 or 10. The standard game has 5.',
            'Time per round: 30 seconds, 1, 2, 3 or 5 minutes, or no limit. The default is 3 minutes.',
            'Map: Famous cities, World cities, Landmarks, Latin America, Europe, Argentina, Spain or the United States.'
          ]
        },
        {
          title: 'How the score is calculated',
          paragraphs: [
            'Each round is worth up to 5,000 points. If your pin lands within 25 meters of the exact spot, you get all 5,000. From there the points decay exponentially with distance: precision close to the target is worth a lot, and every extra kilometer costs more. On the standard scale, a pin 10 km away scores about 4,850 points, 100 km about 3,680, 500 km around 1,080 and 1,000 km only about 230.',
            'If time runs out, the game submits the pin you have placed. If you have not placed one, the round scores 0. At the end of the game you see your total, the stars you earned (0 to 3, depending on the share of the maximum score) and every round on the map.'
          ]
        },
        {
          title: 'Tips for your first games',
          paragraphs: ['If you are just starting, these ideas will help you score more:'],
          list: [
            'Start with Famous cities: 20 very well-known cities make it the friendliest map.',
            'Before looking at the map, settle the continent first, then the country, and only then the city.',
            'Check which side of the road cars drive on and which language the signs are in: they are the two fastest clues.',
            'Walk to a corner: street names and shop signs often confirm the city.',
            'If you are torn between two places far apart, it usually pays to commit to the most likely one rather than leaving the pin in the middle of the ocean.'
          ]
        },
        {
          title: 'Why play it often',
          paragraphs: [
            'Every finished game gives you experience (XP) to level up, adds to your streak of consecutive days and can unlock achievements, such as guessing a round within 100 meters or earning all three stars. And since locations are picked at random for every game, you will never play the same one twice.'
          ]
        }
      ]
    }
  }
}
