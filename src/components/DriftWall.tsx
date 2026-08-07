import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { createPortal } from 'react-dom'
import './DriftWall.css'

export type DriftWallItem = {
  image: string
  title?: string
  href?: string
}

type DriftWallProps = {
  items?: DriftWallItem[]
  columns?: number
  tileWidth?: number
  tileHeight?: number
  gap?: number
  radius?: number
  tilt?: number
  turn?: number
  roll?: number
  perspective?: number
  depth?: number
  speed?: number
  direction?: 'up' | 'down'
  variance?: number
  parallax?: number
  pauseOnHover?: boolean
  lift?: number
  fade?: number
  dim?: number
  grayscale?: boolean
  overlayColor?: string
  className?: string
  style?: CSSProperties
}

const DEFAULT_ITEMS: DriftWallItem[] = Array.from({ length: 15 }, (_, index) => {
  const ids = [1015, 1025, 1039, 1043, 1044, 1050, 1062, 1069, 1074, 1080, 1084, 106, 110, 133, 164]
  return {
    image: `https://picsum.photos/id/${ids[index % ids.length]}/600/400`,
    title: `Tile ${index + 1}`,
  }
})

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const columnFactor = (index: number, variance: number) => {
  const pseudo = ((index * 0.6180339887 + 0.35) % 1) * 2 - 1
  return 1 + variance * pseudo
}

