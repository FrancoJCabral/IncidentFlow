export function AuthBrandPanel() {
  return (
    <section className="auth-brand-panel" aria-labelledby="auth-brand-title">
      <div className="auth-brand-content">
        <div className="auth-logo">
          <div className="brand-mark" aria-hidden="true"><span/><span/><span/></div>
          <span>IncidentFlow</span>
        </div>
        <div className="auth-brand-copy">
          <p className="auth-eyebrow">Incident operations</p>
          <h1 id="auth-brand-title">Incident management,<br/>without the chaos.</h1>
          <p>Track, prioritize and resolve incidents from one centralized workspace.</p>
        </div>
        <div className="workflow-visual" aria-hidden="true">
          <div className="workflow-path path-one"/>
          <div className="workflow-path path-two"/>
          <div className="workflow-card workflow-card-primary">
            <span className="workflow-icon">!</span>
            <div><small>Critical incident</small><strong>Payment API timeout</strong></div>
            <span className="workflow-status">Open</span>
          </div>
          <div className="workflow-node node-one"><span/></div>
          <div className="workflow-node node-two"><span/></div>
          <div className="workflow-card workflow-card-secondary">
            <span className="workflow-check">✓</span>
            <div><small>Workflow updated</small><strong>Assigned to operations</strong></div>
          </div>
          <div className="workflow-pulse pulse-one"/>
          <div className="workflow-pulse pulse-two"/>
        </div>
      </div>
      <p className="auth-brand-footer">Built for calm, connected operations.</p>
    </section>
  );
}
