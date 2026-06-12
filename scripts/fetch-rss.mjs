import { XMLParser } from 'fast-xml-parser'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://szzgnyfaxkpjcvjmrtyo.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_secret_wK6_4FabPIlEKRZSfPIW5w_uvKZmFYu'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const FEEDS = [
  { url: 'https://www.marca.com/rss/futbol.xml', fuente: 'Marca' },
  { url: 'https://www.mundodeportivo.com/rss/futbol.xml', fuente: 'Mundo Deportivo' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', fuente: 'BBC Sport' },
]

const KEYWORDS_INCLUDE = [
  // Español
  'fichaje', 'ficha', 'traspaso', 'cesión', 'cedido',
  'renovación', 'renueva', 'rescisión', 'mercado',
  'oferta por', 'interés en', 'negocia', 'acuerdo',
  'millones por', 'cláusula',
  // Inglés
  'transfer', 'signing', 'signs', 'signed', 'loan',
  'contract extension', 'release clause', 'bid for',
  'move to', 'joins', 'agrees deal', 'fee agreed'
]

const KEYWORDS_EXCLUDE = [
  // Noticias que no son fichajes aunque tengan palabras clave
  'entrevista', 'rueda de prensa', 'partido', 'resultado',
  'gol', 'lesión', 'sanción', 'amarilla', 'roja',
  'clasificación', 'champions', 'liga', 'copa',
  'previa', 'crónica', 'análisis del partido',
  'convocatoria', 'once titular', 'alineación'
]

const parser = new XMLParser()

async function fetchFeed(feed) {
  try {
    const res = await fetch(feed.url)
    const xml = await res.text()
    const data = parser.parse(xml)
    const items = data?.rss?.channel?.item || []
    const list = Array.isArray(items) ? items : [items]

    return list
      .filter(item => {
        const text = (item.title + ' ' + (item.description || '')).toLowerCase()
        const hasKeyword = KEYWORDS_INCLUDE.some(kw => text.includes(kw))
        const isExcluded = KEYWORDS_EXCLUDE.some(kw => text.includes(kw))
        return hasKeyword && !isExcluded
        })
      .map(item => ({
        titular: item.title,
        fuente: feed.fuente,
        url: item.link,
        jugador: 'Por clasificar',
        club_origen: null,
        club_destino: null,
        estado: 'rumor',
        probabilidad: 50,
      }))
  } catch (e) {
    console.error(`Error en ${feed.fuente}:`, e.message)
    return []
  }
}

async function main() {
  console.log('Leyendo RSS feeds...\n')

  for (const feed of FEEDS) {
    const noticias = await fetchFeed(feed)
    console.log(`${feed.fuente}: ${noticias.length} noticias relevantes`)

    for (const noticia of noticias) {
      const { error } = await supabase
        .from('rumores')
        .upsert(noticia, { onConflict: 'url', ignoreDuplicates: true })

      if (error) {
        console.error('Error guardando:', error.message)
      } else {
        console.log(`  ✅ ${noticia.titular.slice(0, 60)}`)
      }
    }
    console.log()
  }

  console.log('¡Hecho!')
}

main()