export default function DriftWall({
  items = DEFAULT_ITEMS,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  radius = 14,
  tilt = 16,
  turn = -14,
  roll = 0,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  pauseOnHover = false,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  grayscale = false,
  overlayColor = '#060010',
  className = '',
  style,
}: DriftWallProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const planeRef = useRef<HTMLDivElement>(null)
  const trackRefs = useRef<Array<HTMLDivElement | null>>([])
  const rafRef = useRef<number | null>(null)
  const offsetsRef = useRef<number[]>([])
  const velocitiesRef = useRef<number[]>([])
  const hoveredColRef = useRef(-1)
  const wallHoveredRef = useRef(false)
  const pointerRef = useRef({ x: 0, y: 0 })
  const pointerDampedRef = useRef({ x: 0, y: 0 })
  const lastTsRef = useRef<number | null>(null)
  const activeIdRef = useRef<string | null>(null)
  const [containerHeight, setContainerHeight] = useState(600)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [previewItem, setPreviewItem] = useState<DriftWallItem | null>(null)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (!previewItem) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewItem(null)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [previewItem])

  useEffect(() => {
    setReduced(prefersReducedMotion())
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  const columnItems = useMemo(() => {
    const seenImages = new Set<string>()
    const uniqueItems = items.filter((item) => {
      if (seenImages.has(item.image)) return false
      seenImages.add(item.image)
      return true
    })
    const columnCount = Math.max(1, Math.min(columns, uniqueItems.length || 1))
    const nextColumns = Array.from({ length: columnCount }, () => [] as DriftWallItem[])
    uniqueItems.forEach((item, index) => nextColumns[index % columnCount].push(item))
    return nextColumns.filter((column) => column.length > 0)
  }, [items, columns])

  const columnMeta = useMemo(() => {
    const unit = tileHeight + gap
    return columnItems.map((column) => {
      const copyHeight = Math.max(unit, column.length * unit)
      const copies = Math.max(2, Math.ceil((containerHeight * 1.6) / copyHeight) + 1)
      return { copyHeight, copies }
    })
  }, [columnItems, tileHeight, gap, containerHeight])

  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(([entry]) => {
      setContainerHeight(entry.contentRect.height || 600)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const baseVelocities = useMemo(() => {
    const directionSign = direction === 'up' ? 1 : -1
    return columnItems.map((_, column) => {
      const alternatingSign = column % 2 === 0 ? 1 : -1
      return speed * columnFactor(column, variance) * directionSign * alternatingSign
    })
  }, [columnItems, speed, direction, variance])

  useEffect(() => {
    offsetsRef.current = columnMeta.map((meta, column) => meta.copyHeight * ((column * 0.37) % 1))
    velocitiesRef.current = columnItems.map(() => 0)
  }, [columnMeta, columnItems])

  const applyPlaneTransform = useCallback((pointerX: number, pointerY: number) => {
    const plane = planeRef.current
    if (!plane) return
    plane.style.transform =
      `translate(-50%, -50%) scale(1.18) ` +
      `rotateX(${tilt + pointerY}deg) rotateY(${turn + pointerX}deg) ` +
      `rotateZ(${roll}deg) translateZ(${-depth}px)`
  }, [tilt, turn, roll, depth])

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (lastTsRef.current === null) lastTsRef.current = timestamp
      const deltaTime = Math.min(0.05, Math.max(0, timestamp - lastTsRef.current) / 1000)
      lastTsRef.current = timestamp

      const maxTilt = parallax * 8
      const targetX = pointerRef.current.x * maxTilt
      const targetY = -pointerRef.current.y * maxTilt
      const damp = 1 - Math.exp(-deltaTime / 0.12)
      pointerDampedRef.current.x += (targetX - pointerDampedRef.current.x) * damp
      pointerDampedRef.current.y += (targetY - pointerDampedRef.current.y) * damp
      applyPlaneTransform(pointerDampedRef.current.x, pointerDampedRef.current.y)

      for (let column = 0; column < trackRefs.current.length; column += 1) {
        const element = trackRefs.current[column]
        const meta = columnMeta[column]
        if (!element || !meta) continue

        if (!reduced) {
          const paused = wallHoveredRef.current && pauseOnHover
          const factor = paused || hoveredColRef.current === column ? 0 : 1
          const target = baseVelocities[column] * factor
          const ease = 1 - Math.exp(-deltaTime / (target === 0 ? 0.16 : 0.28))
          velocitiesRef.current[column] += (target - velocitiesRef.current[column]) * ease
          let nextOffset = (offsetsRef.current[column] ?? 0) + velocitiesRef.current[column] * deltaTime
          nextOffset = ((nextOffset % meta.copyHeight) + meta.copyHeight) % meta.copyHeight
          offsetsRef.current[column] = nextOffset
        }

        element.style.transform = `translate3d(0, ${-(offsetsRef.current[column] ?? 0)}px, 0)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      lastTsRef.current = null
    }
  }, [baseVelocities, columnMeta, pauseOnHover, parallax, reduced, applyPlaneTransform])

  const activate = useCallback((id: string, column: number) => {
    activeIdRef.current = id
    hoveredColRef.current = column
    setActiveId(id)
  }, [])

  const release = useCallback(() => {
    activeIdRef.current = null
    hoveredColRef.current = -1
    setActiveId(null)
  }, [])

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    if (parallax > 0 && !reduced) {
      pointerRef.current = {
        x: (event.clientX - rect.left) / rect.width - 0.5,
        y: (event.clientY - rect.top) / rect.height - 0.5,
      }
    }

    const tile = event.target instanceof Element
      ? event.target.closest<HTMLElement>('[data-tile-id]')
      : null
    if (!tile) return
    const id = tile.dataset.tileId
    if (!id || id === activeIdRef.current) return
    activate(id, Number(tile.dataset.col))
  }, [activate, parallax, reduced])

  const handlePointerLeaveWall = useCallback(() => {
    wallHoveredRef.current = false
    pointerRef.current = { x: 0, y: 0 }
    release()
  }, [release])

  const openPreview = useCallback((item: DriftWallItem) => {
    setPreviewItem(item)
  }, [])

  const cssVariables = useMemo(() => ({
    '--dw-tile-w': `${tileWidth}px`,
    '--dw-tile-h': `${tileHeight}px`,
    '--dw-gap': `${gap}px`,
    '--dw-radius': `${radius}px`,
    '--dw-perspective': `${perspective}px`,
    '--dw-lift': `${lift}px`,
    '--dw-dim': dim,
    '--dw-gray': grayscale ? 1 : 0,
    '--dw-overlay': overlayColor,
    '--dw-edge': `${Math.max(0, (1 - fade) * 100)}%`,
    ...style,
  }) as CSSProperties, [tileWidth, tileHeight, gap, radius, perspective, lift, dim, grayscale, overlayColor, fade, style])

  const renderTile = (item: DriftWallItem, id: string, column: number) => {
    const inner = (
      <span className="drift-wall__inner">
        <img src={item.image} alt={item.title ?? ''} loading="eager" decoding="async" draggable={false} />
        <span className="drift-wall__overlay" aria-hidden="true" />
      </span>
    )
    const className = `drift-wall__tile${activeId === id ? ' is-active' : ''}`

    if (item.href) {
      return (
        <a
          key={id}
          href={item.href}
          target="_blank"
          rel="noreferrer noopener"
          className={className}
          data-tile-id={id}
          data-col={column}
          onFocus={() => activate(id, column)}
          onBlur={release}
          onClick={(event) => {
            event.preventDefault()
            openPreview(item)
          }}
        >
          {inner}
        </a>
      )
    }

    return (
      <div
        key={id}
        tabIndex={0}
        role="button"
        aria-label={item.title ?? 'tile'}
        className={className}
        data-tile-id={id}
        data-col={column}
        onFocus={() => activate(id, column)}
        onBlur={release}
        onClick={() => openPreview(item)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            openPreview(item)
          }
        }}
      >
        {inner}
      </div>
    )
  }

  const rootClassName = ['drift-wall', reduced && 'drift-wall--reduced', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={containerRef}
      className={rootClassName}
      style={cssVariables}
      onPointerMove={handlePointerMove}
      onPointerEnter={() => { wallHoveredRef.current = true }}
      onPointerLeave={handlePointerLeaveWall}
      role="group"
      aria-label="Drifting wall of gallery images"
    >
      <div ref={planeRef} className="drift-wall__plane">
        {columnItems.map((columnItemsForTrack, column) => {
          const meta = columnMeta[column]
          const copies = Array.from({ length: meta.copies })
          return (
            <div className="drift-wall__col" key={`col-${column}`}>
              <div
                className="drift-wall__track"
                ref={(element) => { trackRefs.current[column] = element }}
              >
                {copies.map((_, copyIndex) =>
                  columnItemsForTrack.map((item, itemIndex) =>
                    renderTile(item, `${column}-${copyIndex}-${itemIndex}`, column),
                  ),
                )}
              </div>
            </div>
          )
        })}
      </div>
      {previewItem && typeof document !== 'undefined' && createPortal(
        <div
          className="drift-wall__lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={previewItem.title ? `Preview: ${previewItem.title}` : 'Image preview'}
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreviewItem(null)
          }}
        >
          <button
            type="button"
            className="drift-wall__lightbox-close"
            aria-label="Close image preview"
            onClick={() => setPreviewItem(null)}
          >
            <span aria-hidden="true">×</span>
          </button>
          <figure className="drift-wall__lightbox-content">
            <img src={previewItem.image} alt={previewItem.title ?? ''} decoding="async" draggable={false} />
          </figure>
        </div>,
        document.body,
      )}
    </div>
  )
}
