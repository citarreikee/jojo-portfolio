import { useEffect, useRef, useState } from 'react'
import {
  Check,
  CheckCircle2,
  Code2,
  FileCode2,
  Loader2,
  Search,
  Send,
} from 'lucide-react'
import './VisibleManusPreview.css'

type VisibleManusPreviewProps = {
  active: boolean
}

const demoRequest = 'Research spatial AI and build a concise visual brief'

const stages = [650, 1450, 2450, 3650, 4850, 6200]

export default function VisibleManusPreview({ active }: VisibleManusPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])
  const [inView, setInView] = useState(false)
  const [stage, setStage] = useState(0)
  const [input, setInput] = useState(demoRequest)

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }

  const runDemo = () => {
    clearTimers()
    setStage(0)
    requestAnimationFrame(() => {
      timersRef.current = stages.map((delay, index) =>
        window.setTimeout(() => setStage(index + 1), delay),
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
      setStage(0)
    }
    return clearTimers
  }, [active, inView])

  const plannerActive = stage >= 1 && stage < 6
  const hasTasks = stage >= 2
  const researchActive = stage === 3
  const researchDone = stage >= 4
  const coderActive = stage === 4
  const coderDone = stage >= 5
  const outputActive = stage === 5
  const complete = stage >= 6

  const logs = [
    stage >= 1 && ['PLAN', 'Analyzing request and selecting agents...'],
    stage >= 2 && ['TOOL', 'create_task_list(2 tasks)'],
    stage >= 3 && ['RESEARCH', 'navigate · search · extract_text'],
    stage >= 4 && ['RESEARCH', 'Research completed'],
    stage >= 4 && ['WEBCODER', 'write_file(brief.html)'],
    stage >= 5 && ['OUTPUT', 'Visual brief generated'],
  ].filter(Boolean) as string[][]

  return (
    <div
      ref={rootRef}
      className="visible-manus-preview"
      aria-label="Interactive Visible Manus multi-agent workflow preview"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="vm-grid" aria-hidden="true" />
      <div className="vm-topline">
        <span>MULTI AGENT CANVAS</span>
        <span className={complete ? 'is-complete' : stage ? 'is-running' : ''}>
          <i /> {complete ? 'COMPLETE' : stage ? 'RUNNING' : 'READY'}
        </span>
      </div>

      <div className="vm-canvas">
        <svg className="vm-connections" viewBox="0 0 600 370" preserveAspectRatio="none" aria-hidden="true">
          <path className={stage >= 2 ? 'is-active' : ''} d="M 252 92 C 288 92, 292 92, 326 92" />
          <path className={stage >= 3 ? 'is-active' : ''} d="M 438 160 C 438 194, 438 194, 438 222" />
          <path className={stage >= 5 ? 'is-active is-green' : ''} d="M 290 284 C 326 284, 328 284, 360 284" />
          {stage >= 2 && <circle className="vm-flow-dot vm-flow-dot--one" r="4" />}
          {stage >= 3 && <circle className="vm-flow-dot vm-flow-dot--two" r="4" />}
          {stage >= 5 && <circle className="vm-flow-dot vm-flow-dot--three is-complete" r="4" />}
        </svg>

        <section className={`vm-node vm-planner${plannerActive ? ' is-active' : ''}${complete ? ' is-complete' : ''}`}>
          <header>
            <span>PLANNER</span>
            <b>{complete ? 'COMPLETE' : plannerActive ? 'ACTIVE' : 'STANDBY'}</b>
          </header>
          <div className="vm-node-body">
            {stage === 0 ? (
              <em>Awaiting input...</em>
            ) : complete ? (
              <div className="vm-complete-mark"><CheckCircle2 size={22} /> Plan executed</div>
            ) : (
              <>
                <div className="vm-thinking"><Loader2 size={15} /> Analyzing request...</div>
                {stage >= 2 && <code>└─ create_task_list(2 tasks)</code>}
              </>
            )}
          </div>
        </section>

        <section className={`vm-node vm-tasks${hasTasks ? ' is-active' : ''}${complete ? ' is-complete' : ''}`}>
          <header>
            <span>TASKS</span>
            <b>{hasTasks ? `${complete ? 2 : researchDone ? 1 : 0}/2` : '0/0'}</b>
          </header>
          <div className="vm-task-list">
            {!hasTasks ? <em>No tasks queued</em> : (
              <>
                <div className={researchDone ? 'done' : researchActive ? 'running' : ''}>
                  <i>{researchDone ? <Check size={10} /> : researchActive ? <Loader2 size={10} /> : null}</i>
                  <span>Research spatial AI patterns<small>RESEARCH</small></span>
                </div>
                <div className={coderDone ? 'done' : coderActive ? 'running' : ''}>
                  <i>{coderDone ? <Check size={10} /> : coderActive ? <Loader2 size={10} /> : null}</i>
                  <span>Build a visual brief<small>WEBCODER</small></span>
                </div>
              </>
            )}
          </div>
        </section>

        <section className={`vm-node vm-agents${researchActive || coderActive ? ' is-active' : ''}${coderDone ? ' is-complete' : ''}`}>
          <header><span>AGENTS</span><b>{researchActive || coderActive ? 'STREAMING' : coderDone ? '2 COMPLETE' : 'STANDBY'}</b></header>
          <div className="vm-agent-grid">
            <AgentMini
              label="RESEARCH"
              icon={<Search size={15} />}
              state={researchDone ? 'complete' : researchActive ? 'active' : 'idle'}
              tool={researchActive ? (stage === 3 ? 'EXTRACTING' : 'NAVIGATING') : undefined}
            />
            <AgentMini
              label="WEBCODER"
              icon={<Code2 size={15} />}
              state={coderDone ? 'complete' : coderActive ? 'active' : 'idle'}
              tool={coderActive ? 'WRITING' : undefined}
            />
          </div>
        </section>

        <section className={`vm-node vm-output${outputActive ? ' is-active' : ''}${complete ? ' is-complete' : ''}`}>
          <header><span>OUTPUT</span><b>{complete ? 'READY' : outputActive ? 'BUILDING' : 'STANDBY'}</b></header>
          <div className="vm-output-body">
            {complete ? (
              <>
                <div className="vm-file"><FileCode2 size={18} /><span>spatial-ai-brief.html<small>Generated successfully</small></span></div>
                <div className="vm-output-preview"><i /><i /><i /></div>
              </>
            ) : outputActive ? (
              <div className="vm-writing"><Loader2 size={19} /> Composing output...</div>
            ) : <em>Awaiting output...</em>}
          </div>
        </section>
      </div>

      <div className="vm-activity">
        <header><span>ACTIVITY LOG</span><b>{logs.length} events</b></header>
        <div>
          {logs.length ? logs.slice(-3).map(([type, message], index) => (
            <p key={`${type}-${message}`} style={{ '--vm-log-delay': `${index * 60}ms` } as React.CSSProperties}>
              <strong>[{type}]</strong><span>{message}</span>
            </p>
          )) : <em>Awaiting activity...</em>}
        </div>
      </div>

      <form
        className="vm-input"
        onSubmit={(event) => {
          event.preventDefault()
          if (input.trim()) runDemo()
        }}
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          disabled={stage > 0 && !complete}
          aria-label="Visible Manus demo request"
        />
        <button type="submit" aria-label="Run Visible Manus demo" disabled={!input.trim() || (stage > 0 && !complete)}>
          <Send size={15} />
        </button>
      </form>

    </div>
  )
}

function AgentMini({
  label,
  icon,
  state,
  tool,
}: {
  label: string
  icon: React.ReactNode
  state: 'idle' | 'active' | 'complete'
  tool?: string
}) {
  return (
    <div className={`vm-agent-mini is-${state}`}>
      <header><span>{icon}{label}</span>{state === 'complete' && <CheckCircle2 size={11} />}</header>
      <div>
        {state === 'active' ? <><Loader2 size={20} /><b>{tool}</b></> : state === 'complete' ? <><CheckCircle2 size={20} /><b>COMPLETE</b></> : <em>STANDBY</em>}
      </div>
    </div>
  )
}
