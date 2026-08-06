import { useEffect, useRef, useState } from 'react'
import {
  Archive,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock3,
  Code2,
  FileText,
  LoaderCircle,
  Radio,
} from 'lucide-react'
import './ContextOSPreview.css'

type ContextOSPreviewProps = {
  active: boolean
}

type DemoStage = 0 | 1 | 2 | 3 | 4

const demoTimers = [1050, 1850, 2850, 4450]

export default function ContextOSPreview({ active }: ContextOSPreviewProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const timersRef = useRef<number[]>([])
  const [inView, setInView] = useState(false)
  const [stage, setStage] = useState<DemoStage>(0)

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
  }

  const runDemo = () => {
    clearTimers()
    setStage(0)
    requestAnimationFrame(() => {
      timersRef.current = demoTimers.map((delay, index) =>
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
      setStage(0)
    }
    return clearTimers
  }, [active, inView])

  const execute = () => {
    if (!active) return
    runDemo()
  }

  return (
    <div
      ref={rootRef}
      className={`context-os-preview is-stage-${stage}${active ? ' is-active' : ''}`}
      aria-label="Interactive ContextOS evidence-backed suggestion preview"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="cos-paper-grain" aria-hidden="true" />

      <header className="cos-topbar">
        <div className="cos-brand">
          <span className="cos-brand-mark"><i /></span>
          <strong>Context<span>OS</span></strong>
        </div>
        <div className="cos-capture"><i /><Radio size={10} /><span>STACK-CHAN</span><b>ONLINE</b></div>
      </header>

      <main className="cos-content">
        <div className="cos-heading">
          <div><span>AI 建议</span><h2>有几件事，值得现在决定。</h2></div>
          <div className="cos-count"><strong>3</strong><span>条等待判断</span></div>
        </div>

        <div className="cos-filters" aria-hidden="true">
          <span className="active">待处理 <b>3</b></span>
          <span>暂留 <b>0</b></span>
          <span>已归档 <b>1</b></span>
        </div>

        <section className="cos-board">
          <div className="cos-board-canvas">
            <article className="cos-note cos-note--yellow" aria-hidden="true">
              <span className="cos-tape" />
              <div className="cos-note-meta"><span>项目决策</span><span><FileText size={8} /> 4</span></div>
              <h3>冻结 Stack-chan Recorder，作为第一个 Source Adapter</h3>
              <p>当前录音、转写和说话人流程已经可用。继续往里面堆产品功能，会让采集器和上下文中心再次耦合。</p>
              <div className="cos-source">产品讨论 · 12 分钟前</div>
              <div className="cos-note-mini-actions"><span><ArrowUpRight size={8} /> 执行</span><span><Clock3 size={8} /> 暂留</span><span><Archive size={8} /></span></div>
            </article>

            <article className="cos-note cos-note--blue">
              <span className="cos-tape" aria-hidden="true" />
              <div className="cos-note-meta"><span>下一步</span><span><FileText size={8} /> 7</span></div>
              <h3>把“会议决定 → Codex 执行”设为第一条证明链路</h3>
              <p>这是目前唯一能同时证明硬件采集、长期上下文和 Agent 执行价值的完整闭环。</p>
              <div className="cos-source">产品路线 · 今天 14:26</div>

              <div className={`cos-execution${stage >= 4 ? ' done' : ''}`} aria-live="polite">
                {stage >= 4 ? <CheckCircle2 size={9} /> : stage >= 2 ? <LoaderCircle className="cos-spin" size={9} /> : stage >= 1 ? <ArrowUpRight size={9} /> : <FileText size={9} />}
                <span>{stage >= 4 ? '执行完成 · 3 files verified' : stage >= 2 ? 'Codex 正在执行' : stage >= 1 ? '任务已准备，等待执行' : '正在核对 7 条原始证据'}</span>
              </div>

              <div className="cos-note-mini-actions">
                <button type="button" onClick={execute}>{stage >= 2 && stage < 4 ? <LoaderCircle className="cos-spin" size={8} /> : stage >= 4 ? <Check size={8} /> : <ArrowUpRight size={8} />}{stage >= 4 ? '重播' : stage >= 2 ? '执行中' : '执行'}</button>
                <span><Clock3 size={8} /> 暂留</span><span><Archive size={8} /></span>
              </div>
            </article>

            <article className="cos-note cos-note--coral" aria-hidden="true">
              <span className="cos-tape" />
              <div className="cos-note-meta"><span>未验证风险</span><span><FileText size={8} /> 3</span></div>
              <h3>户外 TF 卡链路仍未完成物理验证</h3>
              <p>代码和协议已写完，但没有真实卡片测试。它不应被记为“已完成”。</p>
              <div className="cos-source">Stack-chan 项目 · 昨天</div>
              <div className="cos-note-mini-actions"><span><ArrowUpRight size={8} /> 执行</span><span><Clock3 size={8} /> 暂留</span><span><Archive size={8} /></span></div>
            </article>

            <article className="cos-note cos-note--lavender" aria-hidden="true">
              <span className="cos-tape" />
              <div className="cos-note-meta"><span>产品原则</span><span><FileText size={8} /> 11</span></div>
              <h3>静仪反复强调：主动洞察应当优先于空白问答框</h3>
              <p>她在 89 分钟讨论中从会议、项目和人物三个角度重复了这一点。这不是偶然偏好，而是核心产品判断。</p>
              <div className="cos-source">与静仪的讨论 · Jul 19</div>
              <div className="cos-note-mini-actions"><span><ArrowUpRight size={8} /> 执行</span><span><Clock3 size={8} /> 暂留</span><span><Archive size={8} /></span></div>
            </article>
          </div>
        </section>
      </main>

      <div className="cos-local-note"><i /> Evidence stays local · actions require approval</div>
    </div>
  )
}
