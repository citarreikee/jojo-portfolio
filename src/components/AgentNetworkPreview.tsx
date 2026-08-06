import './AgentNetworkPreview.css'

type AgentNetworkPreviewProps = {
  active: boolean
}

/**
 * The AgentNetwork-Red display demo is kept as a built, self-contained
 * preview so the work gallery shows the real network canvas and its runtime
 * choreography rather than a lookalike reconstruction.
 */
export default function AgentNetworkPreview({ active }: AgentNetworkPreviewProps) {
  return (
    <div
      className={`agent-network-preview${active ? ' is-active' : ''}`}
      aria-label="Interactive AgentNetwork-Red swarm display preview"
      onClick={(event) => event.stopPropagation()}
    >
      <iframe
        className="agent-network-preview__frame"
        src={`${import.meta.env.BASE_URL}agentnetwork/index.html?embedded=1&v=20260806-3`}
        title="AgentNetwork-Red display demo"
        loading="eager"
        scrolling="no"
      />
    </div>
  )
}
