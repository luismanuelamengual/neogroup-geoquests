import { readdir } from 'fs/promises'
import { NextResponse } from 'next/server'
import { join } from 'path'

// The list is built when the app is built (public/ is not available to the
// serverless functions at runtime), so adding music needs a new build.
export const dynamic = 'force-static'

const AUDIO_EXTENSIONS = /\.(mp3|ogg|m4a|wav|webm|aac)$/i

/** GET /api/getMusicTracks — URLs of the background music files in public/music, sorted by name. */
export async function GET() {
  let files: string[] = []

  try {
    files = await readdir(join(process.cwd(), 'public', 'music'))
  } catch {
    // No music folder: no music.
  }

  const tracks = files
    .filter((file) => AUDIO_EXTENSIONS.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => `/music/${encodeURIComponent(file)}`)

  return NextResponse.json({ tracks })
}
