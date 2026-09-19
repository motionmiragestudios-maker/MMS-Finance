export default function Loading() {
  return (
    <main className="page-loading p-8" aria-label="Loading page">
      <div className="page-loading-heading">
        <span className="page-loading-line page-loading-line-short" />
        <span className="page-loading-line page-loading-line-title" />
      </div>
      <div className="page-loading-grid">
        <span className="page-loading-panel" />
        <span className="page-loading-panel" />
        <span className="page-loading-panel" />
      </div>
      <span className="page-loading-content" />
    </main>
  );
}