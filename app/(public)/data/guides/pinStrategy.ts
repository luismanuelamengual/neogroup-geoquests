import { Article } from '@/app/(public)/models/Article'

export const pinStrategyGuide: Article = {
  slug: 'pin-strategy',
  icon: '📍',
  publishedAt: '2026-10-26',
  updatedAt: '2026-10-26',
  text: {
    es: {
      title: 'Dónde poner el pin: estrategia para sumar más puntos',
      description:
        'Cómo funciona el puntaje de GeoQuests y qué conviene hacer cuando dudás: arriesgar, cubrirte o usar el tiempo para buscar más pistas.',
      sections: [
        {
          paragraphs: [
            'Reconocer el lugar es solo la mitad del juego. La otra mitad es decidir dónde poner el pin cuando no estás seguro, que es la mayoría de las veces. Entender cómo se calcula el puntaje te ayuda a tomar mejores decisiones y a sumar miles de puntos más por partida.'
          ]
        },
        {
          title: 'Cómo se calcula el puntaje',
          paragraphs: [
            'En GeoQuests cada ronda vale hasta 5.000 puntos, que se llevan completos los pines a menos de 25 metros del lugar exacto. A partir de ahí el puntaje baja de forma exponencial: cada kilómetro extra quita un porcentaje de lo que te quedaba, y no una cantidad fija. Con la escala estándar del juego, estos son algunos valores aproximados:'
          ],
          list: [
            'A 1 km: unos 4.985 puntos.',
            'A 10 km: unos 4.850 puntos.',
            'A 50 km: unos 4.290 puntos.',
            'A 100 km: unos 3.680 puntos.',
            'A 300 km: unos 1.990 puntos.',
            'A 500 km: unos 1.080 puntos.',
            'A 1.000 km: unos 230 puntos.'
          ]
        },
        {
          title: 'La lección: el país vale más que la calle',
          paragraphs: [
            'Mirá esos números con atención. Pasar de 10 km a 1 km te da apenas unos 135 puntos más, pero pasar de 500 km a 100 km te da unos 2.600. Es decir: acertar la región correcta vale muchísimo más que afinar la ubicación exacta. Antes de pasar un minuto buscando el nombre de una calle, asegurate de estar en el país y en la zona correcta.',
            'La excepción son los mapas de una sola ciudad o de lugares icónicos, donde todos suelen acertar la región y la diferencia se hace en los últimos kilómetros.'
          ]
        },
        {
          title: '¿Arriesgar o cubrirse?',
          paragraphs: [
            'Supongamos que dudás entre dos lugares a unos 1.700 km de distancia, por ejemplo Lisboa y Milán. Si ponés el pin en uno y acertás, sacás muchos puntos; si no, casi nada. Si lo ponés en el medio, vas a quedar a unos 850 km de cualquiera de los dos: alrededor de 370 puntos, pase lo que pase.',
            'Con una curva exponencial como esta, en general conviene jugársela por la opción más probable: el premio por acertar es muy grande y el pin del medio da poco. Cubrirse tiene sentido sobre todo cuando las dos opciones están cerca (por ejemplo, dos ciudades vecinas) o en el Battle Royale, donde lo importante es no quedar último.'
          ]
        },
        {
          title: 'Usar bien el tiempo',
          paragraphs: ['Con 3 minutos por ronda tenés más tiempo del que parece. Un buen reparto:'],
          list: [
            'Los primeros 20 segundos: mirá alrededor sin moverte y decidí el continente y el país probable.',
            'Hasta el minuto y medio: caminá buscando algo escrito o un cruce importante.',
            'Antes de los 2 minutos: poné un pin provisorio en tu mejor opción. Si se termina el tiempo, se envía ese.',
            'El resto: afiná la ubicación en el mapa usando rutas, ríos o la costa como referencia.'
          ]
        },
        {
          title: 'Afinar en el mapa',
          paragraphs: [
            'Una vez que sabés el país, el mapa también tiene pistas. Si la calle está junto al mar, poné el pin en la costa y no en el interior. Si ves montañas al fondo, buscá las zonas montañosas del país. Si estás en una ruta importante con mucho tránsito, probablemente estés cerca de una ciudad grande, que es donde más imágenes de Street View hay. Y si leíste el nombre de una ciudad en un cartel con una distancia ("Córdoba 45"), calculá la dirección y poné el pin a esa distancia.'
          ]
        },
        {
          title: 'Resumen',
          list: [
            'Primero la región, después el detalle.',
            'Ante una duda entre dos lugares lejanos, elegí el más probable.',
            'Poné siempre un pin provisorio antes de que se termine el tiempo.',
            'Usá la costa, los ríos y las montañas para afinar la ubicación.'
          ],
          paragraphs: []
        }
      ]
    },
    en: {
      title: 'Where to drop the pin: strategy to score more points',
      description:
        'How GeoQuests scoring works and what to do when you are unsure: take a risk, hedge, or use the time to look for more clues.',
      sections: [
        {
          paragraphs: [
            'Recognizing the place is only half of the game. The other half is deciding where to drop the pin when you are not sure, which is most of the time. Understanding how the score is calculated helps you make better decisions and add thousands of points per game.'
          ]
        },
        {
          title: 'How the score is calculated',
          paragraphs: [
            "In GeoQuests every round is worth up to 5,000 points, awarded in full to pins within 25 meters of the exact spot. From there the score decays exponentially: every extra kilometer takes away a percentage of what you had left, not a fixed amount. On the game's standard scale, these are some approximate values:"
          ],
          list: [
            'At 1 km: about 4,985 points.',
            'At 10 km: about 4,850 points.',
            'At 50 km: about 4,290 points.',
            'At 100 km: about 3,680 points.',
            'At 300 km: about 1,990 points.',
            'At 500 km: about 1,080 points.',
            'At 1,000 km: about 230 points.'
          ]
        },
        {
          title: 'The lesson: the country is worth more than the street',
          paragraphs: [
            'Look at those numbers carefully. Going from 10 km to 1 km gives you barely 135 extra points, but going from 500 km to 100 km gives you about 2,600. In other words, getting the right region is worth far more than fine-tuning the exact spot. Before spending a minute looking for a street name, make sure you are in the right country and area.',
            'The exception is single-city or landmark maps, where most players get the region right and the difference is made in the last few kilometers.'
          ]
        },
        {
          title: 'Take a risk or hedge?',
          paragraphs: [
            'Say you are torn between two places about 1,700 km apart, for example Lisbon and Milan. If you drop the pin on one and you are right, you score a lot; if not, almost nothing. If you drop it in the middle, you will be about 850 km from either one: around 370 points, whatever happens.',
            'With an exponential curve like this one, it usually pays to commit to the most likely option: the reward for being right is huge and the middle pin gives little. Hedging makes sense mainly when both options are close (for example, two neighboring cities) or in Battle Royale, where what matters is not finishing last.'
          ]
        },
        {
          title: 'Using your time well',
          paragraphs: ['With 3 minutes per round you have more time than it seems. A good split:'],
          list: [
            'The first 20 seconds: look around without moving and decide the continent and the likely country.',
            'Up to a minute and a half: walk looking for something written or a major junction.',
            'Before the 2-minute mark: drop a provisional pin on your best option. If time runs out, that one is submitted.',
            'The rest: fine-tune the location on the map using roads, rivers or the coastline as references.'
          ]
        },
        {
          title: 'Fine-tuning on the map',
          paragraphs: [
            'Once you know the country, the map has clues too. If the street is by the sea, drop the pin on the coast and not inland. If you see mountains in the background, look for the mountainous areas of the country. If you are on a major road with heavy traffic, you are probably near a big city, which is where Street View coverage is densest. And if you read the name of a city on a sign with a distance ("Córdoba 45"), work out the direction and drop the pin at that distance.'
          ]
        },
        {
          title: 'Summary',
          list: [
            'Region first, details later.',
            'When torn between two places far apart, pick the most likely one.',
            'Always drop a provisional pin before time runs out.',
            'Use the coast, rivers and mountains to fine-tune the location.'
          ],
          paragraphs: []
        }
      ]
    }
  }
}
