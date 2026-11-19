import { Article } from '@/app/(public)/models/Article'

export const argentinaGuide: Article = {
  slug: 'argentina',
  icon: '🇦🇷',
  playPath: '/play/classic',
  publishedAt: '2026-11-19',
  updatedAt: '2026-11-19',
  text: {
    es: {
      title: 'Mapa Argentina: guía y pistas por región',
      description:
        'Cómo jugar el mapa Argentina de GeoQuests: aparecés en cualquier lugar del país continental, de la Puna a Santa Cruz. Pistas para reconocer cada región.',
      sections: [
        {
          paragraphs: [
            'En el mapa Argentina podés aparecer en cualquier lugar de la Argentina continental, de la Puna jujeña a Santa Cruz y de la cordillera al Río de la Plata. No hay ciudades elegidas: el punto se sortea dentro del contorno del país, así que muchas rondas te van a dejar en una ruta en medio del campo. Como ya sabés el país, todo el juego está en reconocer la región.'
          ]
        },
        {
          title: 'Las grandes regiones',
          paragraphs: [],
          list: [
            'Pampa húmeda (Buenos Aires, sur de Santa Fe y Córdoba, La Pampa): llanura perfecta, campos de soja, trigo o ganado, alambrados y molinos de viento.',
            'Noroeste (Jujuy, Salta, Tucumán, Catamarca, Santiago del Estero): cerros de colores, cardones, quebradas secas y, más al este, selva de montaña muy verde en las yungas.',
            'Cuyo (Mendoza, San Juan, San Luis): la cordillera de los Andes al oeste, viñedos con riego, álamos en hilera y paisaje seco.',
            'Noreste (Misiones, Corrientes, Chaco, Formosa, Entre Ríos): tierra roja, vegetación subtropical, palmeras y ríos enormes.',
            'Patagonia (Neuquén, Río Negro, Chubut, Santa Cruz): estepa amarilla, viento, rutas rectas casi vacías y, en el oeste, lagos y bosques andinos.'
          ]
        },
        {
          title: 'Las rutas, tus mejores aliadas',
          paragraphs: [
            'La mayoría de las rondas rurales ocurren sobre rutas nacionales o provinciales. Las nacionales se señalan con un escudo con la sigla RN y su número, y tienen mojones kilométricos: si encontrás uno, sabés en qué ruta estás y a qué distancia de su origen. Los carteles verdes con nombres de ciudades y distancias, como "Bahía Blanca 85", te dejan casi encima de la respuesta.'
          ]
        },
        {
          title: 'Detalles que delatan la provincia',
          paragraphs: [],
          list: [
            'Los carteles de vialidad provincial suelen llevar el nombre o el escudo de la provincia.',
            'Las patentes son las mismas en todo el país (formato Mercosur o el modelo anterior negro), así que no ayudan con la región.',
            'En las ciudades, las calles con nombres de próceres se repiten en todas partes: buscá mejor carteles de comercios con el nombre de la ciudad o el teléfono con su característica.',
            'El sol es una gran pista: el mediodía siempre llega por el norte, y en el sur del país las sombras son largas incluso en verano.'
          ]
        },
        {
          title: 'El puntaje en un país entero',
          paragraphs: [
            'La Argentina mide más de 3.500 km de norte a sur, así que equivocarse de región cuesta muchísimo. Si dudás entre la Patagonia norte y el sur de la provincia de Buenos Aires, mirá la vegetación y el relieve antes de decidir. Es un mapa ideal para quienes viven en el país y quieren conocer rincones que nunca visitaron.'
          ]
        }
      ]
    },
    en: {
      title: 'Argentina map: guide and clues by region',
      description:
        'How to play the GeoQuests Argentina map: you can land anywhere in mainland Argentina, from the Puna to Santa Cruz. Clues to recognize each region.',
      sections: [
        {
          paragraphs: [
            'On the Argentina map you can land anywhere in mainland Argentina, from the Puna of Jujuy to Santa Cruz and from the Andes to the River Plate. There are no chosen cities: the point is drawn inside the outline of the country, so many rounds will leave you on a road in the middle of the countryside. Since you already know the country, the whole game is about recognizing the region.'
          ]
        },
        {
          title: 'The big regions',
          paragraphs: [],
          list: [
            'Humid Pampas (Buenos Aires, southern Santa Fe and Córdoba, La Pampa): perfectly flat land, soy, wheat or cattle fields, wire fences and windmills.',
            'Northwest (Jujuy, Salta, Tucumán, Catamarca, Santiago del Estero): colorful hills, cardón cacti, dry ravines and, further east, lush mountain forest in the yungas.',
            'Cuyo (Mendoza, San Juan, San Luis): the Andes to the west, irrigated vineyards, rows of poplars and a dry landscape.',
            'Northeast (Misiones, Corrientes, Chaco, Formosa, Entre Ríos): red soil, subtropical vegetation, palm trees and huge rivers.',
            'Patagonia (Neuquén, Río Negro, Chubut, Santa Cruz): yellow steppe, wind, straight and almost empty roads and, in the west, Andean lakes and forests.'
          ]
        },
        {
          title: 'Roads, your best allies',
          paragraphs: [
            'Most rural rounds happen on national or provincial roads. National roads are marked with a shield with the letters RN and their number, and they have kilometer markers: if you find one, you know which road you are on and how far from its start. Green signs with city names and distances, such as "Bahía Blanca 85", leave you almost on top of the answer.'
          ]
        },
        {
          title: 'Details that give away the province',
          paragraphs: [],
          list: [
            'Provincial road signs often carry the name or coat of arms of the province.',
            'License plates are the same across the country (Mercosur format or the older black model), so they do not help with the region.',
            'In cities, streets named after national heroes repeat everywhere: look instead for shop signs with the city name or phone numbers with the local area code.',
            'The sun is a great clue: midday always comes from the north, and in the south of the country shadows are long even in summer.'
          ]
        },
        {
          title: 'Scoring across a whole country',
          paragraphs: [
            'Argentina is more than 3,500 km from north to south, so getting the region wrong is very costly. If you are torn between northern Patagonia and southern Buenos Aires province, check the vegetation and the terrain before deciding. It is an ideal map for people who live in the country and want to discover corners they have never visited.'
          ]
        }
      ]
    }
  }
}
