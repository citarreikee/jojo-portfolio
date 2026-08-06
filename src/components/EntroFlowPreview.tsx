import { useEffect, useRef, useState } from 'react'
import './EntroFlowPreview.css'

type EntroFlowPreviewProps = { active: boolean }
type DemoState = 'idle' | 'running' | 'complete'

const terminalLines = [
  'device_search("office")',
  'device_status("F6_A")',
  'device_inspect("devices")',
  'device_control(6 actions)',
]

export default function EntroFlowPreview({ active }: EntroFlowPreviewProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const timersRef = useRef<number[]>([])
  const [stage, setStage] = useState(0)
  const [demoState, setDemoState] = useState<DemoState>('idle')

  const start = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    frameRef.current?.contentWindow?.postMessage({ type: 'entroflow-demo', action: 'start' }, '*')
    setStage(0)
    setDemoState('running')
    timersRef.current = [
      window.setTimeout(() => setStage(1), 1200),
      window.setTimeout(() => setStage(2), 3000),
      window.setTimeout(() => setStage(3), 4800),
      window.setTimeout(() => setStage(4), 6500),
      window.setTimeout(() => { setStage(5); setDemoState('complete') }, 15800),
    ]
  }

  const reset = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    frameRef.current?.contentWindow?.postMessage({ type: 'entroflow-demo', action: 'reset' }, '*')
    setStage(0)
    setDemoState('idle')
  }

  useEffect(() => {
    if (!active) reset()
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
      timersRef.current = []
    }
  }, [active])

  return (
    <div className={`entroflow-preview${active ? ' is-active' : ''}`} aria-label="EntroFlow 3D physical intelligence scene">
      <iframe
        ref={frameRef}
        className="entroflow-scene-frame"
        src={`${import.meta.env.BASE_URL}entroflow-scene/index.html?embed=1&v=20260807-2`}
        title="EntroFlow 3D scene"
        loading={active ? 'eager' : 'lazy'}
        allow="fullscreen"
        onLoad={() => { if (demoState === 'running') start() }}
      />
      <div className="entroflow-scene-vignette" aria-hidden="true" />
      <div className="entroflow-terminal" onClick={(event) => event.stopPropagation()}>
        <div className="entroflow-terminal__bar">
          <span className="entroflow-terminal__dots"><i /><i /><i /></span>
          <span>entroflow · agent session</span>
          <b>{demoState === 'complete' ? 'COMPLETE' : demoState === 'running' ? 'RUNNING' : 'READY'}</b>
        </div>
        <div className="entroflow-terminal__body">
          <p><em>user</em> Wake the office and prepare the room.</p>
          {terminalLines.map((line, index) => (
            <p key={line} className={stage > index ? 'is-visible' : ''}><em>tool</em> <code>{line}</code></p>
          ))}
          <p className={`entroflow-terminal__done${stage >= 5 ? ' is-visible' : ''}`}>✓ Office devices acknowledged</p>
          <button type="button" className="entroflow-terminal__action" onClick={demoState === 'running' ? undefined : demoState === 'complete' ? reset : start}>
            {demoState === 'complete' ? 'RESET SCENE' : demoState === 'running' ? 'RUNNING…' : 'RUN DEMO'}
          </button>
        </div>
      </div>
    </div>
  )
}
