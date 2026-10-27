import { Article } from '@/app/(public)/models/Article'

export const languagesAndScriptsGuide: Article = {
  slug: 'languages-and-scripts',
  icon: '🔤',
  publishedAt: '2026-10-26',
  updatedAt: '2026-10-26',
  text: {
    es: {
      title: 'Idiomas y alfabetos: cómo reconocer un país por lo que está escrito',
      description:
        'Una guía práctica para identificar alfabetos (cirílico, griego, árabe, hangul…) y distinguir idiomas que usan el alfabeto latino por sus letras especiales.',
      sections: [
        {
          paragraphs: [
            'Un cartel, una vidriera o el nombre de una calle pueden resolver una ronda en segundos, aunque no entiendas el idioma. No hace falta leer: alcanza con reconocer el sistema de escritura y algunas letras características. Esta guía te da un mapa mental para hacerlo.'
          ]
        },
        {
          title: 'Primero, el alfabeto',
          paragraphs: ['Antes de pensar en el idioma, preguntate qué tipo de escritura estás viendo:'],
          list: [
            'Cirílico (letras como Ж, Я, Д, И): Rusia, Ucrania, Bielorrusia, Bulgaria, Serbia, Macedonia del Norte, Kazajistán, Kirguistán y Mongolia, entre otros.',
            'Griego (Σ, Ω, Δ, λ): Grecia y Chipre.',
            'Árabe (escritura de derecha a izquierda, con letras unidas): el norte de África y Medio Oriente.',
            'Hebreo (letras cuadradas, de derecha a izquierda, sin unir): Israel.',
            'Hangul (sílabas armadas con círculos y trazos rectos, como 한국): Corea del Sur.',
            'Japonés: mezcla de kanji (caracteres complejos) con kana, más simples y redondeados, como の o カ.',
            'Chino: solo caracteres complejos, sin el kana japonés.',
            'Tailandés: letras curvas con pequeños rulos, sin espacios entre palabras.',
            'Devanagari (con una línea horizontal arriba de las letras): el norte de la India y Nepal.',
            'Georgiano y armenio: alfabetos propios, muy redondeados el primero y con muchas formas en "u" y "n" el segundo.'
          ]
        },
        {
          title: 'Distinguir idiomas con alfabeto latino',
          paragraphs: [
            'La mayor parte de las rondas van a tener alfabeto latino, y ahí la clave está en los acentos y las letras especiales. Algunas combinaciones son casi una firma del idioma:'
          ],
          list: [
            'Español: ñ, y los signos de apertura ¿ y ¡.',
            'Portugués: ã, õ, ç y las terminaciones -ção y -ões. Las combinaciones lh y nh también son muy típicas.',
            'Catalán: el punto volado de l·l y palabras terminadas en -ció.',
            'Euskera (vasco): muchas k, tx, tz y la terminación -etxea.',
            'Francés: é, è, ê, ç y artículos como le, la, les, du.',
            'Alemán: ß y las diéresis ä, ö, ü; palabras compuestas muy largas.',
            'Neerlandés: el par ij y las vocales dobles (aa, ee, oo).',
            'Danés y noruego: æ y ø. Sueco: ä y ö, además de å, que comparten los tres.',
            'Polaco: ł, ż, ś, ć y la combinación sz o cz.',
            'Checo: ř, ě y muchas consonantes con el acento en forma de v (č, š, ž).',
            'Húngaro: ő y ű, únicas de ese idioma.',
            'Rumano: ș, ț y ă.',
            'Turco: ı (i sin punto), ğ y ş.',
            'Vietnamita: muchísimos acentos apilados sobre las vocales.'
          ]
        },
        {
          title: 'Cuidado con los países multilingües',
          paragraphs: [
            'Algunos países usan varios idiomas oficiales y lo reflejan en sus carteles. En Bélgica vas a ver neerlandés o francés según la región; en Suiza, alemán, francés o italiano; en Canadá, inglés y francés; en España, carteles en catalán, gallego o euskera según la comunidad. Esos carteles bilingües, lejos de confundirte, te ayudan a ubicar la región dentro del país.'
          ]
        },
        {
          title: 'Más allá de los carteles',
          paragraphs: [
            'No te limites a las señales de tránsito. Los nombres de los comercios, las publicidades, los dominios de internet escritos en los locales (.ar, .mx, .es, .pl) y los prefijos telefónicos (+54, +52, +34) son pistas muy precisas. Un número de teléfono pintado en un camión de reparto puede valer más que cualquier paisaje.'
          ]
        },
        {
          title: 'Cómo practicar',
          paragraphs: [
            'Jugá partidas en el mapa Europa: es el lugar ideal para entrenar la vista con idiomas que se parecen. Antes de abrir el mapa, intentá decir en voz alta qué idioma creés que es y por qué. Con el tiempo, vas a reconocer un cartel polaco o checo con la misma rapidez con la que reconocés uno en tu idioma.'
          ]
        }
      ]
    },
    en: {
      title: 'Languages and scripts: how to recognize a country by what is written',
      description:
        'A practical guide to identifying writing systems (Cyrillic, Greek, Arabic, Hangul…) and telling apart languages that use the Latin alphabet by their special letters.',
      sections: [
        {
          paragraphs: [
            'A sign, a shop window or a street name can solve a round in seconds, even if you do not understand the language. You do not need to read it: recognizing the writing system and a few characteristic letters is enough. This guide gives you a mental map to do it.'
          ]
        },
        {
          title: 'First, the script',
          paragraphs: ['Before thinking about the language, ask yourself what kind of writing you are looking at:'],
          list: [
            'Cyrillic (letters such as Ж, Я, Д, И): Russia, Ukraine, Belarus, Bulgaria, Serbia, North Macedonia, Kazakhstan, Kyrgyzstan and Mongolia, among others.',
            'Greek (Σ, Ω, Δ, λ): Greece and Cyprus.',
            'Arabic (written right to left, with joined letters): North Africa and the Middle East.',
            'Hebrew (square letters, right to left, not joined): Israel.',
            'Hangul (syllables built from circles and straight strokes, like 한국): South Korea.',
            'Japanese: a mix of kanji (complex characters) and kana, simpler and rounder, such as の or カ.',
            'Chinese: only complex characters, without Japanese kana.',
            'Thai: curvy letters with small loops, and no spaces between words.',
            'Devanagari (with a horizontal line on top of the letters): northern India and Nepal.',
            'Georgian and Armenian: alphabets of their own, the first very rounded and the second full of "u" and "n" shapes.'
          ]
        },
        {
          title: 'Telling apart Latin-alphabet languages',
          paragraphs: [
            'Most rounds will show the Latin alphabet, and there the key is in accents and special letters. Some combinations are almost a signature of the language:'
          ],
          list: [
            'Spanish: ñ, and the opening marks ¿ and ¡.',
            'Portuguese: ã, õ, ç and the endings -ção and -ões. The pairs lh and nh are very typical too.',
            'Catalan: the raised dot of l·l and words ending in -ció.',
            'Basque: lots of k, tx, tz and the ending -etxea.',
            'French: é, è, ê, ç and articles such as le, la, les, du.',
            'German: ß and the umlauts ä, ö, ü; very long compound words.',
            'Dutch: the pair ij and double vowels (aa, ee, oo).',
            'Danish and Norwegian: æ and ø. Swedish: ä and ö, plus å, which all three share.',
            'Polish: ł, ż, ś, ć and the pairs sz or cz.',
            'Czech: ř, ě and many consonants with a v-shaped accent (č, š, ž).',
            'Hungarian: ő and ű, unique to that language.',
            'Romanian: ș, ț and ă.',
            'Turkish: ı (dotless i), ğ and ş.',
            'Vietnamese: lots of accents stacked on the vowels.'
          ]
        },
        {
          title: 'Watch out for multilingual countries',
          paragraphs: [
            'Some countries have several official languages and their signs show it. In Belgium you will see Dutch or French depending on the region; in Switzerland, German, French or Italian; in Canada, English and French; in Spain, signs in Catalan, Galician or Basque depending on the region. Far from confusing you, those bilingual signs help you place the region within the country.'
          ]
        },
        {
          title: 'Beyond the signs',
          paragraphs: [
            'Do not stop at road signs. Shop names, billboards, web domains written on storefronts (.ar, .mx, .es, .pl) and phone prefixes (+54, +52, +34) are very precise clues. A phone number painted on a delivery truck can be worth more than any landscape.'
          ]
        },
        {
          title: 'How to practice',
          paragraphs: [
            'Play games on the Europe map: it is the ideal place to train your eye with languages that look alike. Before opening the map, try to say out loud which language you think it is and why. Over time you will recognize a Polish or Czech sign as quickly as one in your own language.'
          ]
        }
      ]
    }
  }
}
