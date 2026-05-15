import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback } = this.props;

    if (hasError) {
      if (fallback) return fallback(error);
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            color: '#0f172a',
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Something went wrong</h1>
          <p style={{ marginBottom: 16, textAlign: 'center', maxWidth: 720, color: '#334155' }}>
            The page failed to render.
          </p>
          {error?.message && (
            <pre
              style={{
                maxWidth: 900,
                width: '100%',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 10,
                padding: 12,
                overflow: 'auto',
              }}
            >
              {error.message}
            </pre>
          )}
          <p style={{ marginTop: 12, color: '#64748b' }}>
            Please refresh the page.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

