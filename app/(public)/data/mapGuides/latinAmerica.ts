import { Article } from '@/app/(public)/models/Article'

export const latinAmericaMapGuide: Article = {
  slug: 'latin-america',
  icon: '🌎',
  playPath: '/play/classic',
  publishedAt: '2026-11-19',
  updatedAt: '2026-11-19',
  text: {
    es: {
      title: 'Mapa Latinoamérica: guía y pistas',
      description:
        'Cómo jugar el mapa Latinoamérica de GeoQuests: más de 100 ciudades de México a Ushuaia y un método para no confundir países que hablan el mismo idioma.',
      sections: [
        {
          paragraphs: [
            'El mapa Latinoamérica recorre la región de punta a punta: más de 100 ciudades de México a Ushuaia, desde grandes capitales como Ciudad de México, Bogotá o Buenos Aires hasta pueblos chicos de la montaña o la costa. Es uno de los mapas más difíciles de GeoQuests, porque la mayoría de los países comparten idioma, lado de manejo y tipo de señales.'
          ]
        },
        {
          title: 'El primer filtro: Brasil o no Brasil',
          paragraphs: [
            'Brasil es el país más grande de la región y el único que habla portugués. Si ves palabras como "rua", "padaria", "farmácia" o letras como ã y ç, ya resolviste el país. Lo difícil viene después: Brasil es enorme, así que conviene fijarse en el clima (selva en el norte, tierra roja y araucarias en el sur, playas tropicales en el nordeste) para elegir la región.'
          ]
        },
        {
          title: 'Entre los países hispanohablantes',
          paragraphs: ['Cuando el idioma es español, estas pistas ayudan a separar países:'],
          list: [
            'México: señales de ALTO en lugar de PARE, carteles de TOPE, tiendas de conveniencia en cada esquina y patentes distintas en cada estado.',
            'Argentina y Uruguay: voseo en carteles y publicidades ("Respetá", "Viví") y patentes Mercosur blancas con franja azul.',
            'Chile: la cordillera muy cerca al este y la costa del Pacífico al oeste; desierto en el norte y bosques y lagos en el sur.',
            'Perú y Bolivia: ciudades en altura, cerros secos y mototaxis; la costa peruana es un desierto que llega al mar.',
            'Colombia y Ecuador: montañas tropicales muy verdes y ciudades sobre las laderas.'
          ]
        },
        {
          title: 'Ubicar la ciudad',
          paragraphs: [
            'Una vez que tenés el país, mirá el relieve y la vegetación: en casi todos los países latinoamericanos la diferencia entre la costa, la montaña y el interior es enorme. Los carteles de rutas con distancias a otras ciudades son oro: un "Mendoza 120" o "Cusco 45" te deja a pocos kilómetros. Y si ves el mar, recordá de qué lado del continente está cada país: Chile y Perú miran al Pacífico; Uruguay, Argentina y Brasil, al Atlántico.'
          ]
        },
        {
          title: 'Para seguir aprendiendo',
          paragraphs: [
            'En nuestras guías tenés un artículo dedicado a cómo distinguir los países de Latinoamérica, con más detalle sobre cada uno. Si sos de la región, este mapa es una gran forma de conocer las ciudades vecinas y de descubrir cuánto se parecen, y cuánto se diferencian, los países que comparten historia e idioma.'
          ]
        }
      ]
    },
    en: {
      title: 'Latin America map: guide and clues',
      description:
        'How to play the GeoQuests Latin America map: more than 100 cities from Mexico to Ushuaia and a method to avoid mixing up countries that speak the same language.',
      sections: [
        {
          paragraphs: [
            'The Latin America map covers the region from end to end: more than 100 cities from Mexico to Ushuaia, from big capitals such as Mexico City, Bogotá or Buenos Aires to small mountain and coastal towns. It is one of the hardest maps in GeoQuests, because most countries share a language, the driving side and the style of road signs.'
          ]
        },
        {
          title: 'The first filter: Brazil or not Brazil',
          paragraphs: [
            'Brazil is the largest country in the region and the only one that speaks Portuguese. If you see words such as "rua", "padaria", "farmácia" or letters such as ã and ç, you have the country. The hard part comes next: Brazil is huge, so look at the climate (jungle in the north, red soil and araucaria trees in the south, tropical beaches in the northeast) to choose the region.'
          ]
        },
        {
          title: 'Among the Spanish-speaking countries',
          paragraphs: ['When the language is Spanish, these clues help separate countries:'],
          list: [
            'Mexico: ALTO signs instead of PARE, TOPE (speed bump) signs, convenience stores on every corner and different license plates in each state.',
            'Argentina and Uruguay: voseo on signs and ads ("Respetá", "Viví") and white Mercosur plates with a blue strip.',
            'Chile: the Andes very close to the east and the Pacific coast to the west; desert in the north, forests and lakes in the south.',
            'Peru and Bolivia: high-altitude cities, dry hills and mototaxis; the Peruvian coast is a desert that runs down to the sea.',
            'Colombia and Ecuador: very green tropical mountains and cities on the slopes.'
          ]
        },
        {
          title: 'Placing the city',
          paragraphs: [
            'Once you have the country, look at the terrain and vegetation: in almost every Latin American country the difference between the coast, the mountains and the interior is huge. Road signs with distances to other cities are gold: a "Mendoza 120" or "Cusco 45" leaves you a few kilometers away. And if you see the sea, remember which side of the continent each country is on: Chile and Peru face the Pacific; Uruguay, Argentina and Brazil, the Atlantic.'
          ]
        },
        {
          title: 'Keep learning',
          paragraphs: [
            'Our guides include an article devoted to telling Latin American countries apart, with more detail about each one. If you are from the region, this map is a great way to get to know neighboring cities and to discover how much the countries that share history and language look alike, and how much they differ.'
          ]
        }
      ]
    }
  }
}
