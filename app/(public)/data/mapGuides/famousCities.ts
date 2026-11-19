import { Article } from '@/app/(public)/models/Article'

export const famousCitiesGuide: Article = {
  slug: 'famous-cities',
  icon: '🏙️',
  playPath: '/play/classic',
  publishedAt: '2026-11-19',
  updatedAt: '2026-11-19',
  text: {
    es: {
      title: 'Mapa Ciudades famosas: guía y pistas',
      description:
        'Las 20 ciudades del mapa Ciudades famosas de GeoQuests y cómo reconocer cada una por sus calles, su arquitectura y sus carteles.',
      sections: [
        {
          paragraphs: [
            'Ciudades famosas es el mapa ideal para empezar. Reúne 20 de las ciudades más conocidas del mundo, repartidas en cinco continentes, y en cada ronda aparecés en una calle cualquiera de una de ellas: no necesariamente frente al monumento más famoso, sino en un barrio, una avenida o una esquina común. El desafío es reconocer la ciudad por su ambiente y, después, ubicar el barrio.'
          ]
        },
        {
          title: 'Las 20 ciudades',
          paragraphs: ['El mapa incluye estas ciudades:'],
          list: [
            'América: Buenos Aires, Santiago de Chile, São Paulo, Río de Janeiro, Ciudad de México, Nueva York (Manhattan), San Francisco y Toronto.',
            'Europa: Londres, París, Madrid, Barcelona, Lisboa, Roma, Berlín, Ámsterdam y Praga.',
            'Asia, Oceanía y África: Tokio, Sídney y Ciudad del Cabo.'
          ]
        },
        {
          title: 'Cómo distinguir las ciudades parecidas',
          paragraphs: [
            'Como hay pocas ciudades, el truco no es adivinar el país sino descartar rápido. Algunas parejas que suelen confundirse:'
          ],
          list: [
            'Madrid o Barcelona: las dos tienen carteles en español, pero en Barcelona vas a ver catalán (carrer, avinguda, sortida) y las manzanas octogonales del Eixample.',
            'Lisboa o Río de Janeiro: ambas hablan portugués y tienen veredas de piedra blanca y negra. En Lisboa los autos llevan patente europea; en Río, la patente Mercosur, y la vegetación es tropical.',
            'Buenos Aires o Santiago: en Santiago casi siempre se ven los Andes muy cerca; Buenos Aires es completamente plana y tiene veredas anchas con baldosas y árboles de plátano.',
            'Nueva York, San Francisco o Toronto: Manhattan es una cuadrícula de edificios altos con escaleras de incendio; San Francisco tiene colinas muy empinadas y casas victorianas de madera; Toronto mezcla rascacielos con tranvías rojos y carteles en inglés con medidas en kilómetros.',
            'Londres o Sídney: las dos manejan por la izquierda. Londres tiene ladrillo, colectivos rojos de dos pisos y cabinas; Sídney, casas con galerías de hierro, eucaliptos y una luz mucho más intensa.'
          ]
        },
        {
          title: 'Ubicar el barrio',
          paragraphs: [
            'Con la escala de puntaje del juego, acertar la ciudad ya da muchos puntos, pero la diferencia entre una buena partida y una excelente está en el barrio. Caminá hasta una esquina para leer el nombre de la calle, buscá estaciones de metro con su nombre, y fijate si estás cerca del agua (un río, la costa o un puerto) para afinar el pin. Conocer el trazado general de cada ciudad, por ejemplo que el centro de París está dentro del anillo periférico o que Manhattan es una isla larga y angosta, te ahorra muchos kilómetros.'
          ]
        },
        {
          title: 'Por qué jugarlo',
          paragraphs: [
            'Es el mapa más accesible para quien recién empieza y el que se usa en el Desafío diario algunos días. También es un buen mapa para jugar en grupo con amigos que no son expertos: casi todos reconocen alguna ciudad, y las rondas se definen por quién conoce mejor cada una.'
          ]
        }
      ]
    },
    en: {
      title: 'Famous cities map: guide and clues',
      description:
        'The 20 cities of the GeoQuests Famous cities map and how to recognize each one by its streets, architecture and signs.',
      sections: [
        {
          paragraphs: [
            'Famous cities is the ideal map to start with. It brings together 20 of the best-known cities in the world, spread over five continents, and every round drops you on a random street in one of them: not necessarily in front of the most famous monument, but in a neighborhood, an avenue or an ordinary corner. The challenge is to recognize the city by its atmosphere and then place the neighborhood.'
          ]
        },
        {
          title: 'The 20 cities',
          paragraphs: ['The map includes these cities:'],
          list: [
            'Americas: Buenos Aires, Santiago de Chile, São Paulo, Rio de Janeiro, Mexico City, New York (Manhattan), San Francisco and Toronto.',
            'Europe: London, Paris, Madrid, Barcelona, Lisbon, Rome, Berlin, Amsterdam and Prague.',
            'Asia, Oceania and Africa: Tokyo, Sydney and Cape Town.'
          ]
        },
        {
          title: 'How to tell similar cities apart',
          paragraphs: [
            'Since there are few cities, the trick is not guessing the country but ruling options out fast. Some pairs that are often confused:'
          ],
          list: [
            'Madrid or Barcelona: both have signs in Spanish, but in Barcelona you will see Catalan (carrer, avinguda, sortida) and the octagonal blocks of the Eixample.',
            'Lisbon or Rio de Janeiro: both speak Portuguese and have black-and-white stone sidewalks. In Lisbon cars carry European plates; in Rio, Mercosur plates, and the vegetation is tropical.',
            'Buenos Aires or Santiago: in Santiago you almost always see the Andes very close; Buenos Aires is completely flat, with wide tiled sidewalks lined with plane trees.',
            'New York, San Francisco or Toronto: Manhattan is a grid of tall buildings with fire escapes; San Francisco has very steep hills and wooden Victorian houses; Toronto mixes skyscrapers with red streetcars and English signs with distances in kilometers.',
            'London or Sydney: both drive on the left. London has brick, red double-decker buses and phone boxes; Sydney, houses with iron-lace verandas, eucalyptus trees and much stronger light.'
          ]
        },
        {
          title: 'Placing the neighborhood',
          paragraphs: [
            "With the game's scoring scale, getting the city right already gives a lot of points, but the difference between a good game and a great one is the neighborhood. Walk to a corner to read the street name, look for metro stations with their names, and check whether you are near water (a river, the coast or a harbor) to fine-tune the pin. Knowing the general layout of each city, for example that central Paris lies inside the ring road or that Manhattan is a long, narrow island, saves you many kilometers."
          ]
        },
        {
          title: 'Why play it',
          paragraphs: [
            'It is the most accessible map for beginners and one of the maps used by the Daily challenge on some days. It is also a good map for playing with friends who are not experts: almost everybody recognizes some city, and rounds are decided by who knows each one best.'
          ]
        }
      ]
    }
  }
}
