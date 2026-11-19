import { Article } from '@/app/(public)/models/Article'

export const spainGuide: Article = {
  slug: 'spain',
  icon: '🇪🇸',
  playPath: '/play/classic',
  publishedAt: '2026-11-19',
  updatedAt: '2026-11-19',
  text: {
    es: {
      title: 'Mapa España: guía y pistas por región',
      description:
        'Cómo jugar el mapa España de GeoQuests: aparecés en cualquier lugar de la España peninsular, de Galicia a Andalucía. Pistas para reconocer cada comunidad.',
      sections: [
        {
          paragraphs: [
            'En el mapa España podés aparecer en cualquier lugar de la España peninsular, de Galicia a Andalucía y de Cataluña a Extremadura. Las islas (Baleares y Canarias) no entran. Como el punto se sortea dentro del contorno del país, vas a recorrer tanto ciudades como pueblos, carreteras secundarias y campos de cultivo.'
          ]
        },
        {
          title: 'El idioma de los carteles',
          paragraphs: [
            'España tiene varias lenguas cooficiales, y los carteles son la pista más rápida para ubicar la comunidad:'
          ],
          list: [
            'Catalán en Cataluña (y valenciano en la Comunidad Valenciana): palabras como "carrer", "avinguda", "sortida" o la l·l.',
            'Gallego en Galicia: "rúa", "praza", "concello" y la letra x en muchas palabras.',
            'Euskera en el País Vasco y el norte de Navarra: muchas k, tx y tz, como en "kalea" (calle) o "irteera" (salida).',
            'Solo castellano: el resto del país, incluidas Madrid, las dos Castillas, Andalucía, Aragón, Extremadura y Murcia.'
          ]
        },
        {
          title: 'El paisaje de cada zona',
          paragraphs: [],
          list: [
            'Norte atlántico (Galicia, Asturias, Cantabria, País Vasco): todo muy verde, lluvia, eucaliptos, casas de piedra y hórreos en Galicia y Asturias.',
            'Meseta central (las Castillas, Madrid): llanuras enormes de cereal, tierra ocre, pueblos compactos con una iglesia en el centro.',
            'Andalucía: olivares hasta el horizonte, pueblos blancos y mucho sol; sierras en el interior.',
            'Costa mediterránea (Cataluña, Valencia, Murcia): naranjos, urbanizaciones de veraneo, palmeras y sierras secas detrás de la costa.',
            'Pirineos y Aragón: montañas altas al norte y paisaje semidesértico en el valle del Ebro.'
          ]
        },
        {
          title: 'Carreteras y señales',
          paragraphs: [
            'Las autovías se identifican con la letra A y un número (A-1, A-7…) y las autopistas de peaje con AP. Las antiguas carreteras nacionales llevan la letra N, y las autonómicas usan siglas propias de cada comunidad, que te dicen dónde estás. Los mojones kilométricos y los carteles azules o verdes con distancias a las ciudades son, como en cualquier país, la forma más precisa de afinar el pin. Las señales de stop dicen STOP, no PARE: si ves un PARE, no estás en España.'
          ]
        },
        {
          title: 'Consejo final',
          paragraphs: [
            'España mide alrededor de 1.000 km de punta a punta, así que acertar la comunidad ya asegura un buen puntaje. Si ves verde y lluvia, pensá en el norte; si ves olivos y casas blancas, en el sur; y si ves llanura infinita de trigo, en la Meseta. Después, el idioma de los carteles termina de resolverlo.'
          ]
        }
      ]
    },
    en: {
      title: 'Spain map: guide and clues by region',
      description:
        'How to play the GeoQuests Spain map: you can land anywhere in mainland Spain, from Galicia to Andalusia. Clues to recognize each region.',
      sections: [
        {
          paragraphs: [
            'On the Spain map you can land anywhere in mainland Spain, from Galicia to Andalusia and from Catalonia to Extremadura. The islands (the Balearics and the Canaries) are not included. Since the point is drawn inside the outline of the country, you will explore cities as well as villages, minor roads and farmland.'
          ]
        },
        {
          title: 'The language of the signs',
          paragraphs: ['Spain has several co-official languages, and signs are the fastest clue to place the region:'],
          list: [
            'Catalan in Catalonia (and Valencian in the Valencian Community): words such as "carrer", "avinguda", "sortida" or the l·l.',
            'Galician in Galicia: "rúa", "praza", "concello" and the letter x in many words.',
            'Basque in the Basque Country and northern Navarre: lots of k, tx and tz, as in "kalea" (street) or "irteera" (exit).',
            'Spanish only: the rest of the country, including Madrid, the two Castiles, Andalusia, Aragon, Extremadura and Murcia.'
          ]
        },
        {
          title: 'The landscape of each area',
          paragraphs: [],
          list: [
            'Atlantic north (Galicia, Asturias, Cantabria, Basque Country): very green, rainy, eucalyptus, stone houses and hórreos (raised granaries) in Galicia and Asturias.',
            'Central plateau (the Castiles, Madrid): huge cereal plains, ocher soil, compact villages with a church in the middle.',
            'Andalusia: olive groves to the horizon, white villages and lots of sun; mountain ranges inland.',
            'Mediterranean coast (Catalonia, Valencia, Murcia): orange groves, holiday developments, palm trees and dry hills behind the coast.',
            'Pyrenees and Aragon: high mountains to the north and semi-desert landscape in the Ebro valley.'
          ]
        },
        {
          title: 'Roads and signs',
          paragraphs: [
            'Motorways are marked with the letter A and a number (A-1, A-7…), and toll motorways with AP. The old national roads carry the letter N, and regional roads use abbreviations specific to each region, which tell you where you are. Kilometer markers and blue or green signs with distances to cities are, as in any country, the most precise way to fine-tune the pin. Stop signs read STOP, not PARE: if you see a PARE, you are not in Spain.'
          ]
        },
        {
          title: 'Final tip',
          paragraphs: [
            'Spain is about 1,000 km from end to end, so getting the region right already secures a good score. If you see green and rain, think north; if you see olive trees and white houses, south; and if you see endless wheat plains, the plateau. Then the language of the signs settles it.'
          ]
        }
      ]
    }
  }
}
