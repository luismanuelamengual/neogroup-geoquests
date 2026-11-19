import { Article } from '@/app/(public)/models/Article'

export const europeGuide: Article = {
  slug: 'europe',
  icon: '🇪🇺',
  playPath: '/play/classic',
  publishedAt: '2026-11-19',
  updatedAt: '2026-11-19',
  text: {
    es: {
      title: 'Mapa Europa: guía y pistas',
      description:
        'Cómo jugar el mapa Europa de GeoQuests: más de 200 ciudades de Reikiavik a Atenas y de Lisboa a Moscú, y las pistas para distinguir países vecinos.',
      sections: [
        {
          paragraphs: [
            'El mapa Europa tiene más de 200 ciudades, de Reikiavik a Atenas y de Lisboa a Moscú: capitales, pero también ciudades medianas y chicas. Europa es el continente donde más países entran en menos espacio, así que es el mejor gimnasio para aprender a leer idiomas, patentes y detalles de la calle.'
          ]
        },
        {
          title: 'Las patentes, una pista rápida',
          paragraphs: [
            'En los países de la Unión Europea las patentes son blancas y largas, con una franja azul a la izquierda y el código del país (F para Francia, D para Alemania, I para Italia, E para España, P para Portugal, PL para Polonia…). Aunque Street View difumina los números, a veces el código se alcanza a leer. El Reino Unido usa patente amarilla atrás, y los Países Bajos y Luxemburgo, amarillas adelante y atrás. Fuera de la Unión, Noruega y Suiza tienen formatos propios.'
          ]
        },
        {
          title: 'El idioma resuelve casi todo',
          paragraphs: [
            'En Europa, identificar el idioma suele ser identificar el país. Algunas pistas: ł y ż en polaco, ř en checo, ő y ű en húngaro, ș y ț en rumano, æ y ø en danés y noruego, å, ä y ö en sueco, ß en alemán, ij en neerlandés. El cirílico aparece en Rusia, Ucrania, Bielorrusia, Bulgaria, Serbia y Macedonia del Norte, y el griego, en Grecia y Chipre. Nuestra guía de idiomas y alfabetos tiene la lista completa.'
          ]
        },
        {
          title: 'Países que se confunden',
          paragraphs: [],
          list: [
            'España o Portugal: en Portugal, veredas de piedra blanca y negra, azulejos en las fachadas y carteles con ã y ção.',
            'Bélgica o Países Bajos: los dos pueden tener carteles en neerlandés; en Bélgica las patentes son blancas con letras rojas y los adoquines y el ladrillo se ven más gastados.',
            'Alemania o Austria: mismo idioma; los Alpes en el fondo y las casas con balcones de madera apuntan a Austria.',
            'Noruega o Suecia: Noruega tiene fiordos, montañas junto al mar y líneas amarillas en el centro de la ruta; Suecia es más llana, con bosques y lagos.',
            'Chequia o Eslovaquia: idiomas muy parecidos; la ř solo existe en checo.'
          ]
        },
        {
          title: 'Ubicar la ciudad',
          paragraphs: [
            'Una vez que tenés el país, la geografía física ayuda mucho: los Alpes, los Pirineos, la costa mediterránea, el Atlántico o las llanuras del norte cambian por completo el paisaje. Las ciudades europeas suelen tener un casco histórico con una iglesia o catedral en el centro; si estás en calles medievales angostas, probablemente estés cerca del centro, y si ves bloques de departamentos modernos, en la periferia.'
          ]
        },
        {
          title: 'Por qué jugarlo',
          paragraphs: [
            'Es el mapa recomendado para la segunda semana de nuestro plan de práctica. Después de unas cuantas partidas vas a reconocer un cartel polaco, uno húngaro o uno rumano sin dudar, y esa habilidad te va a servir en cualquier otro mapa del juego.'
          ]
        }
      ]
    },
    en: {
      title: 'Europe map: guide and clues',
      description:
        'How to play the GeoQuests Europe map: more than 200 cities from Reykjavík to Athens and from Lisbon to Moscow, and the clues to tell neighboring countries apart.',
      sections: [
        {
          paragraphs: [
            'The Europe map has more than 200 cities, from Reykjavík to Athens and from Lisbon to Moscow: capitals, but also medium-sized and small cities. Europe is the continent that fits the most countries into the least space, so it is the best gym for learning to read languages, license plates and street details.'
          ]
        },
        {
          title: 'License plates, a quick clue',
          paragraphs: [
            'In European Union countries plates are long and white, with a blue strip on the left and the country code (F for France, D for Germany, I for Italy, E for Spain, P for Portugal, PL for Poland…). Even though Street View blurs the numbers, sometimes the code is readable. The United Kingdom uses a yellow rear plate, and the Netherlands and Luxembourg use yellow plates front and back. Outside the Union, Norway and Switzerland have formats of their own.'
          ]
        },
        {
          title: 'Language settles almost everything',
          paragraphs: [
            'In Europe, identifying the language usually means identifying the country. Some clues: ł and ż in Polish, ř in Czech, ő and ű in Hungarian, ș and ț in Romanian, æ and ø in Danish and Norwegian, å, ä and ö in Swedish, ß in German, ij in Dutch. Cyrillic appears in Russia, Ukraine, Belarus, Bulgaria, Serbia and North Macedonia, and Greek in Greece and Cyprus. Our languages and scripts guide has the full list.'
          ]
        },
        {
          title: 'Countries that get mixed up',
          paragraphs: [],
          list: [
            'Spain or Portugal: in Portugal, black-and-white stone sidewalks, tiled facades and signs with ã and ção.',
            'Belgium or the Netherlands: both may have signs in Dutch; Belgian plates are white with red letters, and cobblestones and brick look more weathered.',
            'Germany or Austria: same language; the Alps in the background and houses with wooden balconies point to Austria.',
            'Norway or Sweden: Norway has fjords, mountains by the sea and yellow center lines; Sweden is flatter, with forests and lakes.',
            'Czechia or Slovakia: very similar languages; ř only exists in Czech.'
          ]
        },
        {
          title: 'Placing the city',
          paragraphs: [
            'Once you have the country, physical geography helps a lot: the Alps, the Pyrenees, the Mediterranean coast, the Atlantic or the northern plains completely change the landscape. European cities usually have a historic center with a church or cathedral in the middle; if you are on narrow medieval streets you are probably near the center, and if you see modern apartment blocks, on the outskirts.'
          ]
        },
        {
          title: 'Why play it',
          paragraphs: [
            'It is the recommended map for the second week of our practice plan. After a few games you will recognize a Polish, Hungarian or Romanian sign without hesitation, and that skill will help you on every other map in the game.'
          ]
        }
      ]
    }
  }
}
