import { Article } from '@/app/(public)/models/Article'

export const worldCitiesGuide: Article = {
  slug: 'world-cities',
  icon: '🌍',
  playPath: '/play/classic',
  publishedAt: '2026-11-19',
  updatedAt: '2026-11-19',
  text: {
    es: {
      title: 'Mapa Ciudades del mundo: guía y pistas',
      description:
        'Cómo jugar el mapa Ciudades del mundo de GeoQuests: 150 ciudades de 36 países, de capitales a ciudades chicas, y las pistas para reconocer cada región.',
      sections: [
        {
          paragraphs: [
            'Ciudades del mundo es el mapa más completo de GeoQuests y el que mejor representa el juego. Tiene 150 ciudades de 36 países: no solo capitales y destinos turísticos, sino también ciudades medianas y chicas que pocos conocen. Por eso no alcanza con reconocer monumentos: hay que leer la calle.'
          ]
        },
        {
          title: 'Qué países aparecen',
          paragraphs: [
            'Los países con más ciudades son Estados Unidos, Japón, Italia, Francia, España, Brasil y la Argentina. También hay varias ciudades de México, el Reino Unido, Australia, Alemania, Chile, Canadá, Sudáfrica, Portugal, Polonia, Perú, Nueva Zelanda, los Países Bajos, Colombia y Bélgica, y algunas de Uruguay, Tailandia, Suecia, Irlanda, Suiza, Austria, Taiwán, Noruega, Grecia, Finlandia, Dinamarca, la República Checa, Turquía, Islandia y Hungría.',
            'Saber que estos son los únicos países posibles ya es una pista enorme: si ves alfabeto cirílico, por ejemplo, no hay ninguna ciudad que coincida, así que probablemente sea un cartel de un comercio y no te tiene que distraer.'
          ]
        },
        {
          title: 'Un orden para pensar cada ronda',
          paragraphs: [],
          list: [
            'Lado de manejo: por la izquierda solo quedan el Reino Unido, Irlanda, Japón, Tailandia, Australia, Nueva Zelanda y Sudáfrica.',
            'Escritura: japonés, tailandés, chino tradicional (Taiwán), griego o el resto con alfabeto latino.',
            'Idioma: con alfabeto latino, el idioma de los carteles reduce todo a uno o dos países.',
            'Ciudad: las ciudades de cada país son pocas, así que conviene aprender las de los países que más aparecen.'
          ]
        },
        {
          title: 'Pistas por región',
          paragraphs: [],
          list: [
            'Japón: calles angostas sin veredas marcadas, postes de luz de concreto con muchos cables, máquinas expendedoras y carteles en kanji y kana.',
            'Escandinavia y Finlandia: casas de madera pintadas, mucho verde, bicicletas y letras como å, ä, ö o ø.',
            'Europa del Este: en Polonia, Chequia y Hungría, edificios de departamentos de la época socialista junto a cascos históricos muy cuidados.',
            'Oceanía: casas bajas con techos de chapa y grandes jardines en Australia y Nueva Zelanda; en Nueva Zelanda, colinas muy verdes y muchos nombres de lugares en maorí.',
            'Sudáfrica: manejo por la izquierda, casas con muros altos y alambrado, y vegetación seca en buena parte del año.'
          ]
        },
        {
          title: 'Consejo para subir el puntaje',
          paragraphs: [
            'En este mapa la mayor parte de los puntos se pierden por equivocarse de país, no por quedar lejos dentro de la ciudad. Si dudás entre dos países, quedate un rato más mirando la calle antes de abrir el mapa: un solo cartel resuelve más que cualquier intuición. Es el mapa recomendado para la primera semana del plan de práctica de nuestras guías.'
          ]
        }
      ]
    },
    en: {
      title: 'World cities map: guide and clues',
      description:
        'How to play the GeoQuests World cities map: 150 cities in 36 countries, from capitals to small towns, and the clues to recognize each region.',
      sections: [
        {
          paragraphs: [
            'World cities is the most complete map in GeoQuests and the one that best represents the game. It has 150 cities in 36 countries: not only capitals and tourist destinations, but also medium-sized and small cities few people know. That is why recognizing monuments is not enough: you have to read the street.'
          ]
        },
        {
          title: 'Which countries appear',
          paragraphs: [
            'The countries with the most cities are the United States, Japan, Italy, France, Spain, Brazil and Argentina. There are also several cities in Mexico, the United Kingdom, Australia, Germany, Chile, Canada, South Africa, Portugal, Poland, Peru, New Zealand, the Netherlands, Colombia and Belgium, and a few in Uruguay, Thailand, Sweden, Ireland, Switzerland, Austria, Taiwan, Norway, Greece, Finland, Denmark, the Czech Republic, Turkey, Iceland and Hungary.',
            'Knowing these are the only possible countries is already a huge clue: if you see Cyrillic, for example, no city matches, so it is probably a shop sign and should not distract you.'
          ]
        },
        {
          title: 'An order to think through each round',
          paragraphs: [],
          list: [
            'Driving side: on the left, only the United Kingdom, Ireland, Japan, Thailand, Australia, New Zealand and South Africa remain.',
            'Script: Japanese, Thai, traditional Chinese (Taiwan), Greek, or the rest with the Latin alphabet.',
            'Language: with the Latin alphabet, the language of the signs narrows everything down to one or two countries.',
            'City: each country has only a few cities, so it pays to learn those of the countries that appear most.'
          ]
        },
        {
          title: 'Clues by region',
          paragraphs: [],
          list: [
            'Japan: narrow streets without marked sidewalks, concrete utility poles with lots of cables, vending machines and signs in kanji and kana.',
            'Scandinavia and Finland: painted wooden houses, lots of greenery, bicycles and letters such as å, ä, ö or ø.',
            'Eastern Europe: in Poland, Czechia and Hungary, socialist-era apartment blocks next to well-kept historic centers.',
            'Oceania: low houses with metal roofs and big gardens in Australia and New Zealand; in New Zealand, very green hills and many Māori place names.',
            'South Africa: left-hand traffic, houses with high walls and fencing, and dry vegetation for much of the year.'
          ]
        },
        {
          title: 'Tip to raise your score',
          paragraphs: [
            'On this map most points are lost by getting the country wrong, not by landing far away within the city. If you are torn between two countries, spend a little longer looking at the street before opening the map: a single sign settles more than any hunch. It is the recommended map for the first week of the practice plan in our guides.'
          ]
        }
      ]
    }
  }
}
