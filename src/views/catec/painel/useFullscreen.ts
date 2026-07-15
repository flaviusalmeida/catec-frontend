'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useFullscreen<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [ativo, setAtivo] = useState(false)

  useEffect(() => {
    const onChange = () => {
      setAtivo(document.fullscreenElement === ref.current)
    }

    document.addEventListener('fullscreenchange', onChange)

    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const alternar = useCallback(async () => {
    const el = ref.current

    if (!el) return

    if (document.fullscreenElement === el) {
      await document.exitFullscreen()

      return
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen()
    }

    await el.requestFullscreen()
  }, [])

  return { ref, ativo, alternar }
}
