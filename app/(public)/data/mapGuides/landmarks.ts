import { Article } from '@/app/(public)/models/Article'

export const landmarksGuide: Article = {
  slug: 'landmarks',
  icon: '🗿',
  playPath: '/play/classic',
  publishedAt: '2026-11-19',
  updatedAt: '2026-11-19',
  text: {
    es: {
      title: 'Mapa Lugares icónicos: guía y pistas',
      description:
        'Cómo jugar el mapa Lugares icónicos de GeoQuests: más de 500 monumentos, maravillas naturales y sitios famosos del mundo, y cómo sumar puntos aunque no los reconozcas.',
      sections: [
        {
          paragraphs: [
            'En el mapa Lugares icónicos aparecés junto a un monumento, una maravilla natural o un sitio famoso: del Coliseo a Machu Picchu, de la Torre Eiffel a Uluru. Son más de 500 lugares en todo el mundo, así que es muy difícil que se repitan. Es el mapa más "turístico" de GeoQuests y, para muchos jugadores, el más lindo para recorrer.'
          ]
        },
        {
          title: 'Cuando lo reconocés',
          paragraphs: [
            'Si sabés qué lugar es, el desafío pasa a ser la precisión. Muchos sitios son grandes (un parque nacional, una muralla, una catedral con su plaza) y la cámara puede estar a varios cientos de metros del punto más famoso. Antes de poner el pin, girá la cámara para ubicar el monumento respecto de vos: si lo ves al norte, tu pin va un poco al sur. En este mapa hay un logro especial por quedar a menos de 2 km en varias rondas, y vale la pena perseguirlo.'
          ]
        },
        {
          title: 'Cuando no lo reconocés',
          paragraphs: [
            'Va a pasar seguido: hay templos, fortalezas y paisajes que casi nadie conoce de nombre. En ese caso, jugá como en cualquier otro mapa:'
          ],
          list: [
            'Buscá carteles turísticos: casi todos los sitios famosos tienen paneles informativos, boleterías o señales marrones que indican el nombre.',
            'Fijate en los visitantes y los vehículos: los micros de turismo, las patentes y el lado de manejo siguen funcionando.',
            'Leé el paisaje: un desierto rojo, una selva o montañas nevadas reducen mucho las opciones.',
            'Pensá en el estilo: la arquitectura religiosa (pagodas, mezquitas, iglesias ortodoxas, templos hindúes) es una pista muy fuerte del país o la región.'
          ]
        },
        {
          title: 'Tipos de lugares que aparecen',
          paragraphs: [],
          list: [
            'Monumentos y edificios históricos: castillos, catedrales, templos, palacios y ruinas antiguas.',
            'Maravillas naturales: cascadas, cañones, glaciares, volcanes y formaciones rocosas.',
            'Íconos modernos: puentes, torres, estadios y rascacielos famosos.',
            'Sitios arqueológicos y ciudades históricas declaradas patrimonio de la humanidad.'
          ]
        },
        {
          title: 'Aprender jugando',
          paragraphs: [
            'Lugares icónicos es también el mapa que más enseña. Cada resultado te muestra el nombre del lugar: tomate unos segundos para mirar dónde queda y qué es. Muchos de estos sitios aparecen además en el modo Detective, donde el ladrón viaja entre lugares famosos, así que conocerlos te va a dar ventaja en los dos modos.'
          ]
        }
      ]
    },
    en: {
      title: 'Landmarks map: guide and clues',
      description:
        'How to play the GeoQuests Landmarks map: more than 500 monuments, natural wonders and famous sites around the world, and how to score even when you do not recognize them.',
      sections: [
        {
          paragraphs: [
            'On the Landmarks map you land next to a monument, a natural wonder or a famous site: from the Colosseum to Machu Picchu, from the Eiffel Tower to Uluru. There are more than 500 places around the world, so repeats are very rare. It is the most "touristic" map in GeoQuests and, for many players, the most beautiful one to explore.'
          ]
        },
        {
          title: 'When you recognize it',
          paragraphs: [
            'If you know the place, the challenge becomes precision. Many sites are big (a national park, a wall, a cathedral with its square) and the camera can be several hundred meters from the most famous spot. Before dropping the pin, turn the camera to place the monument relative to you: if you see it to the north, your pin goes a little to the south. This map has a special achievement for landing within 2 km in several rounds, and it is worth chasing.'
          ]
        },
        {
          title: 'When you do not recognize it',
          paragraphs: [
            'It will happen often: there are temples, fortresses and landscapes almost nobody knows by name. In that case, play as you would on any other map:'
          ],
          list: [
            'Look for tourist signs: almost every famous site has information panels, ticket offices or brown signs with its name.',
            'Look at visitors and vehicles: tour buses, license plates and the driving side still work.',
            'Read the landscape: a red desert, a jungle or snowy mountains narrow the options a lot.',
            'Think about style: religious architecture (pagodas, mosques, Orthodox churches, Hindu temples) is a very strong clue to the country or region.'
          ]
        },
        {
          title: 'Kinds of places you will find',
          paragraphs: [],
          list: [
            'Monuments and historic buildings: castles, cathedrals, temples, palaces and ancient ruins.',
            'Natural wonders: waterfalls, canyons, glaciers, volcanoes and rock formations.',
            'Modern icons: famous bridges, towers, stadiums and skyscrapers.',
            'Archaeological sites and historic cities listed as World Heritage.'
          ]
        },
        {
          title: 'Learning by playing',
          paragraphs: [
            'Landmarks is also the map that teaches the most. Every result shows you the name of the place: take a few seconds to see where it is and what it is. Many of these sites also appear in Detective mode, where the thief travels between famous places, so knowing them gives you an edge in both modes.'
          ]
        }
      ]
    }
  }
}
