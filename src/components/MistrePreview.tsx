import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import './MistrePreview.css'

type MistrePreviewProps = {
  active: boolean
}

type NetworkNode = {
  id: string
  name: string
  type: 'person' | 'tag'
  x: number
  y: number
  count?: number
  bio?: string
  tags?: string[]
  avatar?: string
}

type LinkGeometry = {
  key: string
  sourceId: string
  targetId: string
  x1: number
  y1: number
  x2: number
  y2: number
}

const people: NetworkNode[] = [
  {
    id: 'jojo', name: 'Jojo', type: 'person', x: 50, y: 44,
    bio: 'Building AI that reaches beyond the screen and into the physical world.',
    tags: ['AI Agents', 'Spatial AI', 'Robotics', 'Design'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Jojo',
  },
  {
    id: 'maya', name: 'Maya Chen', type: 'person', x: 27, y: 29,
    bio: 'Product designer exploring humane interfaces for intelligent systems.',
    tags: ['Design', 'Community', 'Product'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Maya%20Chen',
  },
  {
    id: 'leo', name: 'Leo Zhang', type: 'person', x: 72, y: 27,
    bio: 'Robotics engineer working on embodied intelligence and manipulation.',
    tags: ['Robotics', 'Spatial AI', 'AI Agents'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Leo%20Zhang',
  },
  {
    id: 'iris', name: 'Iris Wang', type: 'person', x: 76, y: 65,
    bio: 'Founder building communities around emerging technology.',
    tags: ['Community', 'Startups', 'Spatial AI'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Iris%20Wang',
  },
  {
    id: 'noah', name: 'Noah Li', type: 'person', x: 25, y: 67,
    bio: 'Creative technologist turning hardware prototypes into products.',
    tags: ['Hardware', 'Design', 'Creative Code'],
    avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=Noah%20Li',
  },
]

const tags: NetworkNode[] = [
  { id: 'agents', name: 'AI Agents', type: 'tag', x: 49, y: 18, count: 8 },
  { id: 'design', name: 'Design', type: 'tag', x: 35, y: 49, count: 11 },
  { id: 'robotics', name: 'Robotics', type: 'tag', x: 64, y: 48, count: 9 },
  { id: 'community', name: 'Community', type: 'tag', x: 49, y: 72, count: 7 },
  { id: 'spatial', name: 'Spatial AI', type: 'tag', x: 84, y: 42, count: 6 },
  { id: 'hardware', name: 'Hardware', type: 'tag', x: 14, y: 47, count: 5 },
]

const nodes = [...people, ...tags]

const links: Array<[string, string]> = [
  ['jojo', 'agents'], ['jojo', 'design'], ['jojo', 'robotics'], ['jojo', 'community'],
  ['maya', 'design'], ['maya', 'community'], ['leo', 'agents'], ['leo', 'robotics'],
  ['leo', 'spatial'], ['iris', 'community'], ['iris', 'spatial'], ['noah', 'design'],
  ['noah', 'hardware'], ['robotics', 'hardware'], ['agents', 'spatial'],
]

const connectedTo = (id: string) => {
  const connected = new Set([id])
  links.forEach(([source, target]) => {
    if (source === id) connected.add(target)
    if (target === id) connected.add(source)
  })
  return connected
}

export default function MistrePreview({ active }: MistrePreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const dragRef = useRef<{ id: string; x: number; y: number; moved: boolean } | null>(null)
  const [inView, setInView] = useState(false)
  const [settled, setSettled] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [scope, setScope] = useState<'everyone' | 'circle'>('everyone')
  const [query, setQuery] = useState('')
  const [offsets, setOffsets] = useState<Record<string, { x: number; y: number }>>({})
  const [networkSize, setNetworkSize] = useState({ width: 1, height: 1 })
  const [linkGeometry, setLinkGeometry] = useState<LinkGeometry[]>([])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.2 })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!active || !inView) {
      setSettled(false)
      setSelectedId(null)
      return
    }
    const frame = requestAnimationFrame(() => setSettled(true))
    return () => cancelAnimationFrame(frame)
  }, [active, inView])

  const measureLinks = () => {
    const root = rootRef.current
    if (!root) return

    const rootRect = root.getBoundingClientRect()
    const nextGeometry = links.flatMap(([sourceId, targetId]) => {
      const sourceElement = nodeRefs.current[sourceId]
      const targetElement = nodeRefs.current[targetId]
      if (!sourceElement || !targetElement) return []

      const sourceRect = sourceElement.getBoundingClientRect()
      const targetRect = targetElement.getBoundingClientRect()
      const sourceCenter = {
        x: sourceRect.left - rootRect.left + sourceRect.width / 2,
        y: sourceRect.top - rootRect.top + sourceRect.height / 2,
      }
      const targetCenter = {
        x: targetRect.left - rootRect.left + targetRect.width / 2,
        y: targetRect.top - rootRect.top + targetRect.height / 2,
      }
      const dx = targetCenter.x - sourceCenter.x
      const dy = targetCenter.y - sourceCenter.y
      const distance = Math.max(Math.hypot(dx, dy), 1)
      const unitX = dx / distance
      const unitY = dy / distance
      const sourceRadius = Math.min(sourceRect.width, sourceRect.height) / 2 + 4
      const targetRadius = Math.min(targetRect.width, targetRect.height) / 2 + 4

      return [{
        key: `${sourceId}-${targetId}`,
        sourceId,
        targetId,
        x1: sourceCenter.x + unitX * sourceRadius,
        y1: sourceCenter.y + unitY * sourceRadius,
        x2: targetCenter.x - unitX * targetRadius,
        y2: targetCenter.y - unitY * targetRadius,
      }]
    })

    setNetworkSize({ width: Math.max(rootRect.width, 1), height: Math.max(rootRect.height, 1) })
    setLinkGeometry(nextGeometry)
  }

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(measureLinks)
    return () => cancelAnimationFrame(frame)
  }, [offsets, settled])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new ResizeObserver(measureLinks)
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  const selected = nodes.find((node) => node.id === selectedId) || null
  const connected = selectedId ? connectedTo(selectedId) : null

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return []
    return people.filter((person) =>
      [person.name, person.bio, ...(person.tags || [])]
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    )
  }, [query])

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>, node: NetworkNode) => {
    if (!active || node.type !== 'person') return
    event.stopPropagation()
    dragRef.current = { id: node.id, x: event.clientX, y: event.clientY, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (!drag || drag.id !== event.currentTarget.dataset.nodeId) return
    const dx = event.clientX - drag.x
    const dy = event.clientY - drag.y
    if (Math.hypot(dx, dy) > 1) drag.moved = true
    drag.x = event.clientX
    drag.y = event.clientY
    setOffsets((current) => ({
      ...current,
      [drag.id]: {
        x: (current[drag.id]?.x || 0) + dx,
        y: (current[drag.id]?.y || 0) + dy,
      },
    }))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>, node: NetworkNode) => {
    event.stopPropagation()
    const wasMoved = dragRef.current?.moved
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (!wasMoved) setSelectedId(node.id)
  }

  return (
    <div
      ref={rootRef}
      className={`mistre-original${settled ? ' is-settled' : ''}${active ? ' is-active' : ''}`}
      aria-label="Interactive ConnectMe social graph preview"
      onClick={(event) => {
        event.stopPropagation()
        setSelectedId(null)
      }}
    >
      <svg
        className="mistre-network"
        viewBox={`0 0 ${networkSize.width} ${networkSize.height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <g className="mistre-links">
          {linkGeometry.map((link) => {
            const highlighted = selectedId === link.sourceId || selectedId === link.targetId
            return (
              <line
                key={link.key}
                x1={link.x1}
                y1={link.y1}
                x2={link.x2}
                y2={link.y2}
                className={selectedId ? (highlighted ? 'is-highlighted' : 'is-dimmed') : ''}
              />
            )
          })}
        </g>
      </svg>

      <div className="mistre-nodes">
        {nodes.map((node, index) => {
          const offset = offsets[node.id] || { x: 0, y: 0 }
          const dimmed = connected ? !connected.has(node.id) : false
          const nodeSelected = selectedId === node.id
          const tagRadius = 28 + Math.min(18, (node.count || 0) * 1.4)
          return (
            <button
              type="button"
              key={node.id}
              ref={(element) => {
                nodeRefs.current[node.id] = element
              }}
              data-node-id={node.id}
              className={`mistre-graph-node mistre-graph-node--${node.type}${dimmed ? ' is-dimmed' : ''}${nodeSelected ? ' is-selected' : ''}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                translate: `${offset.x}px ${offset.y}px`,
                '--mistre-delay': `${index * 55}ms`,
                '--mistre-tag-size': `${tagRadius}px`,
              } as React.CSSProperties}
              onPointerDown={(event) => handlePointerDown(event, node)}
              onPointerMove={handlePointerMove}
              onPointerUp={(event) => handlePointerUp(event, node)}
              onClick={(event) => event.stopPropagation()}
              onMouseEnter={() => node.type === 'person' && active && setSelectedId(node.id)}
              tabIndex={active ? 0 : -1}
              aria-label={node.name}
            >
              {node.type === 'person' ? (
                <span className="mistre-avatar-circle">
                  <img src={node.avatar} alt={node.name} draggable={false} />
                </span>
              ) : (
                <span className="mistre-tag-circle">{node.name}</span>
              )}
            </button>
          )
        })}
      </div>

      {selected?.type === 'person' && (
        <div className="mistre-profile-card" onClick={(event) => event.stopPropagation()}>
          <div className="mistre-profile-header">
            <span className="mistre-profile-avatar"><img src={selected.avatar} alt="" /></span>
            <div className="mistre-profile-info">
              <h3>{selected.name}</h3>
              <p>{selected.bio}</p>
            </div>
          </div>
          <div className="mistre-profile-tags">
            {selected.tags?.map((tag) => (
              <button key={tag} type="button" onClick={() => setSelectedId(tags.find((node) => node.name === tag)?.id || selected.id)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mistre-search-container" onClick={(event) => event.stopPropagation()}>
        {query && (
          <div className="mistre-search-results">
            {results.length ? results.map((person) => (
              <button key={person.id} type="button" onClick={() => { setSelectedId(person.id); setQuery('') }}>
                <span className="mistre-result-avatar"><img src={person.avatar} alt="" /></span>
                <span><strong>{person.name}</strong><small>{person.bio}</small></span>
              </button>
            )) : <p>No people found</p>}
          </div>
        )}
        <div className="mistre-search-bar">
          <div className="mistre-filter-toggle">
            <button type="button" className={scope === 'everyone' ? 'active' : ''} onClick={() => setScope('everyone')}>Everyone</button>
            <button type="button" className={scope === 'circle' ? 'active' : ''} onClick={() => setScope('circle')}>My Circle</button>
          </div>
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search people by name, bio, or tags..."
            tabIndex={active ? 0 : -1}
          />
        </div>
      </div>
    </div>
  )
}
