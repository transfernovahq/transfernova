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

  const fiabilidad = rumor.jugador && rumor.jugador !== 'Por clasificar'
    ? `\n🎯 Fiabilidad: ${rumor.probabilidad}%` : ''

  const enlaceBase = 'https://gettransfernova.com'
  const utm = '?utm_source=telegram&utm_medium=social&utm_campaign=rumor'
  const enlace = rumor.jugador_slug
    ? `${enlaceBase}/player/${rumor.jugador_slug}${utm}`
    : rumor.club_destino
      ? `${enlaceBase}/club/${toSlug(rumor.club_destino)}${utm}`
      : `${enlaceBase}${utm}`

  const mensaje = `${estado}${jugador}${transfer}\n\n${rumor.titular}${fiabilidad}\n📰 ${rumor.fuente}\n\n👉 Ver rumor completo: ${enlace}`

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHANNEL,
        text: mensaje,
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true }
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
          content: `Eres un experto en mercado de fichajes de fútbol. Tu trabajo es analizar titulares con MÁXIMA precisión y CERO inventiva.

Titular: "${titular.replace(/"/g, "'")}"
Fuente: "${fuente}"

REGLA DE TRADUCCIÓN OBLIGATORIA: si el titular está en inglés, DEBES traducirlo COMPLETO al español en el campo titular_es. Nunca dejes palabras en inglés. Esto es obligatorio incluso si el titular tiene comillas o nombres propios raros.

REGLA DE ORO: si un dato no aparece EXPLÍCITAMENTE escrito en el titular, devuelve null para ese campo. Nunca asumas, nunca infieras, nunca completes con conocimiento general.

PASO 1 - VALIDACIÓN
Válido SOLO si trata sobre: fichajes, traspasos, cesiones, renovaciones, negociaciones, ofertas económicas, interés de clubes en jugadores, ventas de jugadores.
NO válido: lesiones, partidos, resultados, goles, entrevistas generales, entrenamientos, sanciones, tarjetas, alineaciones, convocatorias, otros deportes, contenido promocional, juegos o predictores, noticias sin jugador ni club implicado.

Si NO es válido, responde SOLO: {"valido": false}

EJEMPLOS de cómo extraer datos correctamente:

Titular: "Real Madrid announce £51.8m deal for Chelsea's Cucurella"
→ jugador: "Cucurella", club_origen: "Chelsea", club_destino: "Real Madrid" (ambos clubes están explícitos)

Titular: "El Real Madrid presume de Cucurella con España"
→ jugador: "Cucurella", club_origen: null, club_destino: null (no se menciona ningún club de origen/destino de fichaje, es otro tipo de noticia)

Titular: "Bernardo Silva no llega gratis al Real Madrid"
→ jugador: "Bernardo Silva", club_origen: null, club_destino: "Real Madrid" (el origen no está escrito)

Titular: "El Mallorca se pone duro con Demichelis"
→ jugador: "Demichelis", club_origen: null, club_destino: "Mallorca"

NOMBRES DE CLUBES ESTANDARIZADOS (usa siempre estos):
- Barcelona (nunca Barça ni FCB)
- Real Madrid (nunca Real ni RM)
- Atlético de Madrid (nunca Atlético ni Atletico)
- Bayern Munich (nunca Bayern)
- Athletic Club (nunca Athletic)
- Aston Villa (nunca Villa)

PASO 2 - Si es válido, responde SOLO con este JSON en español:
{
  "valido": true,
  "jugador": "nombre SOLO si aparece en el titular. Si aparecen DOS jugadores, elige el más relevante. Nunca combines dos nombres con guión. Si no aparece ninguno, null.",
  "club_origen": "SOLO si aparece explícitamente, si no null (nunca escribas el string 'null', usa null de JSON)",
  "club_destino": "SOLO si aparece explícitamente, si no null (nunca escribas el string 'null', usa null de JSON)",
  "tipo": "fichaje|cesion|renovacion|interes|rescision o null si no está claro",
  "estado": "confirmado SOLO si dice oficial/anuncia/confirma/ya es jugador, caliente si hay negociación activa explícita, rumor en cualquier otro caso",
  "probabilidad": "0-100. Rumor sin confirmar: máximo 60. Oficial: 100.",
  "titular_es": "titular traducido al español si estaba en inglés, igual si ya estaba en español",
  "resumen": "una frase corta en español"
}

Responde SOLO con JSON válido, sin texto adicional, sin markdown.`
        }
      ],
      temperature: 0.1,
      max_tokens: 400,
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

      if (!ia || ia.valido === false) {
        console.log(`  ⛔ Descartado por IA`)
        continue
      }

      const probRaw = String(ia?.probabilidad || '')
      const esNumeroLimpio = /^\d+$/.test(probRaw.trim())
      let probabilidadFinal = 50
      if (esNumeroLimpio) {
        probabilidadFinal = Math.min(100, Math.max(0, parseInt(probRaw)))
      } else if (ia?.estado === 'confirmado') {
        probabilidadFinal = 100
      } else if (ia?.estado === 'caliente') {
        probabilidadFinal = 70
      } else {
        probabilidadFinal = 50
      }

      const rumor = {
        titular: ia.titular_es || noticia.titular,
        fuente: noticia.fuente,
        url: noticia.url,
        jugador: ia?.jugador || 'Por clasificar',
        club_origen: ia?.club_origen || null,
        club_destino: ia?.club_destino || null,
        estado: ia?.estado || 'rumor',
        probabilidad: probabilidadFinal,
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

          // Copy para Twitter/X
          const transferX = rumor.club_origen && rumor.club_destino && rumor.club_origen !== rumor.club_destino
            ? `${rumor.club_origen} → ${rumor.club_destino}`
            : rumor.club_destino || ''
          const jugadorX = rumor.jugador && rumor.jugador !== 'Por clasificar' ? rumor.jugador : ''
          const hashtagsX = [
            jugadorX ? `#${jugadorX.replace(/ /g, '')}` : '',
            transferX ? `#Fichajes` : '',
            '#TransferNova'
          ].filter(Boolean).join(' ')
          const enlaceX = rumor.jugador_slug
            ? `https://gettransfernova.com/player/${rumor.jugador_slug}?utm_source=twitter&utm_medium=social&utm_campaign=rumor`
            : `https://gettransfernova.com?utm_source=twitter&utm_medium=social&utm_campaign=rumor`
          const copyX = `${rumor.estado === 'confirmado' ? '✅' : '🔥'} ${jugadorX ? jugadorX + ' ' : ''}${transferX ? '· ' + transferX + ' ' : ''}\n\n${rumor.titular}\n\n${hashtagsX}\n${enlaceX}`
          console.log(`\n--- COPY TWITTER/X ---\n${copyX}\n----------------------\n`)
        }
      }

      await new Promise(r => setTimeout(r, 500))
    }
    console.log()
  }

  console.log('¡Hecho!')
}

main()