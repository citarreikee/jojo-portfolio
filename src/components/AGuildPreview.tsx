import { useEffect, useRef, useState } from 'react'
import { Check, ExternalLink, RotateCcw, X } from 'lucide-react'
import './AGuildPreview.css'

type AGuildPreviewProps = {
  active: boolean
}

type QuestId = 'entroflow' | 'jarvis' | 'telegram' | 'beyond'
type DemoStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

type Quest = {
  id: QuestId
  number: number
  title: string
  shortTitle: string
  status: 'Open' | 'Completed'
  responses: number
  reward?: string
  date: string
  summary: string
}

const quests: Quest[] = [
  {
    id: 'entroflow',
    number: 7,
    title: 'EntroFlow Humanoid Robot SDK Integration & Control App',
    shortTitle: 'Humanoid Robot SDK Integration',
    status: 'Open',
    responses: 3,
    date: 'JUN 13',
    summary: 'Map robot SDKs into a unified adapter layer and build a compact multi-robot control app.',
  },
  {
    id: 'jarvis',
    number: 6,
    title: 'Clone Jarvis Voice — End-to-End TTS for Desktop',
    shortTitle: 'Clone Jarvis Voice',
    status: 'Open',
    responses: 0,
    date: 'JUN 01',
    summary: 'Build a complete voice-cloning and TTS pipeline for a desktop assistant.',
  },
  {
    id: 'telegram',
    number: 5,
    title: 'Build a Telegram Bot That Summarizes YouTube Videos',
    shortTitle: 'YouTube Summary Bot',
    status: 'Open',
    responses: 7,
    reward: '$800',
    date: 'MAY 31',
    summary: 'Turn YouTube links into timestamped bilingual summaries with a deployable Telegram bot.',
  },
  {
    id: 'beyond',
    number: 3,
    title: 'NVIDIA BEYOND EXPO Humanoid Robot Demo',
    shortTitle: 'BEYOND EXPO Robot Demo',
    status: 'Completed',
    responses: 9,
    date: 'MAY 15',
    summary: 'Form an on-site party for a humanoid robot demonstration in Macau.',
  },
]

const stageTimers = [420, 1180, 2050, 3000, 4050, 5250, 6800]

