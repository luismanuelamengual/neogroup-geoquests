/* eslint-disable no-console */
/**
 * Downloads the photos of the collage of the map cards (map picker) from
 * Wikimedia Commons: for each map it looks up the searches of `MAP_QUERIES`,
 * keeps the first free-licensed landscape photo of each one, saves an optimized
 * copy in public/maps/<map slug>/<n>.jpg and writes the list, with the credits
 * of every photo (author + license + page), in the generated
 * app/(protected)/(game)/data/mapPhotos.ts.
 *
 * Only licenses that allow reuse are accepted (public domain, CC0, CC BY and
 * CC BY-SA); the credits kept in the manifest satisfy their attribution.
 * Run it again to renew the photos (they are overwritten): to change one,
 * edit its search below. Maps with no searches (or no photos found) show an
 * illustration instead.
 *
 * Usage: yarn maps:photos   (needs network access to commons.wikimedia.org)
 */
import { mkdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { MapPhoto } from '@/app/(protected)/(game)/models/MapPhoto'
import { mapSlug, MAX_MAP_PHOTOS } from '@/app/(protected)/(game)/utils/mapPhotos'

/** Searches of the photos of each map (name as seeded in database/migrations/002-seed-maps.ts): one photo each. */
const MAP_QUERIES: Record<string, string[]> = {
  'Ciudades famosas': [
    'Eiffel Tower Paris',
    'Buenos Aires Obelisco',
    'London Tower Bridge',
    'Cape Town Table Mountain city'
  ],
  'Ciudades del mundo': [
    'Tokyo skyline',
    'Manhattan skyline from Hudson',
    'Cairo city skyline',
    'Sydney Harbour skyline'
  ],
  'Lugares icónicos': ['Machu Picchu panorama', 'Colosseum Rome exterior', 'Taj Mahal Agra', 'Uluru Ayers Rock sunset'],
  Argentina: ['Perito Moreno glacier', 'Fitz Roy Patagonia', 'Iguazu Falls Argentina', 'Quebrada de Humahuaca'],
  España: [
    'Sagrada Familia Barcelona',
    'Alhambra Granada',
    'Plaza de España Sevilla',
    'Santiago de Compostela cathedral'
  ],
  'Estados Unidos': ['Grand Canyon South Rim', 'Golden Gate Bridge', 'Statue of Liberty', 'Monument Valley'],
  Latinoamérica: ['Cartagena de Indias old city', 'Zocalo Mexico City', 'Valparaiso hills', 'Rio de Janeiro Sugarloaf'],
  Europa: ['Prague Old Town Square', 'Santorini Oia', 'Amsterdam canals', 'Big Ben Westminster']
}
const API = 'https://commons.wikimedia.org/w/api.php'
const USER_AGENT = 'geoquests-map-photos/1.0 (https://github.com/luismanuelamengual; luismanuelamengual@gmail.com)'
/** Photos are saved at this size: the cells of a card are small, but it has to be sharp on dense screens. */
const PHOTO_WIDTH = 720
const PHOTO_HEIGHT = 540
/** Minimum size of the original and range of proportions of a useful landscape photo. */
const MIN_WIDTH = 1600
const MIN_RATIO = 1.25
const MAX_RATIO = 2.1
/** Accepted licenses (names as Wikimedia Commons writes them). Non-commercial and no-derivatives ones are not. */
const LICENSE = /^(cc0|public domain|pd\b|cc[- ]by(?!-nc|-nd)(-sa)?[- ]\d)/i
/** Files that are not photos of a place, whatever the license. */
const UNWANTED_TITLE =
  /\b(map|flag|logo|coat of arms|diagram|plan|drawing|painting|poster|stamp|icon|night|interior)\b/i

interface CommonsPage {
  index: number
  title: string
  imageinfo?: {
    thumburl?: string
    width: number
    height: number
    mime: string
    descriptionurl: string
    extmetadata?: Record<string, { value?: string } | undefined>
  }[]
}

interface Candidate {
  title: string
  thumbUrl: string
  author: string
  license: string
  url: string
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
const plainText = (html: string | undefined) =>
  (html ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()

async function request(url: string): Promise<Response> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} (${url})`)
  }

  return response
}

/** Free-licensed landscape photos found by a search, best match first. */
async function search(query: string): Promise<Candidate[]> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '20',
    prop: 'imageinfo',
    iiprop: 'url|size|mime|extmetadata',
    iiurlwidth: '1200',
    iiextmetadatafilter: 'LicenseShortName|Artist'
  })
  const data = (await (await request(`${API}?${params}`)).json()) as { query?: { pages?: Record<string, CommonsPage> } }
  const pages = Object.values(data.query?.pages ?? {}).sort((a, b) => a.index - b.index)
  const candidates: Candidate[] = []

  for (const page of pages) {
    const info = page.imageinfo?.[0]
    const license = plainText(info?.extmetadata?.LicenseShortName?.value)

    if (!info?.thumburl || info.mime !== 'image/jpeg' || !LICENSE.test(license) || UNWANTED_TITLE.test(page.title)) {
      continue
    }

    const ratio = info.width / info.height

    if (info.width < MIN_WIDTH || ratio < MIN_RATIO || ratio > MAX_RATIO) {
      continue
    }

    candidates.push({
      title: page.title.replace(/^File:/, ''),
      thumbUrl: info.thumburl,
      author: plainText(info.extmetadata?.Artist?.value) || 'Autor desconocido',
      license,
      url: info.descriptionurl
    })
  }

  return candidates
}

async function run(): Promise<void> {
  const manifest: Record<string, MapPhoto[]> = {}

  for (const [mapName, queries] of Object.entries(MAP_QUERIES)) {
    const slug = mapSlug(mapName)
    const directory = path.join('public', 'maps', slug)
    const used = new Set<string>()
    const photos: MapPhoto[] = []

    console.log(`\n${mapName}`)

    for (const query of queries.slice(0, MAX_MAP_PHOTOS)) {
      try {
        const candidate = (await search(query)).find((item) => !used.has(item.title))

        await sleep(400)

        if (!candidate) {
          console.warn(`  ✗ "${query}": no free landscape photo found`)
          continue
        }

        const original = Buffer.from(await (await request(candidate.thumbUrl)).arrayBuffer())
        const file = `${photos.length + 1}.jpg`

        if (photos.length === 0) {
          await rm(directory, { recursive: true, force: true })
          await mkdir(directory, { recursive: true })
        }

        await sharp(original)
          .resize(PHOTO_WIDTH, PHOTO_HEIGHT, { fit: 'cover', position: 'attention' })
          .jpeg({ quality: 72, mozjpeg: true })
          .toFile(path.join(directory, file))

        used.add(candidate.title)
        photos.push({
          src: `/maps/${slug}/${file}`,
          title: candidate.title,
          author: candidate.author,
          license: candidate.license,
          url: candidate.url
        })
        console.log(`  ✓ "${query}" -> ${candidate.title} (${candidate.license})`)
        await sleep(400)
      } catch (error) {
        console.warn(`  ✗ "${query}": ${(error as Error).message}`)
      }
    }

    if (photos.length > 0) {
      manifest[slug] = photos
    }
  }

  const source = `import { MapPhoto } from '@/app/(protected)/(game)/models/MapPhoto'

/**
 * Photos of the collage of each map card, by the slug of the map (see
 * utils/mapPhotos.ts). GENERATED by \`yarn maps:photos\` (scripts/fetch-map-photos.ts):
 * do not edit by hand. Maps with no entry show an illustration instead.
 */
export const MAP_PHOTOS: Record<string, MapPhoto[]> = ${JSON.stringify(manifest, null, 2)}
`

  await writeFile(path.join('app', '(protected)', '(game)', 'data', 'mapPhotos.ts'), source)
  console.log(`\nDone: ${Object.values(manifest).flat().length} photos of ${Object.keys(manifest).length} maps.`)
}

run().catch((error) => {
  console.error('Fetching the photos failed:', error)
  process.exit(1)
})
