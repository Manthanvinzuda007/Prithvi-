import './TeacherLoadingPage.css';

export default function TeacherLoadingPage() {
  return (
    <div className="teacher-loading-page">
      <div className="tl-center">
        <div className="tl-logo">
          <span>🌍</span>
          <span className="tl-logo-text">PRITHVI</span>
        </div>
        <div className="tl-subtitle">Teacher Portal</div>

        {/* Skeleton preview of dashboard */}
        <div className="tl-skeleton-preview">
          <div className="prithvi-skeleton-shimmer tl-sk-banner" />
          <div className="tl-sk-stats-row">
            {[1,2,3,4].map(i => (
              <div key={i} className="prithvi-skeleton-shimmer tl-sk-stat" />
            ))}
          </div>
          <div className="tl-sk-grid">
            <div className="prithvi-skeleton-shimmer tl-sk-main" />
            <div className="prithvi-skeleton-shimmer tl-sk-side" />
          </div>
        </div>

        {/* Thin professional loading bar */}
        <div className="tl-bar-track">
          <div className="tl-bar-fill" />
        </div>
        <p className="tl-loading-text">Loading your dashboard...</p>
      </div>
    </div>
  );
}