export default function AGuildPreview({ active }: AGuildPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])
  const [inView, setInView] = useState(false)
  const [stage, setStage] = useState<DemoStage>(0)
  const [selectedQuest, setSelectedQuest] = useState<QuestId>('telegram')
  const [detailOpen, setDetailOpen] = useState(false)

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }

  const runDemo = () => {
    clearTimers()
    setDetailOpen(false)
    setSelectedQuest('telegram')
    setStage(0)

    requestAnimationFrame(() => {
      timersRef.current = stageTimers.map((delay, index) =>
        window.setTimeout(() => setStage((index + 1) as DemoStage), delay),
      )
    })
  }

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.2,
    })
    observer.observe(root)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (active && inView) runDemo()
    else {
      clearTimers()
      setDetailOpen(false)
      setStage(0)
    }
    return clearTimers
  }, [active, inView])

  const openQuest = (id: QuestId) => {
    if (stage < 7) return
    setSelectedQuest(id)
    setDetailOpen(true)
  }

  const showStory = stage >= 2 && stage < 7
  const currentQuest = quests.find((quest) => quest.id === selectedQuest) ?? quests[2]

  return (
    <div
      ref={rootRef}
      className={`aguild-preview is-stage-${stage}${active ? ' is-active' : ''}`}
      aria-label="Interactive Adventurer's Guild quest board preview"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="guild-wood" aria-hidden="true" />
      <div className="guild-frame" aria-hidden="true" />

      <header className="guild-masthead">
        <div className="guild-seal" aria-hidden="true"><span>AG</span></div>
        <div>
          <span>THE ADVENTURER'S GUILD</span>
          <strong>QUEST LEDGER</strong>
        </div>
        <button type="button" onClick={runDemo} aria-label="Replay AGuild demo">
          <RotateCcw size={12} />
        </button>
      </header>

      <div className="guild-manifesto" aria-hidden="true">
        <span>NO BOSSES · NO TIMECARDS · NO PLATFORM RENT</span>
        <strong>People meet around the work.<br />The Guild remembers who delivered.</strong>
      </div>

      <main className="guild-board" aria-label="AGuild quests">
        {quests.map((quest, index) => (
          <button
            type="button"
            key={quest.id}
            className={`guild-quest guild-quest--${quest.id}${stage >= 1 ? ' is-posted' : ''}${stage >= 7 ? ' is-settled' : ''}`}
            style={{ '--guild-card-index': index } as React.CSSProperties}
            onClick={() => openQuest(quest.id)}
            aria-label={`Open quest ${quest.title}`}
          >
            <span className="guild-pin" aria-hidden="true" />
            <span className={`guild-status is-${quest.status.toLowerCase()}`}>{quest.status}</span>
            <span className="guild-quest-number">QUEST · 0{quest.number}</span>
            <strong>{quest.shortTitle}</strong>
            <span className="guild-quest-summary">{quest.summary}</span>
            <span className="guild-quest-rule" />
            <span className="guild-quest-meta">
              <b>{quest.reward ?? 'REWARD BY SCOPE'}</b>
              <i>{quest.responses} RESPONSES</i>
            </span>
            <span className="guild-quest-date">{quest.date}</span>
            {quest.id === 'telegram' && stage >= 7 && <span className="guild-linked-stamp">DELIVERY LINKED</span>}
            {quest.id === 'beyond' && <span className="guild-complete-stamp">COMPLETED</span>}
          </button>
        ))}
      </main>

      <footer className="guild-ledger-footer">
        <span>05 QUESTS POSTED</span><i /><span>24 GITHUB STARS</span><i /><span>DIRECT REWARD</span>
      </footer>

      <div className={`guild-story${showStory ? ' is-visible' : ''}`} aria-hidden={!showStory}>
        <div className="guild-story-backdrop" />
        <section className="guild-dossier">
          <div className="guild-dossier-fold" aria-hidden="true" />
          <header>
            <div><span>OPEN QUEST · #5</span><b>$800 REWARD</b></div>
            <strong>Build a Telegram Bot That<br />Summarizes YouTube Videos</strong>
            <p>Timestamped summaries · English & Chinese · deployed on Telegram</p>
          </header>

          <div className="guild-story-grid">
            <div className="guild-call">
              <span className="guild-story-label">THE CALL</span>
              <p>A public issue becomes the handshake. Adventurers answer with an approach, contact and proof of ability.</p>
              <div className="guild-requirements">
                <span><Check size={9} /> YouTube URL input</span>
                <span><Check size={9} /> Whisper fallback</span>
                <span><Check size={9} /> Bilingual summaries</span>
                <span><Check size={9} /> Source and deployment</span>
              </div>
            </div>

            <div className="guild-responses">
              <span className="guild-story-label">ADVENTURERS ANSWER</span>
              <ResponseCard
                visible={stage >= 3}
                initials="KL"
                name="keilogic"
                copy="Proposed a scoped implementation and clean handoff."
              />
              <ResponseCard
                visible={stage >= 4}
                initials="AP"
                name="AlonePenguin"
                copy="Ready to deliver the bot, tests and deployment guide."
              />
              <ResponseCard
                visible={stage >= 5}
                featured
                initials="WJ"
                name="willjy1"
                copy="Built and published a source-ready implementation."
              />
            </div>
          </div>

          <div className={`guild-receipt${stage >= 6 ? ' is-visible' : ''}`}>
            <div className="guild-receipt-seal"><Check size={16} /></div>
            <div><span>PUBLIC DELIVERY RECEIPT</span><strong>aguild-youtube-telegram-bot</strong></div>
            <ul>
              <li>7 tests passing</li>
              <li>TypeScript build passed</li>
              <li>Public CI available</li>
              <li>Deployment handoff included</li>
            </ul>
          </div>
        </section>
      </div>

      <div className={`guild-detail${detailOpen ? ' is-visible' : ''}`} aria-hidden={!detailOpen}>
        <button type="button" className="guild-detail-backdrop" onClick={() => setDetailOpen(false)} aria-label="Close quest detail" />
        <section className="guild-detail-sheet">
          <button type="button" className="guild-detail-close" onClick={() => setDetailOpen(false)} aria-label="Close quest detail"><X size={15} /></button>
          <span className={`guild-status is-${currentQuest.status.toLowerCase()}`}>{currentQuest.status}</span>
          <span className="guild-detail-number">QUEST · 0{currentQuest.number} · {currentQuest.date}</span>
          <h3>{currentQuest.title}</h3>
          <p>{currentQuest.summary}</p>
          <div className="guild-detail-stats">
            <div><span>REWARD</span><strong>{currentQuest.reward ?? 'By scope'}</strong></div>
            <div><span>RESPONSES</span><strong>{currentQuest.responses}</strong></div>
            <div><span>STATUS</span><strong>{currentQuest.status}</strong></div>
          </div>
          {currentQuest.id === 'telegram' && (
            <div className="guild-detail-proof">
              <span>PUBLIC PROOF OF DELIVERY</span>
              <strong>Repository · Tests · CI · Deployment handoff</strong>
            </div>
          )}
          {currentQuest.id === 'beyond' && (
            <div className="guild-party">
              <span>PARTY FORMED</span>
              <div><i>AI</i><i>CV</i><i>OPS</i><i>HOST</i><b>9 responses</b></div>
            </div>
          )}
          <a href={`https://github.com/citarreikee/AGuild/issues/${currentQuest.number}`} target="_blank" rel="noreferrer">
            View public record <ExternalLink size={11} />
          </a>
        </section>
      </div>
    </div>
  )
}

function ResponseCard({
  visible,
  initials,
  name,
  copy,
  featured = false,
}: {
  visible: boolean
  initials: string
  name: string
  copy: string
  featured?: boolean
}) {
  return (
    <div className={`guild-response${visible ? ' is-visible' : ''}${featured ? ' is-featured' : ''}`}>
      <i>{initials}</i>
      <div><strong>{name}</strong><span>{copy}</span></div>
      {featured && <b>DELIVERED</b>}
    </div>
  )
}
