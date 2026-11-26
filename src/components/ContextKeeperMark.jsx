export function KeeperMark({ compact = false }) {
  return (
    <span className={`keeper-mark${compact ? ' keeper-compact' : ''}`} aria-hidden="true">
      <i className="keeper-head" />
      <i className="keeper-body" />
      <i className="keeper-arm keeper-arm-left" />
      <i className="keeper-arm keeper-arm-right" />
      <b className="keeper-paper"><span /><span /></b>
      <em>Take your time</em>
    </span>
  )
}
