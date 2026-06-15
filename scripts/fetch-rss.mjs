import { XMLParser } from 'fast-xml-parser'
import { createClient } from '@supabase/supabase-js'
import Groq from 'groq-sdk'

function toSlug(nombre) {
  if (!nombre) return null
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ /g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://szzgnyfaxkpjcvjmrtyo.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
const TELEGRAM_CHANNEL = '@transfernovahq'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const groq = new Groq({ apiKey: GROQ_API_KEY })

const FEEDS = [
  { url: 'https://www.marca.com/rss/futbol.xml', fuente: 'Marca' },
  { url: 'https://www.mundodeportivo.com/rss/futbol.xml', fuente: 'Mundo Deportivo' },
  { url: 'https://feeds.bbci.co.uk/sport/football/rss.xml', fuente: 'BBC Sport' },
]

const KEYWORDS_INCLUDE = [
  'fichaje', 'ficha', 'traspaso', 'cesión', 'cedido',
  'renovación', 'renueva', 'rescisión', 'mercado',
  'oferta por', 'interés en', 'negocia', 'acuerdo',
  'millones por', 'cláusula',
  'transfer', 'signing', 'signs', 'signed', 'loan',
  'contract extension', 'release clause', 'bid for',
  'move to', 'joins', 'agrees deal', 'fee agreed'
]

const KEYWORDS_EXCLUDE = [
  'entrevista', 'rueda de prensa', 'partido', 'resultado',
  'gol', 'lesión', 'sanción', 'amarilla', 'roja',
  'clasificación', 'previa', 'crónica', 'análisis del partido',
  'convocatoria', 'once titular', 'alineación'
]

const parser = new XMLParser()

async function publicarEnTelegram(rumor) {
  if (!TELEGRAM_BOT_TOKEN) return

  const estado = rumor.estado === 'confirmado' ? '✅ CONFIRMADO'
    : rumor.estado === 'caliente' ? '🔥 CALIENTE'
    : '👀 RUMOR'

  const transfer = rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino
    ? `\n⚽ ${rumor.club_origen} → ${rumor.club_destino}`
    : rumor.club_destino ? `\n⚽ ${rumor.club_destino}` : ''

  const jugador = rumor.jugador && rumor.jugador !== 'Por clasificar'
    ? `\n👤 ${rumor.jugador}` : ''

  const mensaje = `${estado}${jugador}${transfer}\n\n${rumor.titular}\n\n🎯 Fiabilidad: ${rumor.probabilidad}%\n📰 ${rumor.fuente}\n\n🔗 https://gettransfernova.com`

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL,
        text: mensaje,
        parse_mode: 'HTML'
      })
    })
    console.log('  📨 Publicado en Telegram')
  } catch (e) {
    console.error('  ❌ Error Telegram:', e.message)
  }
}

async function procesarConIA(titular, fuente) {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'user',
          content: `Analiza este titular de fútbol y extrae la información en JSON.

Titular: "${titular}"
Fuente: "${fuente}"

Responde SOLO con JSON válido, sin texto adicional, sin markdown:
{
  "jugador": "nombre completo del jugador o null",
  "club_origen": "club actual del jugador o null",
  "club_destino": "club al que va o null",
  "tipo": "fichaje|cesion|renovacion|interes|rescision",
  "estado": "confirmado|caliente|rumor",
  "probabilidad": numero entre 0 y 100,
  "resumen": "una frase corta explicando el rumor en español"
}`
        }
      ],
      temperature: 0.1,
      max_tokens: 300,
    })

    const texto = completion.choices[0]?.message?.content?.trim()
    const datos = JSON.parse(texto)
    return datos
  } catch (e) {
    console.error('Error IA:', e.message)
    return null
  }
}

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
      const { data: existe } = await supabase
        .from('rumores')
        .select('id')
        .eq('url', noticia.url)
        .single()

      if (existe) {
        console.log(`  ⏭ Ya existe: ${noticia.titular.slice(0, 50)}`)
        continue
      }

      console.log(`  🤖 Procesando: ${noticia.titular.slice(0, 50)}`)
      const ia = await procesarConIA(noticia.titular, noticia.fuente)

      const rumor = {
        titular: noticia.titular,
        fuente: noticia.fuente,
        url: noticia.url,
        jugador: ia?.jugador || 'Por clasificar',
        club_origen: ia?.club_origen || null,
        club_destino: ia?.club_destino || null,
        estado: ia?.estado || 'rumor',
        probabilidad: ia?.probabilidad || 50,
        jugador_detectado: !!ia?.jugador,
        jugador_slug: toSlug(ia?.jugador),
      }

      const { error } = await supabase
        .from('rumores')
        .insert(rumor)

      if (error) {
        console.error('  ❌ Error guardando:', error.message)
      } else {
        console.log(`  ✅ ${rumor.jugador} | ${rumor.estado} | ${rumor.probabilidad}%`)
        if (rumor.probabilidad >= 70 || rumor.estado === 'confirmado' || rumor.estado === 'caliente') {
          await publicarEnTelegram(rumor)
        }
      }

      await new Promise(r => setTimeout(r, 500))
    }
    console.log()
  }

  console.log('¡Hecho!')
}

main()