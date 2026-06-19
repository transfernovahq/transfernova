import { supabase } from '@/lib/supabase'
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gettransfernova.com'

  const { data: rumores } = await supabase
    .from('rumores')
    .select('jugador, club_destino, club_origen, jugador_slug, created_at')

  const jugadoresUnicos = [...new Set(
    rumores?.filter(r => r.jugador_slug).map(r => r.jugador_slug) || []
  )]

  const clubesUnicos = [...new Set([
    ...rumores?.map(r => r.club_destino).filter(Boolean) || [],
    ...rumores?.map(r => r.club_origen).filter(Boolean) || []
  ])]

  const jugadorPages = jugadoresUnicos.map(slug => ({
    url: `${baseUrl}/player/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const clubPages = clubesUnicos.map(club => ({
    url: `${baseUrl}/club/${club.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-').replace(/[^a-z0-9-]/g, '')}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...jugadorPages,
    ...clubPages,
  ]
}