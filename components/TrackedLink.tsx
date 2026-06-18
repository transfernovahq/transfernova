'use client'

import { sendGAEvent } from '@next/third-parties/google'

type Props = {
  href: string
  eventName: string
  eventParams?: Record<string, string>
  style?: React.CSSProperties
  children: React.ReactNode
  target?: string
  rel?: string
}

export default function TrackedLink(props: Props) {
  const { href, eventName, eventParams, style, children, target, rel } = props

  const handleClick = () => {
    sendGAEvent('event', eventName, eventParams || {})
  }

  return (
    <a href={href} target={target} rel={rel} style={style} onClick={handleClick}>
      {children}
    </a>
  )
}