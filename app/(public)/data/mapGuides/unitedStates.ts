import { Article } from '@/app/(public)/models/Article'

export const unitedStatesGuide: Article = {
  slug: 'united-states',
  icon: '🇺🇸',
  playPath: '/play/classic',
  publishedAt: '2026-11-19',
  updatedAt: '2026-11-19',
  text: {
    es: {
      title: 'Mapa Estados Unidos: guía y pistas por región',
      description:
        'Cómo jugar el mapa Estados Unidos de GeoQuests: aparecés en cualquiera de los 48 estados continentales. Pistas para reconocer cada región por sus rutas, paisajes y patentes.',
      sections: [
        {
          paragraphs: [
            'En el mapa Estados Unidos podés aparecer en cualquier lugar de los 48 estados continentales: de Maine a California y de Washington a Florida. Alaska y Hawái no están. Es un país enorme y muy variado, y como el punto se sortea dentro de todo el territorio, vas a ver tanto suburbios y pueblos chicos como rutas rurales interminables.'
          ]
        },
        {
          title: 'Las rutas te dicen dónde estás',
          paragraphs: [
            'El sistema de rutas de Estados Unidos es muy fácil de leer. Las interestatales tienen un escudo rojo y azul; las que van de norte a sur tienen números impares, que crecen de oeste a este (la I-5 está en la costa del Pacífico y la I-95 en la del Atlántico), y las que van de este a oeste tienen números pares, que crecen de sur a norte (la I-10 cruza el sur y la I-90 el norte). Las rutas estatales usan señales con la forma o el símbolo de cada estado, una pista excelente si la reconocés.'
          ]
        },
        {
          title: 'Las patentes',
          paragraphs: [
            'Cada estado tiene su propio diseño de patente, y aunque los números estén difuminados, los colores se ven. Además, varios estados (como Florida, Arizona, Georgia o Michigan) no exigen patente adelante: si los autos estacionados solo tienen patente atrás, eso reduce las opciones.'
          ]
        },
        {
          title: 'Las grandes regiones',
          paragraphs: [],
          list: [
            'Nueva Inglaterra y el noreste: casas de madera blancas, iglesias con campanario, bosques de arces y pueblos antiguos.',
            'El sur: calor, humedad, robles con musgo colgante, iglesias bautistas y casas con porches.',
            'El medio oeste y las grandes llanuras: maíz y trigo hasta el horizonte, silos, graneros rojos y rutas que forman una cuadrícula perfecta.',
            'El suroeste: desierto, cactus, mesetas rojas y casas de estilo adobe en Nuevo México y Arizona.',
            'Las Montañas Rocosas: picos altos, pinos y pueblos de montaña en Colorado, Wyoming o Montana.',
            'La costa oeste: bosques húmedos de coníferas en Washington y Oregón; colinas doradas y palmeras en California.'
          ]
        },
        {
          title: 'Afinar el pin',
          paragraphs: [
            'En los pueblos, los carteles de comercios y las patentes de las patrullas de policía suelen llevar el nombre del condado o de la ciudad. En las rutas, los carteles verdes de salida con distancias a la próxima ciudad son la mejor referencia. Estados Unidos mide más de 4.000 km de costa a costa, así que acertar la región es lo que más puntos suma: no pierdas tiempo buscando el nombre de una calle si todavía no sabés si estás en Texas o en Ohio.'
          ]
        }
      ]
    },
    en: {
      title: 'United States map: guide and clues by region',
      description:
        'How to play the GeoQuests United States map: you can land in any of the 48 contiguous states. Clues to recognize each region by its roads, landscapes and plates.',
      sections: [
        {
          paragraphs: [
            'On the United States map you can land anywhere in the 48 contiguous states: from Maine to California and from Washington to Florida. Alaska and Hawaii are not included. It is a huge, varied country, and since the point is drawn across the whole territory, you will see suburbs and small towns as well as endless rural roads.'
          ]
        },
        {
          title: 'Roads tell you where you are',
          paragraphs: [
            'The US road system is very easy to read. Interstates have a red and blue shield; north–south ones have odd numbers that grow from west to east (I-5 runs along the Pacific coast and I-95 along the Atlantic), and east–west ones have even numbers that grow from south to north (I-10 crosses the south and I-90 the north). State routes use signs with the shape or symbol of each state, an excellent clue if you recognize it.'
          ]
        },
        {
          title: 'License plates',
          paragraphs: [
            'Every state has its own plate design, and even with the numbers blurred, the colors are visible. Also, several states (such as Florida, Arizona, Georgia or Michigan) do not require a front plate: if parked cars only have a rear plate, that narrows the options.'
          ]
        },
        {
          title: 'The big regions',
          paragraphs: [],
          list: [
            'New England and the Northeast: white wooden houses, churches with steeples, maple forests and old towns.',
            'The South: heat, humidity, oaks draped in Spanish moss, Baptist churches and houses with porches.',
            'The Midwest and the Great Plains: corn and wheat to the horizon, silos, red barns and roads forming a perfect grid.',
            'The Southwest: desert, cacti, red mesas and adobe-style houses in New Mexico and Arizona.',
            'The Rocky Mountains: high peaks, pines and mountain towns in Colorado, Wyoming or Montana.',
            'The West Coast: damp conifer forests in Washington and Oregon; golden hills and palm trees in California.'
          ]
        },
        {
          title: 'Fine-tuning the pin',
          paragraphs: [
            'In towns, shop signs and police cars often carry the name of the county or city. On highways, green exit signs with distances to the next city are the best reference. The United States is more than 4,000 km from coast to coast, so getting the region right is what scores the most: do not waste time looking for a street name if you still do not know whether you are in Texas or Ohio.'
          ]
        }
      ]
    }
  }
}
