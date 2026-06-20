import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'TransferNova - Rumores en tiempo real'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#080808',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Borde neón superior */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: '#00ff87',
        }} />

        {/* Logo / Nombre */}
        <div style={{
          fontSize: 80,
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-2px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}>
          Transfer<span style={{ color: '#00ff87' }}>Nova</span>
        </div>

        {/* Eslogan */}
        <div style={{
          fontSize: 28,
          color: '#71717a',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#00ff87',
          }} />
          Rumores en tiempo real
        </div>

        {/* Dominio */}
        <div style={{
          fontSize: 20,
          color: '#71717a',
          marginTop: '40px',
        }}>
          gettransfernova.com
        </div>

        {/* Borde neón inferior */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: '#00ff87',
        }} />
      </div>
    ),
    { ...size }
  )
}