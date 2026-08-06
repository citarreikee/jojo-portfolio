const imageCache = new Map<string, HTMLImageElement>()

type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

/**
 * Starts image requests after the first frame, without waiting for the
 * section that owns the images to mount. Keeping the Image instances alive
 * also lets the browser reuse both the network response and decoded pixels.
 */
export function preloadImages(sources: readonly string[]) {
  if (typeof window === 'undefined') return () => undefined

  const uniqueSources = Array.from(new Set(sources.filter(Boolean)))
  let cancelled = false
  let idleHandle: number | undefined
  let frameHandle: number | undefined
  let usedIdleCallback = false

  const load = () => {
    if (cancelled) return

    // Keep only a small number of downloads/decodes in flight. This avoids
    // saturating the connection (the local folder may contain full camera
    // originals) while still warming every Gallery image before it is needed.
    const pending = uniqueSources.filter((src) => !imageCache.has(src))
    let cursor = 0
    const runBatch = () => {
      if (cancelled || cursor >= pending.length) return

      const batch = pending.slice(cursor, cursor + 4)
      cursor += batch.length
      let remaining = batch.length
      const done = () => {
        remaining -= 1
        if (remaining === 0) runBatch()
      }

      batch.forEach((src) => {
        const image = new Image()
        let settled = false
        const settle = () => {
          if (settled) return
          settled = true
          done()
        }
        image.decoding = 'async'
        image.loading = 'eager'
        // Gallery assets are non-critical to the first paint, so let the hero
        // win bandwidth while still requesting every image before scrolling.
        image.fetchPriority = 'low'
        imageCache.set(src, image)
        image.onload = settle
        image.onerror = settle
        image.src = src

        // Decode off-screen so entering Gallery does not pay the decode cost.
        if (image.decode) {
          void image.decode().catch(() => undefined).finally(settle)
        }
      })
    }

    runBatch()
  }

  const schedule = () => {
    const idleWindow = window as IdleWindow
    if (idleWindow.requestIdleCallback) {
      usedIdleCallback = true
      idleHandle = idleWindow.requestIdleCallback(load, { timeout: 1200 })
    } else {
      idleHandle = window.setTimeout(load, 120)
    }
  }

  // Give the hero one frame to enter the screen before starting the gallery
  // requests. This keeps first paint responsive while eliminating first-entry
  // loading jank in Gallery.
  frameHandle = window.requestAnimationFrame(schedule)

  return () => {
    cancelled = true
    if (frameHandle !== undefined) window.cancelAnimationFrame(frameHandle)
    const idleWindow = window as IdleWindow
    if (idleHandle !== undefined) {
      if (usedIdleCallback && idleWindow.cancelIdleCallback) {
        idleWindow.cancelIdleCallback(idleHandle)
      } else {
        window.clearTimeout(idleHandle)
      }
    }
  }
}
